import { SCORE_CONFIG } from "../config/scoreConfig";

export interface EventFeedbackConfig {
  title: string;
  detail: string;
  accent: number;
  iconKey: string;
  durationMs: number;
}

export function feedbackForCoin(type: "normal" | "risk"): EventFeedbackConfig {
  if (type === "risk") {
    return {
      title: "RISK SEED",
      detail: `+${SCORE_CONFIG.riskCoinValue} bonus · clean escape`,
      accent: 0xffb423,
      iconKey: "coin-risk",
      durationMs: 1450
    };
  }

  return {
    title: "SEED",
    detail: `+${SCORE_CONFIG.normalCoinValue} collected`,
    accent: 0x1388dc,
    iconKey: "coin-normal",
    durationMs: 1150
  };
}

export function feedbackForStomp(): EventFeedbackConfig {
  return {
    title: "STOMP",
    detail: "Enemy cleared · bounce!",
    accent: 0xffcf74,
    iconKey: "stompable-enemy",
    durationMs: 1150
  };
}

export function feedbackForSlow(): EventFeedbackConfig {
  return {
    title: "MUD",
    detail: "Movement slowed · keep control",
    accent: 0x8b5a2b,
    iconKey: "mud-pit",
    durationMs: 1050
  };
}

export function feedbackForShieldBreak(): EventFeedbackConfig {
  return {
    title: "SHIELD POP",
    detail: "Bubble blocked one hit",
    accent: 0x2fb9eb,
    iconKey: "bubble-shield",
    durationMs: 1300
  };
}
