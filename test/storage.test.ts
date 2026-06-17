import { describe, expect, it } from "vitest";
import { loadBestScore, saveBestScore } from "../src/utils/storage";

function createStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key: string) {
      return values.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      values.set(key, value);
    }
  };
}

describe("storage", () => {
  it("loads an existing best score", () => {
    const storage = createStorage({ best: "420" });
    expect(loadBestScore("best", storage)).toBe(420);
  });

  it("normalizes invalid persisted values", () => {
    const storage = createStorage({ best: "oops" });
    expect(loadBestScore("best", storage)).toBe(0);
  });

  it("saves the highest score only", () => {
    const storage = createStorage({ best: "300" });
    expect(saveBestScore(240, "best", storage)).toBe(300);
    expect(saveBestScore(480, "best", storage)).toBe(480);
    expect(loadBestScore("best", storage)).toBe(480);
  });
});
