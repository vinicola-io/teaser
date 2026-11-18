import { test, expect } from "@playwright/test";
import { createRequire } from "node:module";
import { readdir, stat } from "node:fs/promises";
import { emptySettings, formSettings, isolate, visit, noHorizontalOverflow, attachScreenshot } from "./support/fixtures.mjs";

const require = createRequire(import.meta.url);
const axePath = require.resolve("axe-core/axe.min.js");

test("desktop, tablet and mobile preserve readable entry points", async ({ browser, baseURL }, info) => {
  for (const [width, height] of [[1440, 1000], [768, 1024], [390, 844]]) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce", locale: "ko-KR", baseURL });
    const blocked = await isolate(context, baseURL);
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    try {
      await visit(page, baseURL);
      await attachScreenshot(page, info, `entry-${width}`);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.locator(".hero-description")).toBeVisible();
      await noHorizontalOverflow(page);
      expect(await page.locator(".hero-photo").evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
      expect(await page.locator("#newsletter").evaluate(node => node.closest("main").lastElementChild === node)).toBe(true);
      expect(errors).toEqual([]);
      expect(blocked).toEqual([]);
    } finally { await context.close(); }
  }
  await info.attach("runtime", { body: JSON.stringify({ browser: browser.browserType().name(), version: browser.version() }), contentType: "application/json" });
});

test("automated WCAG A/AA scan has no violations at desktop, tablet and mobile", async ({ browser, baseURL }, info) => {
  for (const width of [1440, 768, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: "reduce", locale: "ko-KR" });
    await isolate(context, baseURL);
    const page = await context.newPage();
    try {
      await visit(page, baseURL);
      await page.addScriptTag({ path: axePath });
      const result = await page.evaluate(() => window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] } }));
      await info.attach(`axe-${width}`, { body: JSON.stringify(result, null, 2), contentType: "application/json" });
      expect(result.violations, JSON.stringify(result.violations, null, 2)).toEqual([]);
    } finally { await context.close(); }
  }
});

test("320px and doubled default text do not clip the headline or research action", async ({ page, context, baseURL }, info) => {
  await page.setViewportSize({ width: 320, height: 750 });
  await isolate(context, baseURL, formSettings);
  await visit(page, baseURL);
  await noHorizontalOverflow(page);
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
  await noHorizontalOverflow(page);
  const layout = await page.locator(".hero").evaluate(hero => {
    const h1 = hero.querySelector("h1").getBoundingClientRect();
    const action = hero.querySelector('[data-form-link="research"]').getBoundingClientRect();
    const box = hero.getBoundingClientRect();
    return { width: innerWidth, h1: { left: h1.left, right: h1.right, top: h1.top, bottom: h1.bottom }, action: { top: action.top, bottom: action.bottom, right: action.right }, heroBottom: box.bottom };
  });
  await attachScreenshot(page, info, "text-200-at-320", true);
  const overflowingText = await page.locator("main h1, main h2, main h3, main p").evaluateAll(nodes => nodes.filter(node => {
    const style = getComputedStyle(node);
    return !node.closest('.sr-only,[aria-hidden="true"]') && node.getClientRects().length && style.visibility === "visible" && node.clientWidth > 0 && node.scrollWidth > node.clientWidth + 2;
  }).map(node => ({ text: node.textContent.trim().slice(0, 100), clientWidth: node.clientWidth, scrollWidth: node.scrollWidth })));
  expect(overflowingText, JSON.stringify(overflowingText, null, 2)).toEqual([]);
  expect(layout.h1.left).toBeGreaterThanOrEqual(0);
  expect(layout.h1.right).toBeLessThanOrEqual(layout.width + 1);
  expect(layout.h1.bottom).toBeLessThanOrEqual(layout.action.top + 1);
  expect(layout.action.bottom).toBeLessThanOrEqual(layout.heroBottom + 1);
});

test("user text spacing preserves readable headings and actions", async ({ page, context, baseURL }, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await isolate(context, baseURL);
  await visit(page, baseURL);
  await page.addStyleTag({ content: "*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}" });
  await noHorizontalOverflow(page);
  const clipped = await page.locator("main h1,main h2,main h3,main p,main .button").evaluateAll(nodes => nodes
    .filter(node => node.clientWidth > 0 && node.scrollWidth > node.clientWidth + 2)
    .map(node => node.textContent.trim()));
  expect(clipped).toEqual([]);
  await attachScreenshot(page, info, "user-text-spacing");
});

