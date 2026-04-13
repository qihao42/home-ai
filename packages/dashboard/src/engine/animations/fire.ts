import type { Animation } from '../types';
import { GRID_SIZE, createEmptyFrame } from '../types';
import { hslToRgb } from '../../utils/color';

// Encapsulate heat buffer so it resets properly per animation lifecycle
const createHeatBuffer = () =>
  Array.from({ length: GRID_SIZE }, () => Array<number>(GRID_SIZE).fill(0));

let heat = createHeatBuffer();

export const fire: Animation = {
  name: 'Fire',
  icon: '🔥',
  fps: 15,
  generate(tick, params) {
    // Reset heat buffer on first tick (animation just started/switched)
    if (tick === 0) heat = createHeatBuffer();

    const frame = createEmptyFrame();
    const baseHue = params?.hue ?? 15;

    // Seed bottom row with random heat
    for (let x = 0; x < GRID_SIZE; x++) {
      heat[GRID_SIZE - 1][x] = Math.random() > 0.3
        ? 200 + Math.random() * 55
        : 80 + Math.random() * 80;
    }

    // Propagate heat upward with cooling
    for (let y = 0; y < GRID_SIZE - 1; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const below = heat[y + 1][x];
        const left = x > 0 ? heat[y + 1][x - 1] : below;
        const right = x < GRID_SIZE - 1 ? heat[y + 1][x + 1] : below;
        const avg = (below + left + right) / 3;
        heat[y][x] = Math.max(0, avg - (15 + Math.random() * 20));
      }
    }

    // Map heat to color
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const h = heat[y][x];
        if (h > 10) {
          const hue = baseHue + (h / 255) * 40;
          const lightness = Math.min(60, (h / 255) * 70);
          frame[y][x] = hslToRgb(hue, 100, lightness);
        }
      }
    }
    return frame;
  },
};
