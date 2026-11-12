import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const products = [
  { slug: "civic-systems", url: "https://mse-civic-infrastructure.vercel.app" },
  { slug: "hospital-flow", url: "https://mse-hospital-flow.vercel.app" },
  { slug: "freshlink", url: "https://mse-food-network.vercel.app" },
  { slug: "plantops", url: "https://mse-industrial-reliability.vercel.app" },
  { slug: "reliefgrid", url: "https://mse-disaster-response.vercel.app" },
  { slug: "learnsignal", url: "https://mse-education-insights.vercel.app" },
  { slug: "supplymesh", url: "https://mse-supply-resilience.vercel.app" },
  { slug: "gridaccess", url: "https://mse-energy-access.vercel.app" },
  { slug: "researchtrace", url: "https://mse-research-reproducibility.vercel.app" },
  { slug: "mse-modelops", url: "https://mse-ai-lifecycle.vercel.app" },
];

const output = path.resolve("images/mse-suite");
await mkdir(output, { recursive: true });

const browser = await chromium.launch({ headless: true });
try {
  for (const product of products) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    const response = await page.goto(product.url, { waitUntil: "domcontentloaded", timeout: 60_000 });
    if (!response || response.status() >= 400) {
      throw new Error(`${product.slug}: page returned ${response?.status() ?? "no response"}`);
    }
    await page.evaluate(() => document.fonts.ready.then(() => true));
    await page.waitForTimeout(900);
    const contentLength = (await page.locator("body").innerText()).trim().length;
    if (contentLength < 30) throw new Error(`${product.slug}: page content did not render`);
    await page.screenshot({ path: path.join(output, `${product.slug}-desktop.png`), animations: "disabled" });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(350);
    await page.screenshot({ path: path.join(output, `${product.slug}-mobile.png`), animations: "disabled" });
    await page.close();
    console.log(`Captured desktop and mobile: ${product.slug}`);
  }
} finally {
  await browser.close();
}
