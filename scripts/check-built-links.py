"""Check generated HTML, metadata, local links/fragments, and sitemap coverage.
Run after pnpm build: python3 scripts/check-built-links.py
"""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1] / 'dist'

class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.path, self.ids, self.links = path, set(), []
        self.h1, self.canonical, self.description = 0, None, False
        self.feed(path.read_text())

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            assert attrs['id'] not in self.ids, f'{self.path}: duplicate ID {attrs["id"]}'
            self.ids.add(attrs['id'])
        if tag == 'a':
            self.links.append(attrs.get('href', ''))
        if tag == 'h1':
            self.h1 += 1
        if tag == 'link' and attrs.get('rel') == 'canonical':
            self.canonical = attrs.get('href')
        if tag == 'meta' and attrs.get('name') == 'description':
            self.description = bool(attrs.get('content'))

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
print(f'PASS: {len(pages)} pages; metadata, local links, fragments, IDs and sitemap coverage')
