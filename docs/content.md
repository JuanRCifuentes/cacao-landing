# Editing page content

Page copy is loaded through Astro's build-time Content Layer. Changes are validated against `src/content.config.ts` and rendered as static HTML; content fetching adds no browser JavaScript.

| File | Content |
| --- | --- |
| `src/content/site/main.json` | Page title, description, language, social preview metadata, and menu control labels |
| `src/content/landing-sections/hero.md` | Hero copy, image, and header navigation links |
| `src/content/landing-sections/products.md` | Product sample cards, descriptions, images, and links |
| `src/content/products/*.json` | Product detail page titles, SEO descriptions, flavor notes, preparation suggestions, and FAQs |
| `src/content/landing-sections/pure-passion.md` | Editorial copy, photos, and captions |
| `src/content/landing-sections/video.md` | Film copy, accessible play label, poster, and video sources |
| `src/content/landing-sections/heritage.md` | Heritage copy, collage photos, and link |
| `src/content/landing-sections/partnerships-news.md` | Featured article references and section link |
| `src/content/articles/*.md` | Article frontmatter, SEO metadata, and Markdown bodies |
| `src/content/landing-sections/newsletter.md` | Registration copy, field labels, and background |
| `src/content/footer/main.md` | Shared brand name and tagline, accessible footer labels, links, email, phone, and location |

The landing-section and footer Markdown entries use YAML frontmatter between `---` markers; their bodies are unused. Keep each section's `type` unchanged. Components use `getLandingSection()` to validate the expected section type before reading its fields. Article Markdown bodies are rendered at build time using Astro's `render()` API.

The page is written in Colombian Spanish (`es-CO`, with Open Graph locale `es_CO`). Brand copy is adapted from the Origen Tolima packaging: its roots in San Sebastián de Mariquita, patient craft, care for water and native forests, and the invitation to pause with each cup. Contact details also come from the packaging. Keep UI labels, image descriptions, and social preview copy in Spanish when editing content.

The section order and visual behavior remain in the Astro components. See [product images](./product-images.md), [hero image](./hero-image.md), and [heritage images](./heritage-images.md) for asset notes.

Run `pnpm build` after editing to check schemas and regenerate the static page.

## Product pages

The three detail pages are generated at `/productos/cacao-puro-100/`, `/productos/cacao-75-panela/`, and `/productos/cacao-75-stevia/`. Each JSON entry is joined to the existing landing card by `landingId`, so imagery and WhatsApp order messages have one source. Homepage cards and related product cards link to the generated pages.

Customers arriving at `/#products` can also order directly: each homepage card places a filled «Pedir mi cacao» WhatsApp button below «Descubrir este cacao». The order label and product-specific message are editable in `src/content/landing-sections/products.md`; the destination phone number comes from the shared footer contact.

`src/components/SEOHead.astro` provides canonical URLs, unique metadata, and social previews. Product pages include Product, Organization, and BreadcrumbList JSON-LD. Prices, stock, reviews, delivery promises, certifications, and unverified dietary claims are intentionally omitted. Without verified offer or review data, Product markup alone does not establish eligibility for Google's product rich results. Preparation copy is general serving guidance, with the package instructions taking precedence.

The sitemap and robots.txt are generated during the static build. The production origin defaults to `https://origentolima.com`; `SITE_URL` can explicitly override it. Preview deployment URLs are not used as canonical origins. Routes use trailing slashes consistently.

## History, stories, and policy pages

The remaining landing-page destinations share `src/layouts/EditorialLayout.astro`,
which provides the site header/footer, SEO metadata, breadcrumbs, skip link, and
responsive typography. History lives at `/historia/`; `/historias/` lists all
published articles, newest first. Each article lives in `src/content/articles/`
as one Markdown file containing its frontmatter and body. Its filename defines
the URL: `cuidar-el-origen.md` generates `/historias/cuidar-el-origen/`. Use lowercase
letters, numbers, and hyphens; keep existing filenames stable to preserve URLs.

To add an article, create a file with this shape:

```md
---
title: Una nueva historia de nuestro cacao
description: Una descripción breve para la introducción, las tarjetas y los buscadores.
publishedDate: "2026-10-02"
category: Origen
image:
  src: /images/historias/nueva-historia.jpg
  alt: Una descripción de la fotografía en español
  width: 1200
  height: 900
  type: image/jpeg
draft: true
---

## Un primer capítulo

Escribe aquí el artículo usando párrafos, enlaces, listas y encabezados Markdown.
```

Use quoted ISO dates (`YYYY-MM-DD`) for `publishedDate` and optional `modifiedDate`.
The schema rejects impossible dates and modification dates before publication.
Add `modifiedDate` when the article changes; it supplies article metadata and the
sitemap's last modification date. The image requires a source (an absolute HTTP(S)
URL or path starting with `/`), Spanish alt text, and positive integer dimensions.
Its optional `type` is the known MIME type; omit it for images with automatic
format negotiation. Optional `seo.title` and `seo.description` override search
and social metadata while the visible heading and introduction keep using `title`
and `description`.

The page supplies its own main heading from `title`; start body headings at `##`.
Published articles must have a nonempty body and cannot contain an `h1`. Set
`draft: true` while writing. Drafts are omitted from public routes, the article
index, related links, homepage features, and sitemap; omit `draft` or set it to
`false` to publish on the next build.

The homepage's three featured articles are Astro collection references in
`src/content/landing-sections/partnerships-news.md`, for example
`articles: [en-el-corazon-de-nuestra-cordillera, un-legado-que-se-comparte-en-cada-taza, cuidar-el-origen]`.
Their order controls the homepage cards. Headings, excerpts, dates, categories,
and images come directly from the referenced Markdown entries. Missing or duplicate
references fail the build; a referenced draft is hidden. New published articles
appear in `/historias/` and receive their own route without being featured.

Article pages include Article and BreadcrumbList JSON-LD, canonical URLs, article
Open Graph metadata, and social image dimensions. Markdown renders into the
static HTML, so the complete article is available to readers and search crawlers
without browser JavaScript.

Privacy, terms, and shipping/returns content lives in the three corresponding
Astro page files. The copy describes the existing WhatsApp/email ordering flow.
Before publishing business-specific policy commitments, confirm them with the
business owner; the repository does not define delivery prices, service timelines,
retention periods, or the operator's legal identity.

The newsletter section opens an explicit email request instead of submitting to
an unconfigured backend. Social entries with `href: "#"` are hidden until actual
profile URLs are configured in footer content.

After changing routes or links, run:

```sh
pnpm build
python3 scripts/check-built-links.py
```

The check validates generated local destinations and fragments, metadata,
unique IDs, one main heading per page, and complete sitemap coverage.

To check the Markdown article workflow after changing its schema or routes, run
`python3 scripts/check-article-content.py`. It builds temporary published and draft
articles, checks their HTML and SEO metadata, and verifies invalid content fails
the build. It restores the original content and baseline build afterward. Run it
separately from other build commands.
