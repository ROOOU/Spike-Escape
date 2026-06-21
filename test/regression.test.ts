import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SHIPPED_PATHS = [
  "README.md",
  "index.html",
  "docs",
  "src"
];
const FORBIDDEN = [
  /VoiceRun/i,
  /voice[- ]?control/i,
  /microphone/i,
  /AVAudio/i,
  /SpriteKit/i
];

function collectFiles(targetPath: string): string[] {
  const absolute = path.join(ROOT, targetPath);
  const stat = fs.statSync(absolute);

  if (stat.isFile()) {
    return [absolute];
  }

  return fs
    .readdirSync(absolute)
    .flatMap((entry) => collectFiles(path.join(targetPath, entry)));
}

function readPngSize(file: string): { width: number; height: number } | undefined {
  const buffer = fs.readFileSync(file);
  const pngSignature = "89504e470d0a1a0a";
  if (buffer.subarray(0, 8).toString("hex") !== pngSignature) {
    return undefined;
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20)
  };
}

describe("regression scan", () => {
  it("keeps legacy naming out of shipped docs and UI files", () => {
    const files = SHIPPED_PATHS.flatMap(collectFiles);
    const failures: string[] = [];

    files.forEach((file) => {
      const content = fs.readFileSync(file, "utf8");
      FORBIDDEN.forEach((pattern) => {
        if (pattern.test(content)) {
          failures.push(`${path.relative(ROOT, file)} matches ${pattern}`);
        }
      });
    });

    expect(failures).toEqual([]);
  });

  it("does not scale the physics player sprite during gameplay", () => {
    const controller = fs.readFileSync(
      path.join(ROOT, "src/systems/PlayerController.ts"),
      "utf8"
    );

    expect(controller).toContain("readonly visual");
    expect(controller).not.toMatch(/this\.sprite\.setScale\(/);
    expect(controller).not.toMatch(/targets:\s*this\.sprite/);
  });

  it("keeps concept sheets out of shipped public assets", () => {
    const publicFiles = collectFiles("public");
    const pngSheets = publicFiles
      .filter((file) => file.endsWith(".png"))
      .map((file) => ({
        file: path.relative(ROOT, file),
        size: readPngSize(file)
      }))
      .filter(({ file, size }) =>
        file.includes("ChatGPT Image") ||
        (size?.width === 1448 && size.height === 1086)
      );

    expect(pngSheets).toEqual([]);
  });
});
