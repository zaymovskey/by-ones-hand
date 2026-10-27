import { Simulation, type SimulationSnapshot } from '../simulation/Simulation';

const STEP_SECONDS = 1 / 60;
const MAX_FRAME_SECONDS = 0.1;

/** Преобразует переменную длительность кадров браузера в фиксированные шаги симуляции. */
export class SimulationRunner {
  private readonly simulation = new Simulation();
  private accumulator = 0;

  advance(frameSeconds: number): SimulationSnapshot {
    // Ограничиваем догоняющую работу после свёрнутой вкладки или длинного кадра.
    this.accumulator += Math.min(Math.max(frameSeconds, 0), MAX_FRAME_SECONDS);
    while (this.accumulator >= STEP_SECONDS) {
      this.simulation.step(STEP_SECONDS);
      this.accumulator -= STEP_SECONDS;
    }
    return this.simulation.getSnapshot();
  }
}