import { SimulatedDevice } from "../base-device.js";
import { fluctuate } from "../behaviors/fluctuator.js";
import type { DeviceConfig } from "../types.js";

interface SwitchState {
  readonly state: "on" | "off";
  readonly power_consumption: number;
}

export class SimulatedSmartSwitch extends SimulatedDevice {
  private currentState: SwitchState;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(config: Omit<DeviceConfig, "domain">, mqttUrl: string) {
    super({ ...config, domain: "switch" }, mqttUrl);
    this.currentState = {
      state: "off",
      power_consumption: 0,
    };
  }

  async start(): Promise<void> {
    await super.start();
    this.intervalId = setInterval(() => {
      if (this.currentState.state === "on") {
        this.currentState = {
          ...this.currentState,
          power_consumption: parseFloat(
            fluctuate(this.currentState.power_consumption, 50, 200, 10).toFixed(1)
          ),
        };
        this.publishState();
      }
    }, 5000);
  }

  async stop(): Promise<void> {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    await super.stop();
  }

  getState(): Record<string, unknown> {
    return { ...this.currentState };
  }

  handleCommand(command: Record<string, unknown>): void {
    const action = command.action as string | undefined;

    switch (action) {
      case "turn_on": {
        this.currentState = {
          state: "on",
          power_consumption: 50 + Math.random() * 150,
        };
        this.log("Turned on");
        break;
      }
      case "turn_off": {
        this.currentState = { state: "off", power_consumption: 0 };
        this.log("Turned off");
        break;
      }
      case "toggle": {
        if (this.currentState.state === "on") {
          this.currentState = { state: "off", power_consumption: 0 };
        } else {
          this.currentState = {
            state: "on",
            power_consumption: 50 + Math.random() * 150,
          };
        }
        this.log(`Toggled to ${this.currentState.state}`);
        break;
      }
      default:
        this.log(`Unknown command action: ${action}`);
        return;
    }

    this.publishState();
  }
}
