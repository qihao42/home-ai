import type { Animation } from '../types';
import { GRID_SIZE, createEmptyFrame } from '../types';
import { hslToRgb } from '../../utils/color';

// Exclamation mark pattern for alerts
const ALERT_PATTERN = [
  [0,0,0,1,1,0,0,0],
  [0,0,0,1,1,0,0,0],
  [0,0,0,1,1,0,0,0],
  [0,0,0,1,1,0,0,0],
  [0,0,0,1,1,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,1,1,0,0,0],
  [0,0,0,1,1,0,0,0],
];

export const alert: Animation = {
  name: 'Alert',
  icon: '🚨',
  fps: 4,
  generate(tick, params) {
    const frame = createEmptyFrame();
    const hue = params?.hue ?? 0; // red by default

    // Pulsing effect
    const pulse = Math.sin(tick * 0.5) * 0.5 + 0.5;
    const lightness = 30 + pulse * 35;
    const color = hslToRgb(hue, 100, lightness);

    // Dim background pulse
    const bgIntensity = pulse * 15;
    const bgColor = hslToRgb(hue, 80, bgIntensity);

    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (ALERT_PATTERN[y][x]) {
          frame[y][x] = color;
        } else if (bgIntensity > 5) {
          frame[y][x] = bgColor;
        }
      }
    }
    return frame;
  },
};
