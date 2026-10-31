/** Намерение движения: оси примерно от -1 до 1. */
export interface MoveCommand {
  readonly x: number;
  readonly y: number;
}

/** Положение курсора в мире. */
export interface CursorCommand {
  readonly x: number;
  readonly y: number;
}

/** Главный герой в симуляции: позиция, движение, направление меча. Без Phaser. */
export class Hero {
  private x = 0;
  private y = 0;
  /** Угол в радианах: 0 = меч вправо (+X), как локальная палка в HeroView. */
  private facingAngle = 0;
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

  /** Повернуть лицом/мечом к положению курсора в мире. */
  faceToward(cursor: CursorCommand): void {
    const dx = cursor.x - this.x;
    const dy = cursor.y - this.y;
    if (dx === 0 && dy === 0) {
      return;
    }
    this.facingAngle = Math.atan2(dy, dx);
  }

  getSnapshot(): {
    readonly x: number;
    readonly y: number;
    readonly facingAngle: number;
  } {
    return { x: this.x, y: this.y, facingAngle: this.facingAngle };
  }
}
