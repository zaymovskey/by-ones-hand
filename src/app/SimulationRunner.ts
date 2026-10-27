import { Simulation, type SimulationSnapshot } from '../simulation/Simulation';

const STEP_SECONDS = 1 / 60;
const MAX_FRAME_SECONDS = 0.1;

/** Converts variable browser frame durations into fixed simulation steps. */
export class SimulationRunner {
  private readonly simulation = new Simulation();
  private accumulator = 0;

  advance(frameSeconds: number): SimulationSnapshot {
    // Bound catch-up work after a suspended tab or a long frame.
    this.accumulator += Math.min(Math.max(frameSeconds, 0), MAX_FRAME_SECONDS);
    while (this.accumulator >= STEP_SECONDS) {
      this.simulation.step(STEP_SECONDS);
      this.accumulator -= STEP_SECONDS;
    }
    return this.simulation.getSnapshot();
  }
}