import type Phaser from 'phaser';
import {
  HERO_BODY_RADIUS,
  SWORD_DAMAGE_LENGTH,
  SWORD_GAP,
  SWORD_LENGTH,
  SWORD_REACH_RADIUS,
  SWORD_SECTOR_HALF_ANGLE,
} from '../simulation/heroLayout';

/** Картинка главного героя. Читает данные снимка, правила не считает. */
export class HeroView {
  /** Корень в мире: позиция героя, поворот = направление корпуса. */
  private readonly root: Phaser.GameObjects.Container;
  /** Меч в локальных координатах корпуса (0 = прямо «вперёд»). */
  private readonly swordRoot: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene) {
    const body = scene.add.circle(0, 0, HERO_BODY_RADIUS, 0xc4c8cc);

    const sector = scene.add.graphics();
    sector.fillStyle(0x6a7077, 0.25);
    sector.lineStyle(2, 0x8a9098, 0.7);
    // Локально «вперёд» = +X; полкруга ±90°.
    sector.beginPath();
    sector.moveTo(0, 0);
    sector.arc(
      0,
      0,
      SWORD_REACH_RADIUS,
      -SWORD_SECTOR_HALF_ANGLE,
      SWORD_SECTOR_HALF_ANGLE,
      false,
    );
    sector.closePath();
    sector.fillPath();
    sector.strokePath();

    const damage = scene.add.rectangle(
      HERO_BODY_RADIUS + SWORD_GAP + SWORD_DAMAGE_LENGTH / 2,
      0,
      SWORD_DAMAGE_LENGTH,
      10,
      0xff0000,
    );
    const sword = scene.add.rectangle(
      HERO_BODY_RADIUS + SWORD_GAP + SWORD_LENGTH / 2,
      0,
      SWORD_LENGTH,
      10,
      0x9a9ea3,
    );

    this.swordRoot = scene.add.container(0, 0, [damage, sword]);
    this.root = scene.add.container(0, 0, [sector, body, this.swordRoot]);
  }

  sync(hero: {
    readonly x: number;
    readonly y: number;
    readonly bodyFacing: number;
    readonly swordAngle: number;
  }): void {
    this.root.setPosition(hero.x, hero.y);
    this.root.setRotation(hero.bodyFacing);
    // Угол меча относительно корпуса.
    this.swordRoot.setRotation(hero.swordAngle - hero.bodyFacing);
  }
}
