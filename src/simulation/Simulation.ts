import { Hero, type MoveCommand } from "./Hero";

export type { MoveCommand } from "./Hero";

/** Публичная readonly-граница, которую потребляет слой представления. */
export interface SimulationSnapshot {
  readonly tick: number;
  readonly elapsedSeconds: number;
  readonly hero: {
    readonly x: number;
    readonly y: number;
  };
}

/** Чистый TypeScript: без Phaser, DOM, таймеров и зависимостей от рендера. */
export class Simulation {
  private tick = 0;
  private elapsedSeconds = 0;
  private readonly hero = new Hero();
  private move: MoveCommand = { x: 0, y: 0 };

  setMoveCommand(command: MoveCommand): void {
    this.move = command;
  }

  step(deltaSeconds: number): void {
    if (!Number.isFinite(deltaSeconds) || deltaSeconds <= 0) {
      throw new RangeError(
        "Simulation step must be a positive finite duration.",
      );
    }

    this.tick += 1;
    this.elapsedSeconds += deltaSeconds;
    this.hero.applyMovement(this.move, deltaSeconds);
  }

  getSnapshot(): SimulationSnapshot {
    return {
      tick: this.tick,
      elapsedSeconds: this.elapsedSeconds,
      hero: this.hero.getSnapshot(),
    };
  }
}
