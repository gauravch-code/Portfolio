# Gaurav Chintakunta's portfolio

A static GitHub Pages portfolio with a custom Three.js systems bench, selectable architecture scenarios, four real project demos, and a live public contribution ledger.

## Development

Serve this directory over HTTP (ES modules cannot run from `file://`):

```sh
npx --yes http-server . -p 4173 -c-1
```

No build step or backend is required. GitHub Pages serves `main` directly. Three.js 0.180.0 and Lucide 0.468.0 are pinned and self-hosted in `vendor/`; their licenses are included. Space Grotesk and IBM Plex Mono are also self-hosted, with licenses in `assets/fonts/` and system-font fallbacks.

## Content

- `data.js`: projects, architecture scenarios, verified contribution snapshot.
- `app.js`: selection, deterministic scenario execution, GitHub refresh, demo dialogs, accessibility, navigation.
- `scene.js`: custom geometry, packet routes, camera transitions, rendering budget, WebGL fallback.
- `styles.css`: responsive layout and reduced-motion handling.
- `mini.js` / `mini.css`: illustrated Mini-Gaurav, draggable placement, scenario reactions, demo/navigation/contact actions, and hide/restore preferences. All actions call the actual portfolio controls; no chat model or invented answers.

The bench is an illustrative architecture simulation, not a live connection to project backends. Real working demos are linked and embedded separately. Contributions refresh from the public GitHub API, with a dated snapshot when offline and a 15-minute optional local cache. Closed unmerged PRs are not counted as merged or open.

## Verification

The browser smoke test requires Playwright, Sharp, and Chrome. Set `PLAYWRIGHT_MODULE` to an installed Playwright module path if it is not resolvable normally (Sharp should be installed beside it, or set `SHARP_MODULE` separately). `BROWSER_CHANNEL` defaults to `chrome`. Then run:

```sh
node tests/smoke.cjs http://localhost:4173
node tests/mini.cjs http://localhost:4173
```

Screenshots go to ignored `artifacts/`. The test covers responsive overflow, 3D pixels and motion, all scenario paths, keyboard selection, interruption, demo dialogs, reduced motion, and WebGL fallback.

The companion test covers scenario integration, clipboard, navigation, demo focus return, dragging and saved positions, hide/restore, responsive menu bounds, reduced motion, and disabled storage. Mini-Gaurav's illustrated SVG is code-native; no image-generation service or AI backend is required.
