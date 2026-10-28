import type Phaser from 'phaser';

/** Картинка главного героя. Читает данные снимка, правила не считает. */
export class HeroView {
  /** Корень: тело + меч. Двигаем/крутим контейнер — оба едут вместе. */
  private readonly root: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene) {
    const bodyRadius = 60;
    const swordLength = 100;
    const body = scene.add.circle(0, 0, bodyRadius, 0xc4c8cc);

    // Палка вдоль +X: при rotation = atan2 кончик смотрит на прицел.
    const sword = scene.add.rectangle(
      bodyRadius + 10 + swordLength / 2,
      0,
      swordLength,
      10,
      0x9a9ea3,
    );

    this.root = scene.add.container(0, 0, [body, sword]);
  }

  sync(hero: {
    readonly x: number;
    readonly y: number;
    readonly facingAngle: number;
  }): void {
    this.root.setPosition(hero.x, hero.y);
    this.root.setRotation(hero.facingAngle);
  }
}
