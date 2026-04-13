import type { Animation } from '../types';
import { GRID_SIZE, createEmptyFrame } from '../types';
import { hslToRgb } from '../../utils/color';

const HEART = [
  [0,1,0,1,0],
  [1,1,1,1,1],
  [1,1,1,1,1],
  [0,1,1,1,0],
  [0,0,1,0,0],
];

export const welcome: Animation = {
  name: 'Welcome',
  icon: '💫',
  fps: 8,
  generate(tick, params) {
    const frame = createEmptyFrame();
    const baseHue = params?.hue ?? 330;
    const color = hslToRgb(baseHue, 85, 50);
    const glow = hslToRgb(baseHue, 60, 25);

    // Scroll the heart horizontally
    const scrollLen = GRID_SIZE + HEART[0].length + 2;
    const offset = (tick % scrollLen) - HEART[0].length - 1;

    for (let py = 0; py < HEART.length; py++) {
      for (let px = 0; px < HEART[0].length; px++) {
        if (!HEART[py][px]) continue;
        const x = px + offset;
        const y = py + 1;
        if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) continue;

        frame[y][x] = color;
        // Glow above/below
        if (y > 0 && !frame[y - 1][x][0]) frame[y - 1][x] = glow;
        if (y < GRID_SIZE - 1 && !frame[y + 1][x][0]) frame[y + 1][x] = glow;
      }
    }
    return frame;
  },
};
