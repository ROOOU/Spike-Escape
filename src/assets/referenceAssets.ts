export interface ReferenceAsset {
  key: string;
  path: string;
}

export const REFERENCE_ASSETS: ReferenceAsset[] = [
  { key: "backdrop-sky", path: "/reference-style/sky.png" },
  { key: "backdrop-hills", path: "/reference-style/background1.png" },
  { key: "reference-player", path: "/reference-style/player3.png" },
  { key: "coin-normal", path: "/reference-style/flower-leaf.png" },
  { key: "coin-risk", path: "/reference-style/flowerleafplayer.png" },
  { key: "tutorial-left-right", path: "/reference-style/tutorial.png" },
  { key: "tutorial-jump", path: "/reference-style/tutorial1.png" },
  { key: "tutorial-wall", path: "/reference-style/tutorial2.png" },
  { key: "tutorial-gap", path: "/reference-style/tutorial3.png" },
  { key: "tutorial-hazard", path: "/reference-style/tutorial4.png" },
  { key: "tutorial-collect", path: "/reference-style/tutorial5.png" }
] as const;