test("skip link and mobile menu work with keyboard without a reload", async ({ page, context, baseURL, browserName }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await isolate(context, baseURL);
  await visit(page, baseURL);
  // Mac WebKit's default Tab skips links; Option-Tab follows Safari's link navigation.
  // https://github.com/microsoft/playwright/issues/5609
  await page.keyboard.press(browserName === "webkit" && process.platform === "darwin" ? "Alt+Tab" : "Tab");
  await expect(page.locator('a.skip-link[href="#main"]')).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);
  const toggle = page.getByRole("button", { name: /메뉴/ });
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator(".header-nav a").first()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await toggle.press("Enter");
  await page.evaluate(() => { window.__testNavigationMarker = true; });
  await page.locator('.header-nav a[href="#research"]').click();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(page).toHaveURL(/#research$/);
  expect(await page.evaluate(() => window.__testNavigationMarker)).toBe(true);
});

test("unconnected forms show plain notices without dead actions or editorial clutter", async ({ page, context, baseURL }) => {
  await isolate(context, baseURL);
  await visit(page, baseURL);
  await expect(page.locator("#research .survey-pending")).toHaveText("설문을 준비하고 있습니다.");
  await expect(page.locator('#research [data-form-link],.hero [data-form-link],#newsletter button,#newsletter input,dialog')).toHaveCount(0);
  await expect(page.locator(".header-actions .button,.story-controls,.hero-explore,.research-return,main figcaption,.hero-image-note,.research-image-note")).toHaveCount(0);
  const text = await page.locator("body").innerText();
  expect(text).not.toMatch(/리서치|서비스 구상|AI 연출|보유 재고|제품 사진/);
  expect(await page.locator('main img:not([alt=""])').count()).toBe(0);
  await expect(page.locator(".hero-description")).toContainText("준비");
});

test("FAQ summaries support native keyboard disclosure", async ({ page, context, baseURL }) => {
  await isolate(context, baseURL);
  await visit(page, baseURL);
  const details = page.locator("#faq details");
  expect(await details.count()).toBeGreaterThanOrEqual(4);
  for (const item of await details.all()) {
    const summary = item.locator("summary");
    await summary.focus();
    await page.keyboard.press("Enter");
    await expect(item).toHaveAttribute("open", "");
    await expect(item.locator("p")).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(item).not.toHaveAttribute("open", "");
  }
});

test("empty configuration stays research-only and collects nothing", async ({ page, context, baseURL }) => {
  const blocked = await isolate(context, baseURL, emptySettings);
  await visit(page, baseURL);
  await expect(page.locator(".hero-description")).toContainText("준비");
  await page.locator("#faq summary").first().click();
  await expect(page.locator("#faq details").first()).toContainText("시작하지 않았습니다");
  await expect(page.locator('.hero [data-form-link="research"]')).toHaveCount(0);
  await expect(page.locator("#newsletter input, #newsletter iframe, #newsletter form")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /(?:주문|결제|환매|견적).*(?:신청|하기|진행)/ })).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.length + sessionStorage.length)).toBe(0);
  expect(await context.cookies()).toEqual([]);
  expect(blocked).toEqual([]);
});

