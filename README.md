# Gaurav Chintakunta's portfolio

A static GitHub Pages portfolio: four AI projects with embedded live demos, a live list of open-source contributions, and a short about section. A real waterfall plays behind the whole page, and the content sits on frosted panels so the water stays in view all the way down. Visitors can turn on forest and waterfall sound, switch between day and night, or hide the page and just watch.

## Development

Serve this directory over HTTP (ES modules cannot run from `file://`):

```sh
npx --yes http-server . -p 4173 -c-1
```

No build step or backend is required. GitHub Pages serves `main` directly. Lucide 0.468.0 is pinned and self-hosted in `vendor/`. Instrument Serif, Instrument Sans, and Geist Mono are self-hosted in `assets/fonts/`, with their licenses and system-font fallbacks.

## Content

- `data.js`: projects, display names for repositories, and a dated contribution snapshot.
- `inside.js`: the "Inside" panel under each project (Winnow's threshold dial, TraceGuard's review flow, the SRE escalation chart, Toolgen's run comparison). Figures come from each repository's own docs.
- `ambience.js`: the optional sound. It loads a forest-stream recording and a waterfall recording on first use, loops them with overlapping fades, and lets the birds recede at night.
- `app.js`: project rendering, GitHub refresh, the demo dialog, copy email, navigation state, the backdrop video, and the ambience dock.
- `styles.css`: layout, typography, responsive rules, and reduced-motion handling.

Contributions refresh from the public GitHub search API, with the dated snapshot as a fallback and a 15-minute optional local cache. Closed pull requests that were never merged are left out.

## Backdrop and sound credits

- Video (`assets/waterfall-*.mp4`, poster): "Slow Motion of Waterfalls" by Alan Ford on Pexels, https://www.pexels.com/video/slow-motion-of-waterfalls-8050132/. Stabilized, mirrored, colour-graded, and cut to a 14-second loop.
- Forest and stream (`assets/forest.m4a`): "Birds singing at stream" by enhuber on Freesound, CC0, https://freesound.org/s/517913/. A 96-second cut, gently compressed with the top end softened.
- Waterfall (`assets/falls.m4a`): "small waterfall in the forest sound effect" by Garuda1982 on Freesound, CC0, https://freesound.org/s/577820/. Low-pass filtered so only the soft body of the water remains.

The video is free to use and modify under the Pexels licence, and both recordings are public domain (CC0). The video plays muted; when the visitor prefers reduced motion it stays paused on the poster frame. Sound never starts on its own.

## Verification

The browser smoke test requires Playwright and Chrome. Set `PLAYWRIGHT_MODULE` to an installed Playwright module path if it is not resolvable normally. `BROWSER_CHANNEL` defaults to `chrome` (use `msedge` for Edge). Then run:

```sh
node tests/smoke.cjs http://localhost:4173
```

Screenshots go to the ignored `artifacts/` folder. The test covers responsive overflow from 320 to 1920 pixels, project and contribution rendering, the in-review list, the demo dialog and focus return, copy email, reduced motion, and page errors.
