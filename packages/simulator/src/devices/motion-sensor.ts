import { SimulatedDevice } from "../base-device.js";
import { createInterval } from "../behaviors/scheduler.js";
import type { DeviceConfig } from "../types.js";

interface MotionState {
  readonly motion: boolean;
  readonly last_triggered: string;
}

export class SimulatedMotionSensor extends SimulatedDevice {
  private currentState: MotionState;
  private scheduler: { start(): void; stop(): void } | null = null;
  private clearTimerId: ReturnType<typeof setTimeout> | null = null;

  constructor(config: Omit<DeviceConfig, "domain">, mqttUrl: string) {
    super({ ...config, domain: "binary_sensor" }, mqttUrl);
    this.currentState = {
      motion: false,
      last_triggered: new Date().toISOString(),
    };
  }

  async start(): Promise<void> {
    await super.start();
    this.scheduler = createInterval(
      () => {
        this.currentState = {
          motion: true,
          last_triggered: new Date().toISOString(),
        };
        this.log("Motion detected");
        this.publishState();

        if (this.clearTimerId !== null) {
          clearTimeout(this.clearTimerId);
        }
        this.clearTimerId = setTimeout(() => {
          this.currentState = { ...this.currentState, motion: false };
          this.log("Motion cleared");
          this.publishState();
          this.clearTimerId = null;
        }, 30_000);
      },
      15_000,
      90_000
    );
    this.scheduler.start();
  }

  async stop(): Promise<void> {
    if (this.scheduler) {
      this.scheduler.stop();
      this.scheduler = null;
    }
    if (this.clearTimerId !== null) {
      clearTimeout(this.clearTimerId);
      this.clearTimerId = null;
    }
    await super.stop();
  }

  getState(): Record<string, unknown> {
    return { ...this.currentState };
  }

  handleCommand(_command: Record<string, unknown>): void {
    this.log("Read-only sensor, command ignored");
  }
}
