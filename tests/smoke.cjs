const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");

const url = process.argv[2] || "http://127.0.0.1:4173";
const artifacts = path.resolve(__dirname, "../artifacts");
fs.mkdirSync(artifacts, { recursive: true });

async function noOverflow(page) {
  const result = await page.evaluate(() => ({
    width: innerWidth,
    scroll: document.documentElement.scrollWidth,
    overflow: [...document.querySelectorAll("body *")]
      .filter((e) => {
        const r = e.getBoundingClientRect();
        return r.width > 0 && !e.closest("dialog:not([open])") && !e.closest(".skip") && (r.right > innerWidth + 1 || r.left < -1);
      })
      .map((e) => e.outerHTML.slice(0, 100)),
  }));
  assert.equal(result.scroll, result.width, `page scrolls sideways at ${result.width}px`);
  assert.deepEqual(result.overflow, [], `elements overflow at ${result.width}px`);
}

(async () => {
  const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || "chrome" });
  const errors = [];

  for (const width of [320, 390, 768, 1280, 1920]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(url, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await noOverflow(page);
    await page.screenshot({ path: path.join(artifacts, `full-${width}.png`), fullPage: true });
    await page.close();
  }

  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto(url, { waitUntil: "networkidle" });

  // Projects and contributions render
  assert.equal(await page.locator(".project").count(), 4);
  const merged = await page.locator("#merged-list li").count();
  assert.ok(merged > 0, "no merged pull requests listed");
  assert.equal(await page.locator("#merged-count").textContent(), String(merged));
  assert.equal(await page.locator("#proof-merged").textContent(), String(merged));

  // Pull requests in review expand
  await page.locator(".in-review summary").click();
  assert.ok(await page.locator("#open-list").isVisible());

  // Demo dialog opens with the live demo and returns focus when closed
  const trigger = page.locator('[data-demo="traceguard"]');
  await trigger.click();
  assert.ok(await page.locator("#demo-dialog").evaluate((d) => d.open));
  assert.equal(await page.locator("#demo-frame").getAttribute("src"), "https://gauravch-code.github.io/TraceGuard/");
  await page.locator("#demo-close").click();
  assert.equal(await page.locator("#demo-dialog").evaluate((d) => d.open), false);
  assert.equal(await page.locator("#demo-frame").getAttribute("src"), null);
  assert.ok(await trigger.evaluate((e) => e === document.activeElement));

  // Copy email reports a result either way
  await page.locator("#copy-email").click();
  assert.match(await page.locator("#copy-status").textContent(), /copied|gaurav\.pvt25@gmail\.com/);

  // Content stays visible with reduced motion
  const reduced = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
  await reduced.goto(url, { waitUntil: "networkidle" });
  assert.equal(await reduced.locator(".project").first().evaluate((e) => getComputedStyle(e).opacity), "1");

  assert.deepEqual(errors, [], "page reported errors");
  await browser.close();
  console.log("Smoke test passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
