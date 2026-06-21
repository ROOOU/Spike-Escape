import fs from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";

const root = process.cwd();
const distDir = path.join(root, "dist");
const assetsDir = path.join(distDir, "assets");
const publicRefDir = path.join(root, "public", "reference-style");
const publicGameAssetsDir = path.join(root, "public", "game-assets");

const KiB = 1024;
const BUDGETS = {
  entryJsGzip: 30 * KiB,
  totalJsGzip: 380 * KiB,
  totalCssGzip: 24 * KiB,
  totalRuntimeImageAssetsRaw: 240 * KiB
};

function collectFiles(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const absolute = path.join(dir, entry.name);
      return entry.isDirectory() ? collectFiles(absolute) : [absolute];
    });
}

function gzipSize(file) {
  return gzipSync(fs.readFileSync(file)).byteLength;
}

function formatBytes(bytes) {
  return `${(bytes / KiB).toFixed(1)} KiB`;
}

function readEntryScriptName() {
  const html = fs.readFileSync(path.join(distDir, "index.html"), "utf8");
  const match = html.match(/<script[^>]+src="\/assets\/([^"]+\.js)"/);
  return match?.[1] ?? "";
}

function check(label, actual, budget, failures) {
  const ok = actual <= budget;
  console.log(`${ok ? "OK " : "ERR"} ${label}: ${formatBytes(actual)} / ${formatBytes(budget)}`);
  if (!ok) {
    failures.push(`${label} exceeded ${formatBytes(budget)} with ${formatBytes(actual)}`);
  }
}

if (!fs.existsSync(distDir)) {
  throw new Error("dist/ does not exist. Run vite build before checking bundle size.");
}

const assets = collectFiles(assetsDir);
const jsFiles = assets.filter((file) => file.endsWith(".js"));
const cssFiles = assets.filter((file) => file.endsWith(".css"));
const referenceFiles = collectFiles(publicRefDir);
const gameAssetFiles = collectFiles(publicGameAssetsDir);
const entryScriptName = readEntryScriptName();
const entryScript = jsFiles.find((file) => path.basename(file) === entryScriptName);
const totalJsGzip = jsFiles.reduce((sum, file) => sum + gzipSize(file), 0);
const totalCssGzip = cssFiles.reduce((sum, file) => sum + gzipSize(file), 0);
const totalRuntimeImageAssetsRaw = [...referenceFiles, ...gameAssetFiles].reduce(
  (sum, file) => sum + fs.statSync(file).size,
  0
);
const failures = [];

if (!entryScript) {
  failures.push("Could not find the entry script emitted by Vite.");
} else {
  check("entry JS gzip", gzipSize(entryScript), BUDGETS.entryJsGzip, failures);
}

check("total JS gzip", totalJsGzip, BUDGETS.totalJsGzip, failures);
check("total CSS gzip", totalCssGzip, BUDGETS.totalCssGzip, failures);
check(
  "runtime image assets raw",
  totalRuntimeImageAssetsRaw,
  BUDGETS.totalRuntimeImageAssetsRaw,
  failures
);

if (!jsFiles.some((file) => path.basename(file).startsWith("phaser-"))) {
  failures.push("Expected Phaser to be emitted as its own manual chunk.");
}

if (failures.length > 0) {
  console.error(`\nBundle budget failed:\n${failures.map((failure) => `- ${failure}`).join("\n")}`);
  process.exitCode = 1;
}
