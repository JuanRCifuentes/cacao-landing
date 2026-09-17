# Animation and performance notes

The page builds to static HTML and CSS. Astro content queries run at build time; no UI framework or animation library is shipped to the browser. See [content editing](./content.md).

- Section entrances use CSS opacity and transform transitions. An IntersectionObserver starts each reveal once and then stops observing it. Horizontal cards reveal together.
- Heritage retains its image drift. Its passive scroll handler runs only while the section is visible, using cached geometry and at most one animation frame per scroll update. CSS interpolates the transform.
- Navigation and settled-scroll checks handle deep links and skipped content without scanning the page on every scroll frame. Keyboard focus reveals content immediately.
- Intro measurements are batched before style changes. Finished hero/logo animations release their animation-owned transforms. The header updates only when its scroll state or measured height changes.
- Reduced motion, missing observers, and disabled JavaScript leave content visible. The menu has a normal link fallback, and video has native controls without JavaScript.
- Images decode asynchronously and below-fold images load lazily. Video uses `preload="none"`. Asset URLs, encodings, and resolutions are unchanged; asset tuning is deferred.

## Verification, 2026-09-17

Production build and Astro type checking pass (18 files, no errors, warnings, or hints). Browser checks passed in Chromium, Firefox 155, and WebKit 26.6 at 402 × 700 and 1440 × 900: opening choreography, first entrances, persistent visibility, Heritage drift, horizontal cards, menu behavior, reduced motion, missing observers, deep links, and no-JavaScript fallbacks. No page errors or horizontal overflow were observed.

An instrumented Chromium run scrolled the production page downward in 140px animation-frame steps, comparing the previous commit with this version. Counts below are JavaScript API calls during that scroll, not browser-internal layout operations or a frame-rate guarantee.

| Viewport | Layout reads before → after | Computed-style reads before → after |
| --- | --- | --- |
| 402 × 700 | 567 → 1 | 417 → 0 |
| 1440 × 900 | 715 → 2 | 475 → 0 |

The final production JavaScript totals 7,903 bytes, or 2,661 bytes with gzip (estimated locally; actual transfer compression depends on hosting). No new project dependencies were added. The measured run recorded no long tasks or cumulative layout shift; remote assets and physical-device rendering remain separate variables.

Browser support follows the existing [Tailwind 4 baseline](https://tailwindcss.com/docs/compatibility): Chrome 111+, Safari 16.4+, and Firefox 128+. Animations use standard CSS transitions/keyframes rather than experimental scroll timelines. WebKit automation covers the engine, not native iPhone Safari's browser chrome or every device's GPU.
