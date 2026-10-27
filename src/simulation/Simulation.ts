/** Public read-only boundary consumed by the presentation layer. */
export interface SimulationSnapshot {
  readonly tick: number;
  readonly elapsedSeconds: number;
}

/** Pure TypeScript: no Phaser, DOM, timers or rendering dependencies. */
export class Simulation {
  private tick = 0;
  private elapsedSeconds = 0;

  step(deltaSeconds: number): void {
    if (!Number.isFinite(deltaSeconds) || deltaSeconds <= 0) {
      throw new RangeError('Simulation step must be a positive finite duration.');
    }
    this.tick += 1;
    this.elapsedSeconds += deltaSeconds;
  }

  getSnapshot(): SimulationSnapshot {
    return { tick: this.tick, elapsedSeconds: this.elapsedSeconds };
  }
}