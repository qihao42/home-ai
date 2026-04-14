import type { Animation, Frame } from '../types';
import { GRID_SIZE, createEmptyFrame } from '../types';
import { hslToRgb } from '../../utils/color';

// 3-wide x 5-tall digit font. Two digits + separator fit in 7 cols.
const DIGITS: readonly (readonly (readonly number[])[])[] = [
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

function drawDigit(
  frame: Frame,
  digit: number,
  offsetX: number,
  offsetY: number,
  color: readonly [number, number, number]
): void {
  const pattern = DIGITS[digit];
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 3; x++) {
      const px = offsetX + x;
      const py = offsetY + y;
      if (
        px >= 0 && px < GRID_SIZE &&
        py >= 0 && py < GRID_SIZE &&
        pattern[y][x]
      ) {
        frame[py][px] = [color[0], color[1], color[2]];
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
    const dimColor = hslToRgb(hue, 40, 25);

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // Display: HH digits on y=0..4, blinking dot row at y=5,
    // seconds indicator at y=6, minute progress bar at y=7
    drawDigit(frame, Math.floor(hours / 10), 0, 0, color);
    drawDigit(frame, hours % 10, 4, 0, color);

    // Blinking separator
    if (tick % 2 === 0) {
      frame[5][3] = dimColor;
      frame[5][4] = dimColor;
    }

    // Seconds indicator - dot moves across the grid
    const secondDot = Math.floor((now.getSeconds() / 60) * GRID_SIZE);
    frame[6][secondDot] = dimColor;

    // Minute progress bar (0-59 mapped to 0-7 lit cells)
    const minuteBar = Math.floor((minutes / 60) * GRID_SIZE);
    for (let x = 0; x < GRID_SIZE; x++) {
      if (x < minuteBar) frame[7][x] = color;
      else if (x === minuteBar) frame[7][x] = dimColor;
    }

    return frame;
  },
};
