// Generates one print-quality PDF per CV variant into public/cv/.
//
// Why this exists: the CV pages are designed for a full-width browser window, and the
// site previously shipped a single hand-made PDF that every variant's download button
// pointed at — so the Graphics CV handed visitors the generic one. That PDF was also
// produced by html2canvas, which rasterises the page: 491KB of JPEGs with no text layer,
// which the CV parsers most large employers run read as an empty document.
//
// This drives real Chrome over the live dev server and uses its print pipeline, so the
// output has selectable text with ToUnicode maps. The A4 print rules are INJECTED here
// rather than shipped in the app, so nothing about the live site's appearance changes.
//
//   npm run build:cv-pdfs
//
// Requires a local Chrome (`npx puppeteer browsers install chrome`). Must run against
// the DEV server: the selectors below key off Emotion's component labels
// (css-HASH-ColumnLeft), and Emotion strips those from production builds.
import { spawn } from "node:child_process";
import { access, mkdir, readdir, readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "public/cv");
const PORT = 5199;

const VARIANTS = [
  { route: "/cv", file: "Ian_Hamblin_CV.pdf", twoColumn: false },
  { route: "/cvweb", file: "Ian_Hamblin_CV_Web.pdf", twoColumn: true },
  { route: "/cvgraphics", file: "Ian_Hamblin_CV_Graphics.pdf", twoColumn: true },
  { route: "/cv3d", file: "Ian_Hamblin_CV_3D.pdf", twoColumn: true },
  { route: "/cvart", file: "Ian_Hamblin_CV_Art.pdf", twoColumn: false }
];

/** Undoes the app shell's fixed/viewport layout so the CV can flow onto paper. */
const BASE_CSS = `
@page { size: A4; margin: 0; }
* { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
html, body { width: 210mm !important; height: auto !important; min-height: 0 !important;
  overflow: visible !important; margin: 0 !important; padding: 0 !important; }
/* Only <html> carries a background. Every wrapper below it must be transparent, or it
   covers the page-canvas background — which in the two-column variants is the dark
   column itself, leaving white-on-white text where the name and contact block should be. */
html { background: #fff !important; }
/* App.css sets background-color:#000, height:100% and overflow:hidden on
   html, body, #root and .App. The last two must be reset as well — otherwise they paint
   solid black over the page-canvas background and clip everything past the first
   viewport height. */
body, #root, .App { background: transparent !important; height: auto !important;
  overflow: visible !important; }
#initial-loader { display: none !important; }
[class*="-AppWrapper"] { height: auto !important; overflow: visible !important; background: transparent !important; }
[class*="-Overlay"] { position: static !important; height: auto !important; min-height: 0 !important;
  overflow: visible !important; display: block !important; background: transparent !important; }
[class*="-ContentWrapper"], [class*="-PageWrapper"] { height: auto !important; min-height: 0 !important;
  overflow: visible !important; display: block !important; background: transparent !important; }
[class*="-CVWrapper"] { height: auto !important; overflow: visible !important; display: block !important;
  background: transparent !important; }
/* Chrome, and the button itself, must not appear on paper. */
[class*="-DownloadButton"], [class*="-HeroBanner"], [class*="-FooterArea"],
[class*="-AppBarWrapper"], [class*="-TitleBannerWrapper"] { display: none !important; }
/* Sized in viewport units on screen; meaningless on paper. */
[class*="-SkillsBox"] { min-width: 0 !important; }
`;

/**
 * The dark column is painted as a gradient on <html> with an ABSOLUTE 84mm stop (40% of
 * A4). Backgrounds on <html> propagate to the page canvas and so repeat on every page,
 * which a fragmented flex child does not; and a percentage stop would be measured
 * against the viewport rather than the 210mm body, sliding the stripe across the text.
 */
const TWO_COLUMN_CSS = `
html { background: linear-gradient(to right, #333 0 84mm, #fff 84mm 100%) !important; }
[class*="-CVWrapper"] > div { display: flex !important; align-items: flex-start !important; }
[class*="-ColumnLeft"] { width: 84mm !important; padding: 0 7mm 8mm 9mm !important;
  box-sizing: border-box !important; background: transparent !important; }
[class*="-ColumnRight"] { width: 126mm !important; padding: 0 9mm 8mm 7mm !important;
  box-sizing: border-box !important; background: transparent !important; }
`;

