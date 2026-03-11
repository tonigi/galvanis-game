import "./styles.css";
import { GalvanisGame } from "./game/Game";

const game = new GalvanisGame();

game.start();

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    game.destroy();
  });
}
