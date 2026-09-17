# Product imagery

The product cards use representative photographs from Unsplash. They are sample chocolate imagery, not photographs of Origen Tolima's actual products or packaging, and do not establish the photographed chocolate's cacao percentage or ingredients. The product variants (100% cacao and 80% cacao with panela) were supplied by the user; their names, descriptions, and images remain editable in `src/content/landing-sections/products.md`.

## Sources

Both photographs are by [Tetiana Bykovets](https://unsplash.com/@tetiana_bykovets) and are free to use under the [Unsplash License](https://unsplash.com/license). The source pages identify them as free photographs rather than Unsplash+ assets.

| Card | Photograph | Image URL |
| --- | --- | --- |
| 100% Cacao | [Chocolate bar on white table](https://unsplash.com/photos/chocolate-bar-on-white-table-TzN2odwnesg) | [900 × 600 JPEG](https://images.unsplash.com/photo-1623660053975-cf75a8be0908?fm=jpg&fit=crop&w=900&h=600&q=85) |
| 80% Cacao · Con panela | [Chocolate bars on white table](https://unsplash.com/photos/chocolate-bars-on-white-table-H22N-9s8AUw) | [900 × 600 JPEG](https://images.unsplash.com/photo-1610450949065-1f2841536c88?fm=jpg&fit=crop&w=900&h=600&q=85) |

The images are served directly from Unsplash's image CDN with a 3:2 crop. The URLs request JPEG explicitly (`fm=jpg`) for predictable browser decoding. Both URLs were checked on 2026-09-17: HTTP 200, `image/jpeg`, 900 × 600 pixels. The crops were visually inspected before use.
