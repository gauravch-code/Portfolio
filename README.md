# Gaurav Chintakunta's portfolio

A static GitHub Pages portfolio: four AI projects with embedded live demos, a live list of open-source contributions, and a short about section. It is designed for reading first, with a serif display face, a readable sans for body text, and high-contrast type on a matte dark background.

## Development

Serve this directory over HTTP (ES modules cannot run from `file://`):

```sh
npx --yes http-server . -p 4173 -c-1
```

No build step or backend is required. GitHub Pages serves `main` directly. Lucide 0.468.0 is pinned and self-hosted in `vendor/`. Instrument Serif, Instrument Sans, and Geist Mono are self-hosted in `assets/fonts/`, with their licenses and system-font fallbacks.

## Content

- `data.js`: projects, display names for repositories, and a dated contribution snapshot.
- `inside.js`: the "Inside" panel under each project (Winnow's threshold dial, TraceGuard's review flow, the SRE escalation chart, Toolgen's run comparison). Figures come from each repository's own docs.
- `app.js`: project rendering, GitHub refresh, the demo dialog, copy email, and navigation state.
- `styles.css`: layout, typography, responsive rules, and reduced-motion handling.

Contributions refresh from the public GitHub search API, with the dated snapshot as a fallback and a 15-minute optional local cache. Closed pull requests that were never merged are left out.

## Verification

The browser smoke test requires Playwright and Chrome. Set `PLAYWRIGHT_MODULE` to an installed Playwright module path if it is not resolvable normally. `BROWSER_CHANNEL` defaults to `chrome` (use `msedge` for Edge). Then run:

```sh
node tests/smoke.cjs http://localhost:4173
```

Screenshots go to the ignored `artifacts/` folder. The test covers responsive overflow from 320 to 1920 pixels, project and contribution rendering, the in-review list, the demo dialog and focus return, copy email, reduced motion, and page errors.
