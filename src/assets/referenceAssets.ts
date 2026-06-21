export interface ReferenceAsset {
  key: string;
  path: string;
}

export const REFERENCE_ASSETS: ReferenceAsset[] = [
  { key: "backdrop-sky", path: "/reference-style/sky.png" },
  { key: "backdrop-hills", path: "/reference-style/background1.png" },
  { key: "reference-player", path: "/reference-style/player3.png" },
  { key: "coin-normal", path: "/game-assets/pickups/coin-normal.png" },
  { key: "coin-risk", path: "/game-assets/pickups/coin-risk.png" },
  { key: "bubble-shield-pickup", path: "/game-assets/pickups/bubble-shield.png" },
  { key: "magnet-star", path: "/game-assets/pickups/magnet-star.png" },
  { key: "stopwatch", path: "/game-assets/pickups/stopwatch.png" },
  { key: "ui-coin", path: "/game-assets/ui/coin.png" },
  { key: "ui-warning", path: "/game-assets/ui/warning.png" },
  { key: "ui-shield", path: "/game-assets/ui/shield.png" },
  { key: "ui-heart", path: "/game-assets/ui/heart.png" },
  { key: "head-plain", path: "/game-assets/heads/plain.png" },
  { key: "head-bubble", path: "/game-assets/heads/bubble.png" },
  { key: "head-broken", path: "/game-assets/heads/broken.png" },
  { key: "head-redflower", path: "/game-assets/heads/redflower.png" },
  { key: "grass-tuft", path: "/game-assets/decor/grass-tuft.png" },
  { key: "flower-red", path: "/game-assets/decor/flower-red.png" },
  { key: "flower-blue", path: "/game-assets/decor/flower-blue.png" },
  { key: "shrub", path: "/game-assets/decor/shrub.png" },
  { key: "spike", path: "/game-assets/hazards/spike.png" },
  { key: "spike-long", path: "/game-assets/hazards/spike-long.png" },
  { key: "thorn-vine", path: "/game-assets/hazards/thorn-vine.png" },
  { key: "flame-vent", path: "/game-assets/hazards/flame-vent.png" },
  { key: "falling-rock", path: "/game-assets/hazards/falling-rock.png" },
  { key: "crumbling-platform", path: "/game-assets/hazards/crumbling-platform.png" },
  { key: "stomp-slime", path: "/game-assets/enemies/stomp-slime.png" },
  { key: "mole", path: "/game-assets/enemies/mole.png" },
  { key: "beetle", path: "/game-assets/enemies/beetle.png" }
] as const;
