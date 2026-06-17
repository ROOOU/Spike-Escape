export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function toFiniteNonNegative(value: string | null): number {
  if (value === null) {
    return 0;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return parsed;
}

export function loadBestScore(
  storageKey: string,
  storage: StorageLike | null | undefined
): number {
  if (!storage) {
    return 0;
  }

  return toFiniteNonNegative(storage.getItem(storageKey));
}

export function saveBestScore(
  score: number,
  storageKey: string,
  storage: StorageLike | null | undefined
): number {
  const nextScore = Math.max(0, Math.floor(score));
  const best = Math.max(nextScore, loadBestScore(storageKey, storage));

  if (storage) {
    storage.setItem(storageKey, String(best));
  }

  return best;
}