test("ready research and newsletter remain separate with local-only form fixtures", async ({ page, context, baseURL }) => {
  const blocked = await isolate(context, baseURL, formSettings);
  await visit(page, baseURL);
  const research = page.locator('.hero [data-form-link="research"]');
  await expect(research).toHaveAttribute("href", formSettings.researchUrl);
  await expect(research).toHaveAttribute("rel", /noopener/);
  await expect(research).toHaveAttribute("rel", /noreferrer/);
  const popupPromise = page.waitForEvent("popup");
  await research.click();
  const popup = await popupPromise;
  await popup.waitForLoadState("domcontentloaded");
  expect(popup.url()).toBe(formSettings.researchUrl);
  expect(await popup.evaluate(() => window.opener)).toBeNull();
  await popup.close();
  await expect(page.locator("iframe")).toHaveCount(0);
  const newsletterToggle = page.locator("#newsletter").getByRole("button").first();
  await newsletterToggle.click();
  await expect(newsletterToggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#newsletter iframe")).toHaveAttribute("src", formSettings.newsletterUrl + "?embedded=true");
  await newsletterToggle.click();
  await expect(page.locator("iframe")).toHaveCount(0);
  expect(blocked).toEqual([]);
});

test("a short newsletter URL is an independent external link", async ({ page, context, baseURL }) => {
  await isolate(context, baseURL, { researchUrl: "#", newsletterUrl: "https://forms.gle/NewsletterFixture" });
  await visit(page, baseURL);
  const newsletter = page.locator('#newsletter [data-form-link="newsletter"]');
  await expect(newsletter).toHaveAttribute("href", "https://forms.gle/NewsletterFixture");
  await expect(newsletter).toHaveAttribute("target", "_blank");
  await expect(page.locator('.hero [data-form-link="research"]')).toHaveCount(0);
  await expect(page.locator("iframe")).toHaveCount(0);
});

test("unsafe and editing URLs cannot become submission links", async ({ browser, baseURL }) => {
  for (const url of ["javascript:alert(1)", "https://docs.google.com.evil.test/forms/d/e/x/viewform", "https://user:pass@forms.gle/x", "https://docs.google.com/forms/d/e/x/edit", "https://forms.gle/"]) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
    await isolate(context, baseURL, { researchUrl: url, newsletterUrl: url });
    const page = await context.newPage();
    try {
      await visit(page, baseURL);
      await expect(page.locator('.hero [data-form-link="research"]')).toHaveCount(0);
      await expect(page.locator('[data-form-link][target="_blank"]')).toHaveCount(0);
      await expect(page.locator("#newsletter input, #newsletter iframe")).toHaveCount(0);
    } finally { await context.close(); }
  }
});

test("motion preference changes stop decoration while preserving reading and native scroll", async ({ page, context, baseURL }, info) => {
  await isolate(context, baseURL);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await visit(page, baseURL);
  const capabilities = await page.evaluate(() => ({ nativeScroll: CSS.supports("animation-timeline: view()") && CSS.supports("animation-range: 0% 100%"), waapi: typeof Element.prototype.animate === "function" }));
  await info.attach("motion-capabilities", { body: JSON.stringify(capabilities), contentType: "application/json" });
  await page.evaluate(() => scrollTo(0, Math.min(innerHeight * .3, document.querySelector(".hero").offsetHeight / 3)));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".hero-light-control")).toHaveCount(0);
  await expect.poll(() => page.locator(".hero").evaluate(hero => hero.getAnimations({ subtree: true }).filter(animation => animation.playState === "running").length)).toBe(0);
  await page.evaluate(() => scrollTo(0, 0));
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator(".hero-description")).toBeVisible();
  await noHorizontalOverflow(page);
});

