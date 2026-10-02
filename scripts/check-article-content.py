"""Exercise the article authoring workflow with temporary content and real builds.

Run: python3 scripts/check-article-content.py
Requires the existing pnpm dependencies. Restores source content and the baseline
build even when an assertion fails. Do not run concurrently with another build.
"""
from html.parser import HTMLParser
from pathlib import Path
import json
import os
import subprocess
import tempfile
import textwrap
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist'
SLUG = 'fixture-article-regression'
HREF = f'/historias/{SLUG}/'
FIXTURE = ROOT / 'src/content/articles' / f'{SLUG}.md'
FEATURES = ROOT / 'src/content/landing-sections/partnerships-news.md'
FEATURED_SLUG = 'en-el-corazon-de-nuestra-cordillera'
FRONTMATTER = textwrap.dedent('''\
---
title: Una historia de prueba
description: Una introducción visible para la historia de prueba.
publishedDate: "2026-10-02"
modifiedDate: "2026-10-03"
category: Origen de prueba
image:
  src: https://images.unsplash.com/photo-1781453642070-7e21b8246e9d?auto=format&fit=crop&w=1200&q=85
  alt: Mazorcas de cacao para la historia de prueba
  width: 1200
  height: 900
seo:
  title: Cacao de prueba para buscadores
  description: Una descripción SEO para la historia de prueba.
draft: false
---
''')
BODY = '\n## Un capítulo de prueba\n\nUn párrafo con **cacao** y [nuestro origen](/historia/).\n\n- Tierra\n- Tradición\n'


class Page(HTMLParser):
    def __init__(self, file):
        super().__init__()
        self.meta, self.headings, self.jsonld = {}, [], []
        self.heading, self.title, self.script, self.canonical = None, '', None, None
        self.in_title = False
        self.html = file.read_text()
        self.feed(self.html)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'meta':
            self.meta[attrs.get('property', attrs.get('name'))] = attrs.get('content')
        if tag in ('h1', 'h3'):
            self.heading = [tag, '']
        if tag == 'title' and not self.title:
            self.in_title = True
        if tag == 'script' and attrs.get('type') == 'application/ld+json':
            self.script = ''
        if tag == 'link' and attrs.get('rel') == 'canonical':
            self.canonical = attrs.get('href')

    def handle_data(self, text):
        if self.heading is not None:
            self.heading[1] += text
        if self.in_title:
            self.title += text
        if self.script is not None:
            self.script += text

    def handle_endtag(self, tag):
        if self.heading is not None and tag == self.heading[0]:
            self.headings.append(tuple(self.heading))
            self.heading = None
        if tag == 'title':
            self.in_title = False
        if tag == 'script' and self.script is not None:
            self.jsonld.append(json.loads(self.script))
            self.script = None


def sitemap_entry(href):
    for item in ET.parse(DIST / 'sitemap.xml').findall('{*}url'):
        if item.find('{*}loc').text.endswith(href):
            return item
    return None


def assert_hidden():
    assert not (DIST / HREF.lstrip('/') / 'index.html').exists(), 'Draft received a public route'
    assert sitemap_entry(HREF) is None, 'Draft appeared in the sitemap'
    for file in DIST.rglob('*.html'):
        assert HREF not in file.read_text(), f'Draft linked from {file}'


