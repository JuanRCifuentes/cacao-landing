# Editing page content

Page copy is loaded through Astro's build-time Content Layer. Changes are validated against `src/content.config.ts` and rendered as static HTML; content fetching adds no browser JavaScript.

| File | Content |
| --- | --- |
| `src/content/site/main.json` | Page title, description, language, social preview metadata, and menu control labels |
| `src/content/landing-sections/hero.md` | Hero copy, image, and header navigation links |
| `src/content/landing-sections/products.md` | Product sample cards, descriptions, images, and links |
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