test("studio light loops continuously without controls and pauses outside the scene", async ({ page, context, baseURL }, info) => {
  await isolate(context, baseURL);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await visit(page, baseURL);
  await expect(page.locator(".hero-light-control,.hero-filament,.hero-beam")).toHaveCount(0);
  const hero = page.locator(".hero");
  const area = page.locator(".hero-atmosphere");
  await page.locator(".hero-visual").scrollIntoViewIfNeeded();
  await expect(hero).toHaveAttribute("data-ambient-running", "true");
  const loops = await area.evaluate(node => node.getAnimations({ subtree: true }).map(animation => {
    const timing = animation.effect.getTiming();
    const keys = animation.effect.getKeyframes();
    return { duration: timing.duration, infinite: timing.iterations === Infinity,
      state: animation.playState, first: keys[0], last: keys.at(-1) };
  }));
  expect(loops).toHaveLength(2);
  for (const loop of loops) {
    expect(loop.duration).toBe(18000);
    expect(loop.infinite).toBe(true);
    expect(loop.state).toBe("running");
    expect(loop.first.opacity).toBe(loop.last.opacity);
    expect(loop.first.transform).toBe(loop.last.transform);
  }
  await page.locator("#newsletter").scrollIntoViewIfNeeded();
  await expect(hero).toHaveAttribute("data-ambient-running", "false");
  await expect.poll(() => area.evaluate(node => node.getAnimations({ subtree: true }).every(animation => animation.playState === "paused" && !animation.pending))).toBe(true);
  const stopped = await area.evaluate(async node => {
    const animations = node.getAnimations({ subtree: true });
    // WebKit commits the paused hold time on the next rendering update.
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const before = animations.map(animation => animation.currentTime);
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    return { before, after: animations.map(animation => animation.currentTime) };
  });
  expect(stopped.after).toEqual(stopped.before);
  await page.locator(".hero-visual").scrollIntoViewIfNeeded();
  await expect(hero).toHaveAttribute("data-ambient-running", "true");
  const resumed = await area.evaluate(node => node.getAnimations({ subtree: true }).map(animation => animation.currentTime));
  resumed.forEach((time, index) => expect(time).toBeGreaterThanOrEqual(stopped.before[index]));
  // Test only the visibility lifecycle input; this is not an OS tab-switch claim.
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(hero).toHaveAttribute("data-ambient-running", "false");
  await page.evaluate(() => {
    delete document.hidden;
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(hero).toHaveAttribute("data-ambient-running", "true");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(() => area.evaluate(node => node.getAnimations({ subtree: true }).length)).toBe(0);
  await expect(hero).toHaveAttribute("data-ambient-running", "false");
  await expect(area).toBeVisible();
  await info.attach("studio-loop", { body: JSON.stringify({ loops, stopped, resumed }), contentType: "application/json" });
});

test("without JavaScript the full service context, FAQ and navigation remain readable", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, reducedMotion: "reduce", viewport: { width: 390, height: 844 } });
  await isolate(context, baseURL);
  const page = await context.newPage();
  try {
    await visit(page, baseURL);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("#research")).toBeAttached();
    await expect(page.locator("#newsletter")).toBeAttached();
    expect(await page.locator(".static-chapter").count()).toBe(3);
    for (const details of await page.locator("#faq details").all()) {
      await details.locator("summary").click();
      await expect(details.locator("p")).toBeVisible();
    }
    await page.locator('.header-nav a[href="#concierge"]').click();
    await expect(page).toHaveURL(/#concierge$/);
  } finally { await context.close(); }
});

