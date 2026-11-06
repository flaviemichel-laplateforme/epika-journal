/**
 * Takes the screenshots of an issue for its page of the journal: node tools/capture.mjs 73 [76 …]
 *
 * Needs Epika running in production against its FAKE API (fictitious data only: the site is public), from the Epika
 * repository, frontend folder:
 *   node e2e/mock-api.mjs                                   (port 4010)
 *   $env:API_URL="http://127.0.0.1:4010"; npm run build; npm run start -- -p 3100
 *
 * Each scene of tools/scenes/<issue>.mjs is shot twice, on a phone (360 px) and on a desktop (1280 px), into
 * images/<issue>/<nn>-<name>-<format>.jpg, and tools/out/<issue>.html receives the slides to paste into the page.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const BASE_URL = process.env.EPIKA_URL ?? "http://localhost:3100";

const FORMATS = [
    { name: "mobile", viewport: { width: 360, height: 740 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
    { name: "desktop", viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
];

const issues = process.argv.slice(2);
if (issues.length === 0) {
    console.error("Usage: node tools/capture.mjs <issue> [<issue> …]");
    process.exit(1);
}

const escape = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const browser = await chromium.launch();
try {
    for (const issue of issues) {
        const { scenes } = await import(`./scenes/${issue}.mjs`);
        await mkdir(new URL(`../images/${issue}/`, import.meta.url), { recursive: true });
        const slides = [];

        for (const [index, scene] of scenes.entries()) {
            const file = `${String(index + 1).padStart(2, "0")}-${scene.name}`;
            for (const format of FORMATS) {
                const context = await browser.newContext({ ...format, baseURL: BASE_URL, locale: "fr-FR", timezoneId: "Europe/Paris", reducedMotion: "reduce" });
                // Nobody is logged in unless the scene says otherwise (as in Epika's e2e fixtures).
                const visitor = { status: 401, contentType: "application/problem+json", body: JSON.stringify({ status: 401 }) };
                await context.route("**/api/me", (route) => route.fulfill(visitor));
                await context.route("**/api/token/refresh", (route) => route.fulfill(visitor));
                const page = await context.newPage();

                await scene.play(page, context, format.name);
                // Fonts and images settled, no blinking caret in the shot.
                await page.evaluate(() => document.fonts.ready);
                // Next.js prefetches the pages a link points to (« /cgu » on the registration page, not built yet): those
                // requests may stay pending, so the wait is capped instead of failing the whole run.
                await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
                await page.screenshot({ path: fileURLToPath(new URL(`../images/${issue}/${file}-${format.name}.jpg`, import.meta.url)), type: "jpeg", quality: 80, caret: "hide", animations: "disabled" });
                await context.close();
            }
            slides.push({ file, scene });
            console.log(`#${issue} ${file}`);
        }

        // The slides of the gallery (gallery.js and gallery.css), ready to paste into issues/<issue>-….html, inside
        // the <ul class="gallery-track"> of the block shown in README.md.
        const html = slides
            .map(({ file, scene }, index) => `        <li class="slide">
          <figure>
            <div class="shots">
              <img class="shot-desktop" src="../images/${issue}/${file}-desktop.jpg" width="1280" height="800" loading="lazy" alt="${escape(scene.alt)} Sur ordinateur.">
              <img class="shot-mobile" src="../images/${issue}/${file}-mobile.jpg" width="360" height="740" loading="lazy" alt="${escape(scene.alt)} Sur téléphone.">
            </div>
            <figcaption><span class="slide-num">${index + 1}</span> ${escape(scene.caption)}</figcaption>
          </figure>
        </li>`)
            .join("\n");
        await mkdir(new URL("./out/", import.meta.url), { recursive: true });
        await writeFile(new URL(`./out/${issue}.html`, import.meta.url), `${html}\n`, "utf8");
    }
} finally {
    await browser.close();
}
