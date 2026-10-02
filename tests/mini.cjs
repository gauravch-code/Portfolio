const assert = require("node:assert/strict");
const path = require("node:path");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const url = process.argv[2] || "http://127.0.0.1:4173";
const artifacts = path.resolve(__dirname, "../artifacts");
async function contained(page, selector) {
  const r = await page.locator(selector).boundingBox(),
    v = page.viewportSize();
  assert(
    r &&
      r.x >= 0 &&
      r.y >= 0 &&
      r.x + r.width <= v.width + 1 &&
      r.y + r.height <= v.height + 1,
    `${selector} out of bounds: ${JSON.stringify(r)}`,
  );
}
(async () => {
  const browser = await chromium.launch({
    headless: true,
    channel: process.env.BROWSER_CHANNEL || "chrome",
  });
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      permissions: ["clipboard-read", "clipboard-write"],
    });
    await context.route("https://api.github.com/**", (r) => r.abort());
    await context.route("https://gauravch-code.github.io/**", (r) =>
      r.fulfill({ contentType: "text/html", body: "<h1>Demo fixture</h1>" }),
    );
    const page = await context.newPage(),
      errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(url);
    await page.locator("#mini-character").waitFor();
    await contained(page, "#mini");
    await page.locator("#mini-character").click();
    await contained(page, "#mini-panel");
    assert.equal(
      await page.locator("#mini-character").getAttribute("aria-expanded"),
      "true",
    );
    assert.equal(
      await page
        .locator("#mini-project")
        .evaluate((e) => e === document.activeElement),
      true,
    );
    await page.locator("#mini-project").selectOption("sre");
    assert.equal(
      await page.locator("#system-title").textContent(),
      "Agentic SRE",
    );
    await page.locator("[data-mini-action=run]").click();
    assert.equal(await page.locator("#mini-panel").isVisible(), false);
    assert.equal(
      await page.locator(".mini-avatar").getAttribute("data-mood"),
      "working",
    );
    await page.waitForFunction(() => !document.querySelector("#run").disabled);
    assert.equal(
      await page.locator("#mini-speech").textContent(),
      "Restart selected. Memory limit unchanged.",
    );
    await contained(page, "#mini-speech");
    await page.screenshot({ path: path.join(artifacts, "mini-result.png") });
    await page.locator("#mini-character").click();
    await page.locator("[data-mini-action=demo]").click();
    await page.frameLocator("#demo-frame").locator("h1").waitFor();
    assert.equal(
      await page.locator("#demo-name").textContent(),
      "Agentic SRE Pipeline",
    );
    await page.keyboard.press("Escape");
    await page.waitForFunction(
      () =>
        !document.querySelector("#demo-dialog").open &&
        !document.querySelector("#demo-frame").hasAttribute("src"),
    );
    assert.equal(
      await page
        .locator("#mini-character")
        .evaluate((e) => e === document.activeElement),
      true,
    );
    await page.locator("#mini-character").click();
    await page.locator("[data-mini-action=email]").click();
    assert.equal(
      await page.evaluate(() => navigator.clipboard.readText()),
      "gaurav.pvt25@gmail.com",
    );
    assert(
      (await page.locator("#mini-message").textContent()).includes(
        "Email copied",
      ),
    );
    await page.locator("[data-mini-action=oss]").click();
    assert.equal(
      await page
        .locator("#open-source")
        .evaluate((e) => e === document.activeElement),
      true,
    );
    await page.locator("#mini-character").click();
    await page.keyboard.press("Escape");
    assert.equal(await page.locator("#mini-panel").isVisible(), false);
    const before = await page.locator("#mini-character").boundingBox();
    await page.mouse.move(
      before.x + before.width / 2,
      before.y + before.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(160, 220, { steps: 12 });
    await page.mouse.up();
    const after = await page.locator("#mini").boundingBox();
    assert(after.x < 300 && after.y < 300, "Dragging did not move companion");
    assert.equal(await page.locator("#mini-panel").isVisible(), false);
    await page.reload();
    await page.locator("#mini").waitFor();
    const keyboardBefore = await page.locator("#mini").boundingBox();
    await page.locator("#mini-character").focus();
    await page.keyboard.press("ArrowRight");
    const keyboardAfter = await page.locator("#mini").boundingBox();
    assert(
      Math.abs(keyboardAfter.x - keyboardBefore.x - 24) < 1,
      "Keyboard movement failed",
    );
    assert(
      (await page.locator("#mini").boundingBox()).x < 300,
      "Position was not remembered",
    );
    await page.locator("#mini-character").click();
    await page.locator("#mini-hide").click();
    assert.equal(await page.locator("#mini").isVisible(), false);
    await page.reload();
    await page.locator("#mini-launcher").click();
    assert.equal(await page.locator("#mini").isVisible(), true);
    assert.equal(await page.locator("#mini-panel").isVisible(), true);
    await page.locator("#mini-home").click();
    await page.locator("#mini-close").click();
    for (const viewport of [
      { width: 768, height: 1024 },
      { width: 390, height: 844 },
      { width: 320, height: 740 },
    ]) {
      await page.setViewportSize(viewport);
      await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
      await page.locator("#mini-launcher").click();
      await contained(page, "#mini");
      await contained(page, "#mini-panel");
      const widths = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        width: innerWidth,
      }));
      assert.equal(widths.scroll, widths.width, "Mobile overflow");
      await page.screenshot({
        path: path.join(artifacts, `mini-${viewport.width}.png`),
      });
      await page.locator("#mini-hide").click();
      await page.setViewportSize({ width: 320, height: 600 });
      await page.locator("#mini-launcher").click();
      await contained(page, "#mini");
      await contained(page, "#mini-panel");
      await page.locator("#mini-close").click();
    }
    await page.locator("#motion").click();
    assert.equal(
      await page
        .locator(".mini-head")
        .evaluate((e) => getComputedStyle(e).animationPlayState),
      "paused",
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    assert.equal(
      await page
        .locator(".mini-eyes")
        .evaluate((e) => getComputedStyle(e).animationName),
      "none",
    );
    assert.deepEqual(errors, []);
    await context.close();
    const noStorage = await browser.newContext();
    await noStorage.addInitScript(() => {
      Storage.prototype.setItem = () => {
        throw Error("Storage disabled");
      };
      Storage.prototype.getItem = () => {
        throw Error("Storage disabled");
      };
    });
    const np = await noStorage.newPage();
    await np.goto(url);
    await np.locator("#mini-launcher").click();
    await np.locator("#mini-hide").click();
    await np.locator("#mini-launcher").click();
    assert.equal(await np.locator("#mini-panel").isVisible(), true);
    await noStorage.close();
    console.log(
      "PASS: companion actions, real scenario integration, demo/focus return, clipboard, navigation, drag/persistence, hide/restore, responsive bounds, pause/reduced motion, unavailable storage.",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
