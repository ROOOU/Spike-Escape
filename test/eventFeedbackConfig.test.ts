import { describe, expect, it } from "vitest";
import { SCORE_CONFIG } from "../src/config/scoreConfig";
import {
  feedbackForCoin,
  feedbackForShieldBreak,
  feedbackForSlow,
  feedbackForStomp
} from "../src/ui/eventFeedbackConfig";

describe("event feedback config", () => {
  it("creates visible HUD feedback for normal coins", () => {
    expect(feedbackForCoin("normal")).toEqual({
      title: "SEED",
      detail: `+${SCORE_CONFIG.normalCoinValue} collected`,
      accent: 0x1388dc,
      iconKey: "coin-normal",
      durationMs: 1150
    });
  });

  it("makes risk coin feedback distinct and longer-lived", () => {
    const normal = feedbackForCoin("normal");
    const risk = feedbackForCoin("risk");

    expect(risk.title).toBe("RISK SEED");
    expect(risk.detail).toContain(`+${SCORE_CONFIG.riskCoinValue}`);
    expect(risk.iconKey).toBe("coin-risk");
    expect(risk.accent).not.toBe(normal.accent);
    expect(risk.durationMs).toBeGreaterThan(normal.durationMs);
  });

  it("creates stomp feedback with the enemy icon", () => {
    expect(feedbackForStomp()).toMatchObject({
      title: "STOMP",
      iconKey: "stompable-enemy"
    });
  });

  it("creates readable soft-hazard and shield feedback", () => {
    expect(feedbackForSlow()).toMatchObject({
      title: "MUD",
      iconKey: "mud-pit"
    });
    expect(feedbackForShieldBreak()).toMatchObject({
      title: "SHIELD POP",
      iconKey: "bubble-shield"
    });
  });
});