/**
 * CVMain and CVArtMain place two Rows side by side, which on a 1440px screen reads as a
 * comfortable four-column header but at 210mm collapses to columns of 134/182/318/88px —
 * unreadable, and it pushes the CV to three pages. Stacking the Rows lets each use the
 * full page width. Only the direct children of CVWrapper are targeted, so the nested
 * Rows (education dates, employment banners) keep their horizontal layout.
 */
const SINGLE_COLUMN_CSS = `
[class*="-CVWrapper"] > [class*="-Section"] { flex-direction: column !important; }
`;

const exists = async (p) => access(p).then(() => true).catch(() => false);

async function findChrome() {
  for (const p of ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"]) {
    if (await exists(p)) return p;
  }
  const cache = join(homedir(), ".cache/puppeteer/chrome");
  if (await exists(cache)) {
    const builds = (await readdir(cache))
      .map((d) => ({ d, v: Number(d.match(/-(\d+)\./)?.[1] ?? 0) }))
      .sort((a, b) => b.v - a.v);
    for (const { d } of builds) {
      const bin = join(cache, d, "chrome-linux64", "chrome");
      if (await exists(bin)) return bin;
    }
  }
  return null;
}

/** A PDF of images would defeat the point, so assert the text layer really is there. */
async function assertHasTextLayer(path) {
  const d = await readFile(path);
  const images = d.toString("latin1").split("DCTDecode").length - 1;
  const toUnicode = d.toString("latin1").split("ToUnicode").length - 1;
  if (toUnicode === 0) throw new Error(`${path}: no ToUnicode maps — text is not extractable`);
  return { images, toUnicode, kb: Math.round(d.length / 1024) };
}

const chrome = await findChrome();
if (!chrome) {
  console.error("No Chrome found. Run:  npx puppeteer browsers install chrome");
  process.exit(1);
}

await mkdir(OUT_DIR, { recursive: true });

console.log(`starting vite on :${PORT} ...`);
// Spawn the binary directly, in its own process group. Going through `npx` leaves the
// real vite process orphaned when we kill the wrapper, and it keeps holding the port —
// which then makes the *next* run fail on --strictPort.
const vite = spawn(join(ROOT, "node_modules/.bin/vite"), ["--port", String(PORT), "--strictPort"], {
  cwd: ROOT,
  stdio: "pipe",
  detached: true
});
const ready = new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error("vite did not start within 60s")), 60_000);
  vite.stdout.on("data", (b) => {
    if (b.toString().includes("Local:")) { clearTimeout(timer); resolve(); }
  });
  vite.on("exit", (c) => reject(new Error(`vite exited early (${c})`)));
});

let failed = false;
try {
  await ready;
  const { default: puppeteer } = await import("puppeteer");
  const browser = await puppeteer.launch({ executablePath: chrome, args: ["--no-sandbox"] });
  try {
    const page = await browser.newPage();
    for (const v of VARIANTS) {
      await page.goto(`http://localhost:${PORT}${v.route}`, { waitUntil: "networkidle0" });
      await page.evaluateHandle("document.fonts.ready");

      // Emotion only emits component labels in dev. If they are missing every selector
      // above silently does nothing and the PDF comes out as an unstyled screen dump,
      // so check rather than produce a plausible-looking wrong file.
      const labelled = await page.evaluate(() => !!document.querySelector("[class*='-CVWrapper']"));
      if (!labelled) throw new Error(`${v.route}: no Emotion component labels found — are you running a production build?`);

      await page.addStyleTag({ content: BASE_CSS + (v.twoColumn ? TWO_COLUMN_CSS : SINGLE_COLUMN_CSS) });
      if (v.twoColumn) {
        const ok = await page.evaluate(() => !!document.querySelector("[class*='-ColumnLeft']"));
        if (!ok) throw new Error(`${v.route}: expected a two-column layout but found no ColumnLeft`);
      }
      await page.evaluateHandle("document.fonts.ready");

      const out = join(OUT_DIR, v.file);
      await page.pdf({ path: out, format: "A4", printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 } });

      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      const stats = await assertHasTextLayer(out);
      const pages = (height / 1123).toFixed(1);
      console.log(`  ${v.file.padEnd(28)} ${String(stats.kb).padStart(4)}KB  ~${pages} pages  images:${stats.images}  ToUnicode:${stats.toUnicode}`);
    }
  } finally {
    await browser.close();
  }
} catch (e) {
  failed = true;
  console.error("FAILED:", e.message);
} finally {
  // Negative pid = the whole process group, so no vite survives to hold the port.
  try { process.kill(-vite.pid, "SIGTERM"); } catch { /* already gone */ }
}
process.exit(failed ? 1 : 0);
