import "./styles.css";

const gameRoot = document.getElementById("game-root");

if (!gameRoot) {
  throw new Error("Missing #game-root container.");
}

void import("./game/startGame")
  .then(({ startGame }) => {
    const game = startGame();
    window.addEventListener("beforeunload", () => {
      game.destroy(true);
    });
  })
  .catch((error: unknown) => {
    console.error("Failed to start Spike Escape.", error);
    gameRoot.textContent = "Spike Escape failed to load. Please refresh.";
  });
