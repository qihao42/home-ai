import type { Animation } from '../types';
import { GRID_SIZE, createEmptyFrame } from '../types';
import { hslToRgb } from '../../utils/color';

// Crescent moon + twinkling stars
const MOON = [
  [0,0,0,0,0,1,1,0],
  [0,0,0,0,1,1,0,0],
  [0,0,0,0,1,0,0,0],
  [0,0,0,0,1,0,0,0],
  [0,0,0,0,1,0,0,0],
  [0,0,0,0,1,1,0,0],
  [0,0,0,0,0,1,1,0],
  [0,0,0,0,0,0,0,0],
];

// Star positions (x, y)
const STARS = [
  [1, 1], [0, 4], [2, 6], [1, 3], [3, 0], [2, 2],
];

export const night: Animation = {
  name: 'Night',
  icon: '🌙',
  fps: 4,
  generate(tick, params) {
    const frame = createEmptyFrame();
    const hue = params?.hue ?? 45; // warm yellow moon

    const moonColor = hslToRgb(hue, 70, 55);
    const moonGlow = hslToRgb(hue, 40, 15);

    // Draw moon
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (MOON[y][x]) {
          frame[y][x] = moonColor;
          // Glow around moon
          if (y > 0 && !MOON[y-1][x]) frame[y-1][x] = moonGlow;
          if (y < 7 && !MOON[y+1][x]) frame[y+1][x] = moonGlow;
          if (x > 0 && !MOON[y][x-1]) frame[y][x-1] = moonGlow;
          if (x < 7 && !MOON[y][x+1]) frame[y][x+1] = moonGlow;
        }
      }
    }

    // Twinkling stars
    for (let i = 0; i < STARS.length; i++) {
      const [sx, sy] = STARS[i];
      // Each star twinkles at different phase
      const twinkle = Math.sin(tick * 0.8 + i * 1.7) * 0.5 + 0.5;
      if (twinkle > 0.3 && !frame[sy][sx][0]) {
        const starLight = Math.round(twinkle * 50 + 20);
        frame[sy][sx] = [starLight, starLight, starLight + 30];
      }
    }

    return frame;
  },
};
