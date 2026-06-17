import { SCORE_CONFIG } from "../config/scoreConfig";
import type { CoinType } from "../types/segments";

export interface ScoreSnapshot {
  furthestX: number;
  distanceUnits: number;
  distanceScore: number;
  normalCoins: number;
  riskCoins: number;
  coinScore: number;
  totalScore: number;
}

export class ScoreTracker {
  private furthestX: number;
  private normalCoins = 0;
  private riskCoins = 0;

  constructor(private readonly startX: number) {
    this.furthestX = startX;
  }

  updateProgress(playerX: number): ScoreSnapshot {
    if (playerX > this.furthestX) {
      this.furthestX = playerX;
    }

    return this.getSnapshot();
  }

  collectCoin(type: CoinType): ScoreSnapshot {
    if (type === "risk") {
      this.riskCoins += 1;
    } else {
      this.normalCoins += 1;
    }

    return this.getSnapshot();
  }

  getSnapshot(): ScoreSnapshot {
    const distancePx = Math.max(0, this.furthestX - this.startX);
    const distanceUnits = Math.floor(distancePx / SCORE_CONFIG.distanceUnitPx);
    const distanceScore = distanceUnits * SCORE_CONFIG.distanceMultiplier;
    const coinScore =
      this.normalCoins * SCORE_CONFIG.normalCoinValue +
      this.riskCoins * SCORE_CONFIG.riskCoinValue;

    return {
      furthestX: this.furthestX,
      distanceUnits,
      distanceScore,
      normalCoins: this.normalCoins,
      riskCoins: this.riskCoins,
      coinScore,
      totalScore: distanceScore + coinScore
    };
  }
}
