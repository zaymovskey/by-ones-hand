import { SWORD_SECTOR_HALF_ANGLE } from './heroLayout';

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
  /**
   * Куда смотрит корпус. Пока фиксированно +X (вправо).
   * Позже — ориентация на противника; меч от корпуса отделён.
   */
  private bodyFacing = 0;
  /** Абсолютный угол меча в мире (радианы). */
  private swordAngle = 0;
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

  /** Направить меч к курсору, но только внутри переднего сектора корпуса. */
  aimSwordToward(cursor: CursorCommand): void {
    const dx = cursor.x - this.x;
    const dy = cursor.y - this.y;
    if (dx === 0 && dy === 0) {
      return;
    }

    const desired = Math.atan2(dy, dx);
    const relative = clampAngle(
      wrapAngle(desired - this.bodyFacing),
      -SWORD_SECTOR_HALF_ANGLE,
      SWORD_SECTOR_HALF_ANGLE,
    );
    this.swordAngle = this.bodyFacing + relative;
  }

  getSnapshot(): {
    readonly x: number;
    readonly y: number;
    readonly bodyFacing: number;
    readonly swordAngle: number;
  } {
    return {
      x: this.x,
      y: this.y,
      bodyFacing: this.bodyFacing,
      swordAngle: this.swordAngle,
    };
  }
}

/** Свести угол к (-π, π]. */
function wrapAngle(angle: number): number {
  const wrapped = ((angle + Math.PI) % (Math.PI * 2)) - Math.PI;
  return wrapped <= -Math.PI ? wrapped + Math.PI * 2 : wrapped;
}

function clampAngle(angle: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, angle));
}
