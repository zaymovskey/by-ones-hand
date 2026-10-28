import {
  Simulation,
  type MoveCommand,
  type SimulationSnapshot,
} from '../simulation/Simulation';

/** Длина одного шага правил мира. Всегда одинаковая, не зависит от FPS. */
const STEP_SECONDS = 1 / 60;

/** Потолок на один кадр: после паузы вкладки не гоняем десятки step подряд. */
const MAX_FRAME_SECONDS = 0.1;

/**
 * Метроном между Phaser и симуляцией.
 * Кадр экрана бывает разной длины; мир крутим только порциями по STEP_SECONDS.
 */
export class SimulationRunner {
  private readonly simulation = new Simulation();

  /** Копилка непрокрученного времени (в секундах). */
  private accumulator = 0;

  updateWorld(
    frameSeconds: number,
    move: MoveCommand = { x: 0, y: 0 },
  ): SimulationSnapshot {
    // Запомнить намерение игрока до шагов этого кадра.
    this.simulation.setMoveCommand(move);

    // Добавить длительность кадра в копилку (не меньше 0, не больше потолка).
    this.accumulator += Math.min(Math.max(frameSeconds, 0), MAX_FRAME_SECONDS);

    // Пока в копилке хватает на один полный шаг — крутим мир ровно на STEP_SECONDS.
    // Длинный кадр → несколько step подряд. Короткий → step может подождать до следующего кадра.
    while (this.accumulator >= STEP_SECONDS) {
      this.simulation.step(STEP_SECONDS);
      this.accumulator -= STEP_SECONDS;
    }

    // Отдать сцене снимок после догона времени.
    return this.simulation.getSnapshot();
  }
}
