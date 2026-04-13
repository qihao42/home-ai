import type { Animation } from '../types';
import { GRID_SIZE, createEmptyFrame } from '../types';
import { hslToRgb } from '../../utils/color';

// 3x5 digit font for clock display
const DIGITS: number[][][] = [
  [[1,1,1],[1,0,1],[1,0,1],[1,0,1],[1,1,1]], // 0
  [[0,1,0],[1,1,0],[0,1,0],[0,1,0],[1,1,1]], // 1
  [[1,1,1],[0,0,1],[1,1,1],[1,0,0],[1,1,1]], // 2
  [[1,1,1],[0,0,1],[1,1,1],[0,0,1],[1,1,1]], // 3
  [[1,0,1],[1,0,1],[1,1,1],[0,0,1],[0,0,1]], // 4
  [[1,1,1],[1,0,0],[1,1,1],[0,0,1],[1,1,1]], // 5
  [[1,1,1],[1,0,0],[1,1,1],[1,0,1],[1,1,1]], // 6
  [[1,1,1],[0,0,1],[0,0,1],[0,0,1],[0,0,1]], // 7
  [[1,1,1],[1,0,1],[1,1,1],[1,0,1],[1,1,1]], // 8
  [[1,1,1],[1,0,1],[1,1,1],[0,0,1],[1,1,1]], // 9
];

function drawDigit(frame: ReturnType<typeof createEmptyFrame>, digit: number, offsetX: number, offsetY: number, color: [number, number, number]) {
  const pattern = DIGITS[digit];
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 3; x++) {
      const px = offsetX + x;
      const py = offsetY + y;
      if (px >= 0 && px < GRID_SIZE && py >= 0 && py < GRID_SIZE && pattern[y][x]) {
        frame[py][px] = color;
      }
    }
  }
}

export const clock: Animation = {
  name: 'Clock',
  icon: '🕐',
  fps: 2,
  generate(tick, params) {
    const frame = createEmptyFrame();
    const hue = params?.hue ?? 180;
    const color = hslToRgb(hue, 80, 55);
    const dimColor = hslToRgb(hue, 40, 20);

    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();

    const h1 = Math.floor(h / 10);
    const h2 = h % 10;
    const m1 = Math.floor(m / 10);
    const m2 = m % 10;

    // Draw HH:MM centered on 8x8 grid
    // Hours: digits at x=0 and x=4, offset y=1
    drawDigit(frame, h1, 0, 1, color);
    drawDigit(frame, h2, 4, 1, color);

    // Colon (blinking)
    if (tick % 2 === 0) {
      frame[3][3] = dimColor;
      frame[5][3] = dimColor;
    }

    // Minutes shown as two dots at bottom
    drawDigit(frame, m1, 0, 1, color);
    drawDigit(frame, m2, 4, 1, color);

    // Bottom bar showing minutes progress (0-59 mapped to 0-7)
    const minuteBar = Math.round((m / 59) * (GRID_SIZE - 1));
    for (let x = 0; x <= minuteBar; x++) {
      frame[7][x] = dimColor;
    }

    return frame;
  },
};
