"""Check generated HTML, metadata, local links/fragments, and sitemap coverage.
Run after pnpm build: python3 scripts/check-built-links.py
"""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit
import xml.etree.ElementTree as ET
import json

ROOT = Path(__file__).resolve().parents[1] / 'dist'

class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.path, self.ids, self.links = path, set(), []
        self.meta, self.jsonld, self.script = {}, [], None
        self.h1, self.canonical, self.description = 0, None, False
        self.feed(path.read_text())

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            assert attrs['id'] not in self.ids, f'{self.path}: duplicate ID {attrs["id"]}'
            self.ids.add(attrs['id'])
        if tag == 'meta':
            self.meta[attrs.get('property', attrs.get('name'))] = attrs.get('content')
        if tag == 'script' and attrs.get('type') == 'application/ld+json':
            self.script = ''
        if tag == 'a':
            self.links.append(attrs.get('href', ''))
        if tag == 'h1':
            self.h1 += 1
        if tag == 'link' and attrs.get('rel') == 'canonical':
            self.canonical = attrs.get('href')
        if tag == 'meta' and attrs.get('name') == 'description':
            self.description = bool(attrs.get('content'))

    def handle_data(self, data):
        if self.script is not None:
            self.script += data

    def handle_endtag(self, tag):
        if tag == 'script' and self.script is not None:
            self.jsonld.append(json.loads(self.script))
            self.script = None

pages = {}
for file in ROOT.rglob('*.html'):
    route = '/' + file.relative_to(ROOT).as_posix().removesuffix('index.html')
    pages[route] = Page(file)
assert len(pages) >= 12, f'Expected landing, 3 products and 8 new pages; got {len(pages)}'
for route, page in pages.items():
    assert page.h1 == 1, f'{route}: expected one h1, got {page.h1}'
    assert page.description and page.canonical, f'{route}: missing SEO metadata'
    assert urlsplit(page.canonical).path == route, f'{route}: wrong canonical'
    for href in page.links:
        assert href and href != '#', f'{route}: empty/placeholder link'
        url = urlsplit(urljoin('https://origentolima.com' + route, href))
        if url.scheme not in ('http', 'https') or url.netloc != 'origentolima.com':
            continue
        target_route = unquote(url.path)
        target = pages.get(target_route) or pages.get(target_route.rstrip('/') + '/')
        if target is None:
            assert (ROOT / target_route.lstrip('/')).is_file(), f'{route}: missing {href}'
        elif url.fragment:
            assert unquote(url.fragment) in target.ids, f'{route}: missing fragment {href}'
urls = ET.parse(ROOT / 'sitemap.xml').findall('{*}url/{*}loc')
sitemap_paths = {urlsplit(node.text).path for node in urls}
assert set(pages) == sitemap_paths, f'Sitemap mismatch: {set(pages) ^ sitemap_paths}'
for route, page in pages.items():
    assert page.meta.get('og:url') == page.canonical, f'{route}: inconsistent social canonical'
    assert urlsplit(page.meta.get('og:image', '')).scheme == 'https', f'{route}: social image must be absolute HTTPS'
    if route.startswith('/historias/') and route != '/historias/':
        assert page.meta.get('og:type') == 'article', f'{route}: missing article Open Graph type'
        graph = [node for block in page.jsonld for node in block.get('@graph', [block])]
        article = next(node for node in graph if node.get('@type') == 'Article')
        breadcrumbs = next(node for node in graph if node.get('@type') == 'BreadcrumbList')
        assert article['mainEntityOfPage']['@id'] == page.canonical
        assert article['datePublished'] == page.meta.get('article:published_time')
        assert article.get('dateModified') == page.meta.get('article:modified_time')
        assert article['image']['url'] == page.meta['og:image']
        assert breadcrumbs['itemListElement'][-1]['item'] == page.canonical
        sitemap_entry = next(node for node in ET.parse(ROOT / 'sitemap.xml').findall('{*}url') if node.find('{*}loc').text == page.canonical)
        assert sitemap_entry.find('{*}lastmod').text == article.get('dateModified', article['datePublished'])
print(f'PASS: {len(pages)} pages; metadata, local links, fragments, IDs and sitemap coverage')
