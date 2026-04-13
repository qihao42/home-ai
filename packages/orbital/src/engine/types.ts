/** RGB color tuple [R, G, B], each 0-255 */
export type RGB = [number, number, number];

/** 8x8 grid of RGB colors representing one frame */
export type Frame = RGB[][];

/** Animation definition */
export interface Animation {
  name: string;
  icon: string;
  fps: number;
  /** Generate a frame at a given tick. Params can override color etc. */
  generate: (tick: number, params?: AnimationParams) => Frame;
}

export interface AnimationParams {
  /** Primary hue override 0-360 */
  hue?: number;
  /** Brightness multiplier 0-1 */
  brightness?: number;
}

export const GRID_SIZE = 8;

export function createEmptyFrame(): Frame {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, (): RGB => [0, 0, 0])
  );
}
