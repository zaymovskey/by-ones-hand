/** Общие размеры героя для симуляции и картинки (пока захардкожены). */
export const HERO_BODY_RADIUS = 60;
export const SWORD_GAP = 10;
export const SWORD_LENGTH = 100;
export const SWORD_DAMAGE_LENGTH = SWORD_LENGTH + 20;

/** От центра тела до кончика красной зоны урона — радиус сектора досягаемости. */
export const SWORD_REACH_RADIUS =
  HERO_BODY_RADIUS + SWORD_GAP + SWORD_DAMAGE_LENGTH;

/** Полсектора: меч в пределах ±90° от направления корпуса. */
export const SWORD_SECTOR_HALF_ANGLE = Math.PI / 2;
