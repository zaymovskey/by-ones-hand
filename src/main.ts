import Phaser from "phaser";
import { SimulationRunner } from "./app/SimulationRunner";
import { StarterScene } from "./render/StarterScene";
import "./style.css";

// Корень композиции: связывает независимую симуляцию с адаптером Phaser.
const runner = new SimulationRunner();
const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  backgroundColor: "#151719",
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  scene: [new StarterScene((seconds) => runner.advance(seconds))],
});

if (import.meta.hot) {
  import.meta.hot.dispose(() => game.destroy(true));
}
