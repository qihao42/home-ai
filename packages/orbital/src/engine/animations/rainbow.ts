import type { Animation } from '../types';
import { GRID_SIZE, createEmptyFrame } from '../types';
import { hslToRgb } from '../../utils/color';

export const rainbow: Animation = {
  name: 'Rainbow',
  icon: '🌈',
  fps: 30,
  generate(tick) {
    const frame = createEmptyFrame();

    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const hue = ((x + y) * 40 + tick * 4) % 360;
        frame[y][x] = hslToRgb(hue, 90, 50);
      }
    }
    return frame;
  },
};
