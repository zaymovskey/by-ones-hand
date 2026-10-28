import Phaser from 'phaser';
import type {
  AimCommand,
  MoveCommand,
  SimulationSnapshot,
} from '../simulation/Simulation';
import { HeroView } from './HeroView';

/** Обновить мир за кадр: время + движение + прицел → снимок. */
export type UpdateWorld = (
  frameSeconds: number,
  move: MoveCommand,
  aim: AimCommand,
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
    super({ key: 'StarterScene' });
    this.updateWorld = updateWorld;
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#151719');

    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as typeof this.wasd;

    this.heroView = new HeroView(this);
    this.cameras.main.centerOn(0, 0);
  }

  update(_time: number, deltaMilliseconds: number): void {
    let x = 0;
    let y = 0;
    if (this.wasd.D.isDown) x += 1;
    if (this.wasd.A.isDown) x -= 1;
    if (this.wasd.S.isDown) y += 1;
    if (this.wasd.W.isDown) y -= 1;
    const move: MoveCommand = { x, y };

    const pointer = this.input.activePointer;
    pointer.updateWorldPoint(this.cameras.main);
    const aim: AimCommand = {
      x: pointer.worldX,
      y: pointer.worldY,
    };

    const deltaSeconds = deltaMilliseconds / 1000;
    const snapshot = this.updateWorld(deltaSeconds, move, aim);
    this.renderSnapshot(snapshot);
  }

  private renderSnapshot(snapshot: SimulationSnapshot): void {
    this.heroView.sync(snapshot.hero);
  }
}
