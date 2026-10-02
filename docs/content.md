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
| `src/content/landing-sections/partnerships-news.md` | News cards and section link |
| `src/content/landing-sections/newsletter.md` | Registration copy, field labels, and background |
| `src/content/footer/main.md` | Shared brand name and tagline, accessible footer labels, links, email, phone, and location |

The Markdown entries use YAML frontmatter between `---` markers; their bodies are unused. Keep each section's `type` unchanged. Components use `getLandingSection()` to validate the expected section type before reading its fields.

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
responsive typography. History lives at `/historia/`; `/historias/` lists the three
articles linked from the landing page. Their headlines, images, dates, and excerpts
come from `src/content/landing-sections/partnerships-news.md`; article bodies live
in `src/lib/stories.ts`.

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
