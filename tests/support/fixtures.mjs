import { expect } from "@playwright/test";

export const emptySettings = { researchUrl: "", newsletterUrl: "", contactEmail: "" };
export const formSettings = {
  researchUrl: "https://docs.google.com/forms/d/e/ResearchFixture/viewform",
  newsletterUrl: "https://docs.google.com/forms/d/e/NewsletterFixture/viewform",
  contactEmail: "contact@example.com",
};

export async function isolate(context, baseURL, settings = emptySettings) {
  const blocked = [];
  const origin = new URL(baseURL).origin;
  await context.route("**/*", async route => {
    const url = new URL(route.request().url());
    if (!["http:", "https:"].includes(url.protocol)) return route.continue();
    if (url.origin === origin) {
      if (/\/site\.config(?:-[a-z0-9]+)?\.js$/.test(url.pathname)) {
        return route.fulfill({ contentType: "text/javascript", body: "window.VINICOLA_CONFIG=" + JSON.stringify(settings) + ";" });
      }
      return route.continue();
    }
    if (["docs.google.com", "forms.gle"].includes(url.hostname) && url.href.includes("Fixture")) {
      return route.fulfill({ contentType: "text/html", body: "<!doctype html><html lang='ko'><title>Local form fixture</title><body><p>테스트 전용 화면: 외부 제출 기능 없음</p></body></html>" });
    }
    blocked.push(url.href);
    return route.abort("blockedbyclient");
  });
  return blocked;
}

export async function visit(page, baseURL, hash = "") {
  await page.goto(baseURL + hash, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
}

export async function noHorizontalOverflow(page) {
  const result = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth }));
  expect(result.scrollWidth, JSON.stringify(result)).toBeLessThanOrEqual(result.width + 1);
}

export async function attachScreenshot(page, info, name, fullPage = false) {
  const path = info.outputPath(`${name}.png`);
  await page.screenshot({ path, fullPage });
  await info.attach(name, { path, contentType: "image/png" });
}
