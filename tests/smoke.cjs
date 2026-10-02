const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const playwrightPath = process.env.PLAYWRIGHT_MODULE || "playwright";
const { chromium } = require(playwrightPath);
const sharp = require(
  process.env.SHARP_MODULE ||
    (path.isAbsolute(playwrightPath)
      ? path.join(path.dirname(playwrightPath), "sharp")
      : "sharp"),
);
const url = process.argv[2] || "http://127.0.0.1:4173";
const artifacts = path.resolve(__dirname, "../artifacts");
fs.mkdirSync(artifacts, { recursive: true });
const ids = ["winnow", "traceguard", "sre", "toolgen"];
const results = [
  [
    "Local route accepted. No LLM call needed.",
    "Uncertain mail took the fallback path.",
  ],
  [
    "Draft passed the gate. Trace retained.",
    "Release paused. A human reviews the draft.",
  ],
  [
    "Restart selected. Memory limit unchanged.",
    "Recurrence policy escalated the memory limit.",
  ],
  [
    "Conversation accepted after validation.",
    "Failed sample enters the repair loop.",
  ],
];

async function pixels(page) {
  return sharp(await page.locator("#systems-canvas").screenshot())
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
}
function changed(a, b) {
  assert.equal(a.data.length, b.data.length);
  let n = 0;
  for (let i = 0; i < a.data.length; i += 3)
    if (
      Math.abs(a.data[i] - b.data[i]) +
        Math.abs(a.data[i + 1] - b.data[i + 1]) +
        Math.abs(a.data[i + 2] - b.data[i + 2]) >
      12
    )
      n++;
  return n;
}
function nonblank(a) {
  let n = 0;
  for (let i = 0; i < a.data.length; i += 3)
    if (Math.max(...a.data.subarray(i, i + 3)) > 80) n++;
  return n;
}
async function sceneReady(page) {
  await page.waitForFunction(
    () => document.documentElement.dataset.scene === "ready",
  );
  await page.evaluate(() => document.fonts.ready);
}
async function layout(page) {
  const result = await page.evaluate(() => ({
    width: innerWidth,
    scroll: document.documentElement.scrollWidth,
    overflow: [...document.querySelectorAll("button,select,h1,h2,h3,p,a")]
      .filter((e) => {
        const r = e.getBoundingClientRect();
        return (
          r.width > 0 &&
          getComputedStyle(e).display !== "none" &&
          !e.closest("dialog:not([open])") &&
          (r.right > innerWidth + 2 || r.left < -2)
        );
      })
      .map((e) => e.outerHTML.slice(0, 100)),
  }));
  assert.equal(result.scroll, result.width, JSON.stringify(result));
  assert.deepEqual(result.overflow, [], JSON.stringify(result));
  const overlap = await page.evaluate(() => {
    const items = [...document.querySelectorAll(".inspector>*")].filter(
      (e) => !e.hidden,
    );
    const foot = items.at(-1).getBoundingClientRect();
    const result = document.querySelector("#result").getBoundingClientRect();
    return { footTop: foot.top, resultBottom: result.bottom };
  });
  assert(
    overlap.footTop >= overlap.resultBottom - 2,
    `Inspector overlaps: ${JSON.stringify(overlap)}`,
  );
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    channel: process.env.BROWSER_CHANNEL || "chrome",
  });
  const errors = [];
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      permissions: ["clipboard-read", "clipboard-write"],
    });
    await context.route("https://api.github.com/**", (route) =>
      route.fulfill({
        status: 403,
        body: '{"message":"rate limited"}',
        contentType: "application/json",
      }),
    );
    const page = await context.newPage();
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(url);
    await sceneReady(page);
    await page.waitForTimeout(1200);
    await layout(page);
    assert.equal(await page.locator(".project").count(), 4);
    assert.equal(await page.locator(".contribution").count(), 9);
    assert.equal(await page.locator("#merged-count").textContent(), "2");
    assert.equal(await page.locator("#open-count").textContent(), "7");
    assert(
      (await page.locator("#github-status").textContent()).includes("OFFLINE"),
    );
    const first = await pixels(page);
    assert(nonblank(first) > 5000, "Desktop canvas is blank");
    await page.waitForTimeout(1000);
    assert(changed(first, await pixels(page)) > 50, "3D scene is not moving");
    await page.screenshot({ path: path.join(artifacts, "desktop.png") });
    await page.locator("#motion").click();
    await page.waitForTimeout(1200);
    const paused = await pixels(page);
    await page.waitForTimeout(500);
    assert(
      changed(paused, await pixels(page)) < 30,
      "Pause does not stop scene motion",
    );
    await page.locator("#motion").click();
    for (let p = 0; p < ids.length; p++) {
      await page.locator(`#tab-${ids[p]}`).click();
      for (let s = 0; s < 2; s++) {
        await page.locator("#scenario").selectOption(String(s));
        await page.locator("#run").click();
        await page.waitForFunction(
          () => !document.querySelector("#run").disabled,
        );
        assert.equal(
          await page.locator("#result").textContent(),
          results[p][s],
        );
        assert.equal(await page.locator("#execution li.done").count(), 4);
        await layout(page);
      }
    }
    await page.locator("#reset").click();
    await page.locator("#tab-winnow").focus();
    await page.keyboard.press("ArrowRight");
    assert.equal(
      await page.locator("#tab-traceguard").getAttribute("aria-selected"),
      "true",
    );
    await page.keyboard.press("End");
    assert.equal(
      await page.locator("#tab-toolgen").getAttribute("aria-selected"),
      "true",
    );
    await page.keyboard.press("Home");
    assert.equal(
      await page.locator("#tab-winnow").getAttribute("aria-selected"),
      "true",
    );
    await page.locator("#run").click();
    await page.locator("#tab-sre").click();
    await page.waitForTimeout(3200);
    assert.equal(
      await page.locator("#result").textContent(),
      "Ready to investigate an alert.",
    );
    assert.equal(await page.locator("#run").isDisabled(), false);
    await page.locator("#focus-scene").click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(artifacts, "focus.png") });
    await page.locator("#explode").click();
    await page.waitForTimeout(1600);
    await page.screenshot({ path: path.join(artifacts, "exploded.png") });
    assert(
      (await page.locator(".component-label:visible").count()) >= 2,
      "Component annotations not visible",
    );
    await page.locator("#reset").click();
    await page.locator("#orbit").click();
    await page.waitForTimeout(1000);
    const rotated = await pixels(page);
    await page.waitForTimeout(800);
    assert(
      changed(rotated, await pixels(page)) > 500,
      "Orbit does not rotate bench",
    );
    await page.locator("#reset").click();
    // Real demo pages stay external; this controlled iframe verifies the dialog lifecycle.
    await page.route("https://gauravch-code.github.io/**", (route) =>
      route.fulfill({
        contentType: "text/html",
        body: "<!doctype html><title>Demo fixture</title><h1>Working demo frame</h1>",
      }),
    );
    for (const id of ids) {
      await page.locator(`[data-demo="${id}"]`).click();
      assert.equal(
        await page.locator("#demo-dialog").evaluate((d) => d.open),
        true,
      );
      await page.frameLocator("#demo-frame").locator("h1").waitFor();
      await page.keyboard.press("Escape");
      await page.waitForFunction(
        () =>
          !document.querySelector("#demo-dialog").open &&
          !document.querySelector("#demo-frame").hasAttribute("src"),
      );
      assert.equal(
        await page.locator("#demo-dialog").evaluate((d) => d.open),
        false,
      );
      assert.equal(await page.locator("#demo-frame").getAttribute("src"), null);
      assert.equal(
        await page
          .locator(`[data-demo="${id}"]`)
          .evaluate((b) => document.activeElement === b),
        true,
      );
    }
    await page.locator("#copy-email").click();
    assert.equal(
      await page.evaluate(() => navigator.clipboard.readText()),
      "gaurav.pvt25@gmail.com",
    );
    assert.equal(
      await page.locator("#copy-status").textContent(),
      "Email copied.",
    );
    for (const viewport of [
      { width: 1920, height: 1080 },
      { width: 1280, height: 800 },
      { width: 768, height: 1024 },
      { width: 390, height: 844 },
      { width: 320, height: 740 },
    ]) {
      await page.setViewportSize(viewport);
      await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
      await page.waitForTimeout(1000);
      await layout(page);
      assert(
        nonblank(await pixels(page)) > 1500,
        `Canvas blank at ${viewport.width}`,
      );
      await page.screenshot({
        path: path.join(artifacts, `viewport-${viewport.width}.png`),
      });
      // Visit every content band so lazy images and reveals can be inspected.
      for (const id of [
        "work",
        "winnow",
        "traceguard",
        "sre",
        "toolgen",
        "open-source",
        "about",
        "contact",
      ]) {
        await page.locator(`#${id}`).scrollIntoViewIfNeeded();
        await page.waitForTimeout(150);
      }
      await page.evaluate(() =>
        document
          .querySelectorAll(".reveal")
          .forEach((e) => e.classList.add("visible")),
      );
      await page.screenshot({
        path: path.join(artifacts, `full-${viewport.width}.png`),
        fullPage: true,
      });
      const missing = await page
        .locator("img")
        .evaluateAll((imgs) =>
          imgs
            .filter((i) => !i.complete || i.naturalWidth === 0)
            .map((i) => i.src),
        );
      assert.deepEqual(missing, []);
    }
    const reduced = await browser.newContext({
      viewport: { width: 390, height: 844 },
      reducedMotion: "reduce",
    });
    await reduced.route("https://api.github.com/**", (r) => r.abort());
    const rp = await reduced.newPage();
    await rp.goto(url);
    await sceneReady(rp);
    await rp.waitForTimeout(500);
    assert.equal(
      await rp.locator("#motion").getAttribute("aria-pressed"),
      "true",
    );
    const still = await pixels(rp);
    await rp.waitForTimeout(500);
    assert(
      changed(still, await pixels(rp)) < 30,
      "Reduced motion animates by default",
    );
    await rp.locator("#tab-toolgen").click();
    await rp.locator("#scenario").selectOption("1");
    await rp.locator("#run").click();
    await rp.waitForFunction(() => !document.querySelector("#run").disabled);
    assert.equal(await rp.locator("#result").textContent(), results[3][1]);
    await layout(rp);
    await reduced.close();
    const fallbackContext = await browser.newContext();
    await fallbackContext.addInitScript(() => {
      const native = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...args) {
        if (type.startsWith("webgl")) return null;
        return native.call(this, type, ...args);
      };
    });
    const fp = await fallbackContext.newPage();
    await fp.goto(url);
    await fp.waitForFunction(
      () => document.documentElement.dataset.scene === "fallback",
    );
    assert.equal(await fp.locator("#scene-fallback").isVisible(), true);
    await fp.locator("#tab-sre").click();
    assert(
      (await fp.locator(".fallback-graph").textContent()).includes("restart"),
    );
    await fp.locator("#run").click();
    await fp.waitForFunction(() => !document.querySelector("#run").disabled);
    assert.equal(await fp.locator("#result").textContent(), results[2][0]);
    await fp.screenshot({ path: path.join(artifacts, "fallback.png") });
    await fallbackContext.close();
    // Discovery must exclude closed unmerged PRs and handle untrusted titles as text.
    const live = await browser.newContext();
    await live.route("https://api.github.com/**", (r) =>
      r.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          items: [
            {
              state: "closed",
              repository_url: "https://api.github.com/repos/test/merged",
              number: 1,
              title: "Merged <script>bad()</script>",
              pull_request: { merged_at: "2026-10-01" },
            },
            {
              state: "open",
              repository_url: "https://api.github.com/repos/test/open",
              number: 2,
              title: "Open PR",
              pull_request: { merged_at: null },
            },
            {
              state: "closed",
              repository_url: "https://api.github.com/repos/test/closed",
              number: 3,
              title: "Closed PR",
              pull_request: { merged_at: null },
            },
          ],
        }),
      }),
    );
    const lp = await live.newPage();
    await lp.goto(url);
    await lp.waitForFunction(
      () =>
        document.querySelector("#github-status").textContent ===
        "LIVE / GITHUB",
    );
    assert.equal(await lp.locator(".contribution").count(), 2);
    assert.equal(await lp.locator("#merged-count").textContent(), "1");
    assert.equal(await lp.locator("#contributions script").count(), 0);
    await live.close();
    assert.deepEqual(errors, [], "Uncaught browser errors");
    await context.close();
    console.log(
      "PASS: 8 scenarios, 5 responsive viewports, canvas pixels/motion, pause/orbit/focus/explode, keyboard selection, cancellation, 4 demo dialogs, clipboard, images, reduced motion, WebGL fallback, GitHub offline/live discovery.",
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
