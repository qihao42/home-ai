import type { Animation, AnimationParams, Frame } from './types';
import { applyBrightness } from '../utils/color';

export class AnimationEngine {
  private animation: Animation | null = null;
  private tick = 0;
  private rafId: number | null = null;
  private lastFrameTime = 0;
  private brightness = 1;
  private params: AnimationParams = {};
  private onFrame: ((frame: Frame) => void) | null = null;
  private running = false;

  setAnimation(animation: Animation) {
    this.animation = animation;
    this.tick = 0;
  }

  setBrightness(brightness: number) {
    this.brightness = Math.max(0, Math.min(1, brightness));
  }

  setParams(params: AnimationParams) {
    this.params = { ...this.params, ...params };
  }

  setOnFrame(callback: (frame: Frame) => void) {
    this.onFrame = callback;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastFrameTime = performance.now();
    this.loop(this.lastFrameTime);
  }

  stop() {
    this.running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  isRunning() {
    return this.running;
  }

  private loop = (now: number) => {
    if (!this.running) return;

    this.rafId = requestAnimationFrame(this.loop);

    if (!this.animation || !this.onFrame) return;

    const interval = 1000 / this.animation.fps;
    const delta = now - this.lastFrameTime;

    if (delta >= interval) {
      this.lastFrameTime = now - (delta % interval);
      const raw = this.animation.generate(this.tick, {
        ...this.params,
        brightness: this.brightness,
      });

      // Apply global brightness
      const frame = raw.map(row =>
        row.map(pixel => applyBrightness(pixel, this.brightness))
      );

      this.onFrame(frame);
      this.tick++;
    }
  };
}
