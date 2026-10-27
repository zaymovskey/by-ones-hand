import Phaser from 'phaser';
import type { SimulationSnapshot } from '../simulation/Simulation';

export type AdvanceSimulation = (frameSeconds: number) => SimulationSnapshot;

/** Только представление. Сцена не владеет и не меняет состояние симуляции. */
export class StarterScene extends Phaser.Scene {
  constructor(private readonly advanceSimulation: AdvanceSimulation) {
    super({ key: 'StarterScene' });
  }

  create(): void {
    // Пустая сцена намеренно. Добавляй представление сюда, когда попросят фичу.
    this.cameras.main.setBackgroundColor('#151719');
  }

  update(_time: number, deltaMilliseconds: number): void {
    const snapshot = this.advanceSimulation(deltaMilliseconds / 1000);
    this.renderSnapshot(snapshot);
  }

  private renderSnapshot(_snapshot: SimulationSnapshot): void {
    // Будущая графика читает снимки; игровых объектов пока нет.
  }
}