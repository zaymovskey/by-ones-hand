import type Phaser from 'phaser';

/** Картинка главного героя. Читает данные снимка, правила не считает. */
export class HeroView {
  private readonly circle: Phaser.GameObjects.Arc;

  constructor(scene: Phaser.Scene) {
    this.circle = scene.add.circle(0, 0, 16, 0xc4c8cc);
  }

  sync(hero: { readonly x: number; readonly y: number }): void {
    this.circle.setPosition(hero.x, hero.y);
  }
}
