import Phaser from 'phaser';
import type { SimulationSnapshot } from '../simulation/Simulation';

export type AdvanceSimulation = (frameSeconds: number) => SimulationSnapshot;

/** Presentation only. The scene neither owns nor mutates simulation state. */
export class StarterScene extends Phaser.Scene {
  constructor(private readonly advanceSimulation: AdvanceSimulation) {
    super({ key: 'StarterScene' });
  }

  create(): void {
    // Empty scene by design. Add presentation here when a feature is requested.
    this.cameras.main.setBackgroundColor('#151719');
  }

  update(_time: number, deltaMilliseconds: number): void {
    const snapshot = this.advanceSimulation(deltaMilliseconds / 1000);
    this.renderSnapshot(snapshot);
  }

  private renderSnapshot(_snapshot: SimulationSnapshot): void {
    // Future visuals consume snapshots; there are no game objects yet.
  }
}