test("project Pages paths, initial HTML and preload references resolve to built assets", async ({ request, page, context, baseURL }, info) => {
  const response = await request.get(baseURL);
  expect(response.ok()).toBe(true);
  const html = await response.text();
  expect(html).toMatch(/<h1\b/);
  expect(html).toContain('id="research"');
  expect(html).toContain('id="newsletter"');
  expect(html).not.toContain("<!-- APP_");
  await isolate(context, baseURL);
  const heroRequests = [];
  page.on("request", request => {
    if (/hero-cutout-.*\.(?:webp|png)$/.test(new URL(request.url()).pathname)) heroRequests.push(request.url());
  });
  await visit(page, baseURL);
  // The no-store fixture may request a cached-in-production URL again when story markup changes.
  expect([...new Set(heroRequests)], "Matching preload and reused scenes must select one WebP variant").toHaveLength(1);
  expect(heroRequests[0]).toMatch(/\.webp$/);
  const references = await page.locator('script[src],link[rel="stylesheet"],link[rel="preload"]').evaluateAll(nodes => nodes.map(node => node.src || node.href));
  for (const url of references) {
    expect(new URL(url).pathname).toMatch(/^\/teaser\//);
    expect((await request.get(url)).ok(), url).toBe(true);
  }
  const image = await page.locator(".hero-photo").evaluate(img => img.currentSrc);
  const advertised = await page.locator('link[rel="preload"][as="image"]').evaluateAll(links => links.filter(link => !link.media || matchMedia(link.media).matches).flatMap(link => [link.href, ...(link.imageSrcset || "").split(",").map(value => new URL(value.trim().split(/\s+/)[0], document.baseURI).href)]));
  expect(advertised, "Selected hero image should be advertised by its matching preload").toContain(image);
  const files = await readdir("dist/assets");
  const sizes = await Promise.all(files.map(async name => ({ name, bytes: (await stat("dist/assets/" + name)).size })));
  await info.attach("asset-sizes", { body: JSON.stringify(sizes.sort((a, b) => b.bytes - a.bytes), null, 2), contentType: "application/json" });
});

test("unsupported WebP selects a working PNG fallback", async ({ page, context, baseURL }) => {
  await isolate(context, baseURL);
  await visit(page, baseURL);
  const image = page.locator(".hero-photo");
  await expect(image).toHaveAttribute("src", /\.png(?:\?|$)/);
  expect(await page.locator('.hero picture source[type="image/webp"]').count()).toBeGreaterThan(0);
  // Unsupported-format selection, not a promise of network-error recovery.
  await page.locator('.hero picture source[type="image/webp"]').evaluateAll(sources => sources.forEach(source => { source.type = "image/not-supported"; }));
  await expect.poll(() => image.evaluate(img => img.complete && img.naturalWidth > 0 && new URL(img.currentSrc).pathname.endsWith(".png"))).toBe(true);
});

test("shared transparent artwork stays within responsive image budgets", async ({ browser, baseURL }, info) => {
  const samples = [];
  for (const [width, height, dpr, budget, ready] of [[390, 844, 1, 35000], [390, 844, 3, 140000], [768, 1024, 2, 120000], [1440, 900, 1, 70000], [1440, 900, 2, 140000], [1440, 900, 1, 70000, true]]) {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: dpr, reducedMotion: "no-preference" });
    await isolate(context, baseURL, ready ? formSettings : emptySettings);
    const page = await context.newPage();
    const images = new Map();
    const reads = [];
    page.on("response", response => {
      if (/\.(?:webp|png)(?:\?|$)/.test(response.url())) reads.push(response.body().then(body => images.set(response.url(), body.length)));
    });
    try {
      await visit(page, baseURL);
      for (const section of ["#concierge", "#vintages", "#research", "#newsletter"]) {
        await page.locator(section).scrollIntoViewIfNeeded();
      }
      await expect.poll(() => page.locator("main picture img").evaluateAll(nodes => nodes.every(node => node.complete && node.naturalWidth > 0))).toBe(true);
      await Promise.all(reads);
      const urls = [...images.keys()];
      const bytes = [...images.values()].reduce((sum, value) => sum + value, 0);
      expect(urls).toHaveLength(2);
      expect(urls.every(url => /\/(hero|collection)-cutout-\d+\.webp$/.test(new URL(url).pathname))).toBe(true);
      expect(bytes).toBeLessThanOrEqual(budget);
      await noHorizontalOverflow(page);
      samples.push({ width, height, dpr, ready: Boolean(ready), bytes, budget, images: Object.fromEntries(images) });
    } finally { await context.close(); }
  }
  await info.attach("responsive-image-budgets", { body: JSON.stringify(samples, null, 2), contentType: "application/json" });
});

test("body artwork has working PNG alternatives with reserved layout space", async ({ page, context, baseURL }) => {
  await isolate(context, baseURL);
  await visit(page, baseURL);
  expect(await page.locator(".wine-artwork").count()).toBe(5);
  const images = page.locator(".wine-artwork img");
  expect(await images.evaluateAll(nodes => nodes.every(node => node.width > 0 && node.height > 0 && node.getAttribute("alt") === "" && node.getAttribute("loading") === "lazy"))).toBe(true);
  await page.locator('.wine-artwork source[type="image/webp"]').evaluateAll(nodes => nodes.forEach(node => { node.type = "image/not-supported"; }));
  for (const section of ["#concierge", "#vintages", "#research"]) await page.locator(section).scrollIntoViewIfNeeded();
  await expect.poll(() => images.evaluateAll(nodes => nodes.every(node => node.complete && node.naturalWidth > 0 && new URL(node.currentSrc).pathname.endsWith(".png")))).toBe(true);
  const geometry = await page.locator(".static-chapter figure,.collection-photo").evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect()));
  expect(geometry.every(box => box.width > 0 && box.height > 0)).toBe(true);
  await noHorizontalOverflow(page);
});