def main():
    assert not FIXTURE.exists(), f'Refusing to overwrite {FIXTURE}'
    original_features = FEATURES.read_bytes()
    with tempfile.TemporaryDirectory(prefix='astro-article-check-') as config_dir:
        env = {**os.environ, 'ASTRO_TELEMETRY_DISABLED': '1', 'XDG_CONFIG_HOME': config_dir}

        def build(label, expected_error=None):
            result = subprocess.run(['pnpm', 'build'], cwd=ROOT, env=env, text=True,
                                    stdout=subprocess.PIPE, stderr=subprocess.STDOUT, timeout=60)
            if expected_error is None:
                assert result.returncode == 0, f'{label}: build failed\n{result.stdout}'
            else:
                assert result.returncode != 0, f'{label}: invalid content was accepted'
                assert expected_error in result.stdout, f'{label}: unexpected failure\n{result.stdout}'
            print(f'PASS: {label}', flush=True)

        try:
            FIXTURE.write_text(FRONTMATTER + BODY)
            build('new published Markdown article')
            page = Page(DIST / HREF.lstrip('/') / 'index.html')
            assert [text for tag, text in page.headings if tag == 'h1'] == ['Una historia de prueba']
            assert page.title == 'Cacao de prueba para buscadores', repr(page.title)
            assert page.meta['description'] == 'Una descripción SEO para la historia de prueba.'
            assert 'Una introducción visible para la historia de prueba.' in page.html
            assert '<strong>cacao</strong>' in page.html and '<li>Tierra</li>' in page.html
            assert page.meta['og:type'] == 'article'
            assert page.meta['article:published_time'] == '2026-10-02'
            assert page.meta['article:modified_time'] == '2026-10-03'
            assert page.meta['article:section'] == 'Origen de prueba'
            assert page.meta['og:image:width'] == '1200' and page.meta['og:image:height'] == '900'
            assert 'og:image:type' not in page.meta, 'An unknown image format was invented'
            graph = next(item['@graph'] for item in page.jsonld if '@graph' in item)
            article = next(item for item in graph if item['@type'] == 'Article')
            assert article['headline'] == 'Una historia de prueba'
            assert article['datePublished'] == '2026-10-02' and article['dateModified'] == '2026-10-03'
            breadcrumbs = next(item for item in graph if item['@type'] == 'BreadcrumbList')
            assert breadcrumbs['itemListElement'][-1]['item'] == page.canonical
            index = Page(DIST / 'historias/index.html')
            assert next(text for tag, text in index.headings if tag == 'h3') == 'Una historia de prueba'
            assert HREF not in (DIST / 'index.html').read_text(), 'New article was featured without a reference'
            item = sitemap_entry(HREF)
            assert item is not None and item.find('{*}lastmod').text == '2026-10-03'

            FEATURES.write_text(original_features.decode().replace(FEATURED_SLUG, SLUG))
            build('published homepage reference')
            assert HREF in (DIST / 'index.html').read_text()

            FIXTURE.write_text(FRONTMATTER.replace('draft: false', 'draft: true') + BODY)
            build('draft omitted from routes, features, index, related links, and sitemap')
            assert_hidden()
            FEATURES.write_bytes(original_features)

            rejected = [
                ('impossible ISO date', FRONTMATTER.replace('2026-10-02', '2026-02-29') + BODY, 'publishedDate'),
                ('modification before publication', FRONTMATTER.replace('2026-10-03', '2026-10-01') + BODY, 'modifiedDate'),
                ('missing title', FRONTMATTER.replace('title: Una historia de prueba', 'title: ""') + BODY, 'title'),
                ('invalid image dimensions', FRONTMATTER.replace('width: 1200', 'width: 0') + BODY, 'width'),
                ('Markdown h1', FRONTMATTER + '\n# Duplicate main heading\n\nTexto.\n', 'level two'),
                ('HTML h1', FRONTMATTER + '\n<h1>Duplicate main heading</h1>\n\nTexto.\n', 'level two'),
                ('empty article body', FRONTMATTER, 'Markdown body'),
                ('comment-only article body', FRONTMATTER + '\n<!-- No published content -->\n', 'Markdown body'),
            ]
            for label, content, error in rejected:
                FIXTURE.write_text(content)
                build(label, error)

            FIXTURE.unlink()
            FEATURES.write_text(original_features.decode().replace(FEATURED_SLUG, 'missing-article-fixture'))
            build('missing featured reference', 'Missing featured article')
            FEATURES.write_text(original_features.decode().replace('cuidar-el-origen', FEATURED_SLUG))
            build('duplicate featured reference', 'Duplicate featured article')
        finally:
            FIXTURE.unlink(missing_ok=True)
            FEATURES.write_bytes(original_features)
            build('restored baseline')
    print('PASS: article content workflow and authoring validation')


if __name__ == '__main__':
    main()
