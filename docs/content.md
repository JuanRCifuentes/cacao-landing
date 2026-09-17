# Editing page content

Page copy is loaded through Astro's build-time Content Layer. Changes are validated against `src/content.config.ts` and rendered as static HTML; content fetching adds no browser JavaScript.

| File | Content |
| --- | --- |
| `src/content/site/main.json` | Page title, description, language, and menu control labels |
| `src/content/landing-sections/hero.md` | Hero copy, image, and header navigation links |
| `src/content/landing-sections/products.md` | Product sample cards, descriptions, images, and links |
| `src/content/landing-sections/pure-passion.md` | Editorial copy, photos, and captions |
| `src/content/landing-sections/video.md` | Film copy, accessible play label, poster, and video sources |
| `src/content/landing-sections/heritage.md` | Heritage copy, collage photos, and link |
| `src/content/landing-sections/partnerships-news.md` | News cards and section link |
| `src/content/landing-sections/newsletter.md` | Registration copy, field labels, and background |
| `src/content/footer/main.md` | Shared brand name and tagline, footer links, and contact details |

The Markdown entries use YAML frontmatter between `---` markers; their bodies are unused. Keep each section's `type` unchanged. Components use `getLandingSection()` to validate the expected section type before reading its fields.

The section order and visual behavior remain in the Astro components. See [product images](./product-images.md) and [hero image](./hero-image.md) for asset notes.

Run `pnpm build` after editing to check schemas and regenerate the static page.
