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
});
