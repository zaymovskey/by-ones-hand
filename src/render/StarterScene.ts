import Phaser from "phaser";
import type { MoveCommand, SimulationSnapshot } from "../simulation/Simulation";
import { HeroView } from "./HeroView";

/** Обновить мир за кадр: время + намерение движения → снимок. */
export type UpdateWorld = (
  frameSeconds: number,
  move: MoveCommand,
) => SimulationSnapshot;

/** Только представление. Сцена не владеет и не меняет состояние симуляции. */
export class StarterScene extends Phaser.Scene {
  private readonly updateWorld: UpdateWorld;
  private heroView!: HeroView;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };

  constructor(updateWorld: UpdateWorld) {
    super({ key: "StarterScene" });
    this.updateWorld = updateWorld;
  }

  create(): void {
    this.cameras.main.setBackgroundColor("#151719");

    // Phaser будет обновлять этот объект каждый кадр, проверяя нажатия клавиш.
    this.wasd = this.input.keyboard!.addKeys("W,A,S,D") as typeof this.wasd;

    this.heroView = new HeroView(this);
  }

  update(_time: number, deltaMilliseconds: number): void {
    // Намерение движения по двум осям.
    let x = 0;
    let y = 0;
    if (this.wasd.D.isDown) x += 1; // вправо
    if (this.wasd.A.isDown) x -= 1; // влево
    if (this.wasd.S.isDown) y += 1; // вниз
    if (this.wasd.W.isDown) y -= 1; // вверх
    const move: MoveCommand = { x, y };

    // Сколько прошло секунд с предыдущего кадра.
    // Потому что кадры неравномерные по длительности. И если у нас скорость 180,
    // то если один кадр длился секнду, то мы пройдем 180 пикселей, а если 0.5 секунды,
    // то 90 пикселей. Поэтому нам нужно вычислить сколько пикселей мы пройдем за время кадра.
    const deltaSeconds = deltaMilliseconds / 1000;

    const snapshot = this.updateWorld(deltaSeconds, move);

    this.renderSnapshot(snapshot);
  }

  private renderSnapshot(snapshot: SimulationSnapshot): void {
    this.heroView.sync(snapshot.hero);
  }
}

// Основная схема архитиктуры:
// 1. Сцена получает время от Phaser и намерение движения от игрока.
// 2. Сцена передает эти данные в симуляцию.
// 3. Симуляция принимает эти данные и обновляет мир и отдает сцене снимок
// 4. Сцена получает снимок данных и рисует картинку по данным из снимка.
