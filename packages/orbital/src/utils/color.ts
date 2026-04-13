import type { RGB } from '../engine/types';

/** Convert HSL (h: 0-360, s: 0-100, l: 0-100) to RGB */
export function hslToRgb(h: number, s: number, l: number): RGB {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return [
    Math.round(f(0) * 255),
    Math.round(f(8) * 255),
    Math.round(f(4) * 255),
  ];
}

/** Apply brightness multiplier to RGB */
export function applyBrightness(rgb: RGB, brightness: number): RGB {
  return [
    Math.round(rgb[0] * brightness),
    Math.round(rgb[1] * brightness),
    Math.round(rgb[2] * brightness),
  ];
}

/** Blend two colors by factor (0 = a, 1 = b) */
export function lerpColor(a: RGB, b: RGB, t: number): RGB {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}
