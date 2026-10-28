/** Намерение движения: оси примерно от -1 до 1. */
export interface MoveCommand {
  readonly x: number;
  readonly y: number;
}

/** Главный герой в симуляции: позиция и движение. Без Phaser и без клавиатуры. */
export class Hero {
  private x = 0;
  private y = 0;
  private readonly speed = 180;

  applyMovement(move: MoveCommand, deltaSeconds: number): void {
    const length = Math.hypot(move.x, move.y);
    if (length === 0) {
      return;
    }

    const nx = move.x / length;
    const ny = move.y / length;
    this.x += nx * this.speed * deltaSeconds;
    this.y += ny * this.speed * deltaSeconds;
  }

  getSnapshot(): { readonly x: number; readonly y: number } {
    return { x: this.x, y: this.y };
  }
}
