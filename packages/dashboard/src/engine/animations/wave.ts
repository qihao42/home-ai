import type { Animation } from '../types';
import { GRID_SIZE, createEmptyFrame } from '../types';
import { hslToRgb } from '../../utils/color';

export const wave: Animation = {
  name: 'Wave',
  icon: '🌊',
  fps: 20,
  generate(tick, params) {
    const frame = createEmptyFrame();
    const baseHue = params?.hue ?? 210;

    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const phase = x * 0.8 + tick * 0.15;
        const sinVal = Math.sin(phase) * 0.5 + 0.5;
        const yFactor = 1 - Math.abs(y - 3.5) / 4;
        const intensity = sinVal * yFactor;

        if (intensity > 0.15) {
          const lightness = 20 + intensity * 45;
          const hue = baseHue + sinVal * 20 - 10;
          frame[y][x] = hslToRgb(hue, 80, lightness);
        }
      }
    }
    return frame;
  },
};
