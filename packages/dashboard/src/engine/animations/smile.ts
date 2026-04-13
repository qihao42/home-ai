import type { Animation } from '../types';
import { GRID_SIZE, createEmptyFrame } from '../types';
import { hslToRgb } from '../../utils/color';

const SMILE_PATTERN = [
  [0,0,1,1,1,1,0,0],
  [0,1,0,0,0,0,1,0],
  [1,0,1,0,0,1,0,1],
  [1,0,0,0,0,0,0,1],
  [1,0,1,0,0,1,0,1],
  [1,0,0,1,1,0,0,1],
  [0,1,0,0,0,0,1,0],
  [0,0,1,1,1,1,0,0],
];

const BLINK_PATTERN = [
  [0,0,1,1,1,1,0,0],
  [0,1,0,0,0,0,1,0],
  [1,0,0,0,0,0,0,1],
  [1,0,1,0,0,1,0,1],
  [1,0,1,0,0,1,0,1],
  [1,0,0,1,1,0,0,1],
  [0,1,0,0,0,0,1,0],
  [0,0,1,1,1,1,0,0],
];

export const smile: Animation = {
  name: 'Smile',
  icon: '😊',
  fps: 10,
  generate(tick, params) {
    const frame = createEmptyFrame();
    const hue = params?.hue ?? 50;
    const color = hslToRgb(hue, 90, 55);

    // Blink every ~3 seconds (30 ticks at 10fps), blink lasts 3 frames
    const blinkCycle = tick % 30;
    const isBlinking = blinkCycle >= 27;
    const pattern = isBlinking ? BLINK_PATTERN : SMILE_PATTERN;

    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (pattern[y][x]) {
          frame[y][x] = color;
        }
      }
    }
    return frame;
  },
};
