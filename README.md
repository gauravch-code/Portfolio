# Gaurav Chintakunta's portfolio

A static GitHub Pages portfolio: four AI projects with embedded live demos, a live list of open-source contributions, and a short about section. A real waterfall plays behind the whole page, and the content sits on frosted panels so the water stays in view all the way down. Visitors can turn on a lofi track over falling water, switch between day and night, or hide the page and just watch.

## Development

Serve this directory over HTTP (ES modules cannot run from `file://`):

```sh
npx --yes http-server . -p 4173 -c-1
```

No build step or backend is required. GitHub Pages serves `main` directly. Lucide 0.468.0 is pinned and self-hosted in `vendor/`. Instrument Serif, Instrument Sans, and Geist Mono are self-hosted in `assets/fonts/`, with their licenses and system-font fallbacks.

## Content

- `data.js`: projects, display names for repositories, and a dated contribution snapshot.
- `inside.js`: the "Inside" panel under each project (Winnow's threshold dial, TraceGuard's review flow, the SRE escalation chart, Toolgen's run comparison). Figures come from each repository's own docs.
- `ambience.js`: the optional sound. It loads a lofi track and a water recording on first use, loops them with overlapping fades, and makes the music warmer and quieter at night.
- `app.js`: project rendering, GitHub refresh, the demo dialog, copy email, navigation state, the backdrop video, and the ambience dock.
- `styles.css`: layout, typography, responsive rules, and reduced-motion handling.

Contributions refresh from the public GitHub search API, with the dated snapshot as a fallback and a 15-minute optional local cache. Closed pull requests that were never merged are left out.

## Backdrop and sound credits

- Video (`assets/waterfall-*.mp4`, poster): "Slow Motion of Waterfalls" by Alan Ford on Pexels, https://www.pexels.com/video/slow-motion-of-waterfalls-8050132/. Stabilized, mirrored, colour-graded, and cut to a 14-second loop.
- Water sound (`assets/water.m4a`): the audio track of "Waterfalls in the Middle of a Forest" by Francisco Jadson de Araújo on Pexels, https://www.pexels.com/video/waterfalls-in-the-middle-of-a-forest-5544766/. Low-pass filtered and levelled.
- Music (`assets/lofi.m4a`): "Lofi Study - Calm Peaceful Chill Hop" by FASSounds on Pixabay, https://pixabay.com/music/beats-lofi-study-calm-peaceful-chill-hop-112191/. Levelled and lightly low-pass filtered.

Pexels and Pixabay media are free to use and modify under their content licences. The video does not autoplay and the poster frame stands in when the visitor prefers reduced motion. Sound never starts on its own.

## Verification

The browser smoke test requires Playwright and Chrome. Set `PLAYWRIGHT_MODULE` to an installed Playwright module path if it is not resolvable normally. `BROWSER_CHANNEL` defaults to `chrome` (use `msedge` for Edge). Then run:

```sh
node tests/smoke.cjs http://localhost:4173
```

Screenshots go to the ignored `artifacts/` folder. The test covers responsive overflow from 320 to 1920 pixels, project and contribution rendering, the in-review list, the demo dialog and focus return, copy email, reduced motion, and page errors.
