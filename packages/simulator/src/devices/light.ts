import { SimulatedDevice } from "../base-device.js";
import type { DeviceConfig } from "../types.js";

interface LightColor {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

interface LightState {
  readonly state: "on" | "off";
  readonly brightness: number;
  readonly color: LightColor;
}

export class SimulatedLight extends SimulatedDevice {
  private currentState: LightState;

  constructor(config: Omit<DeviceConfig, "domain">, mqttUrl: string) {
    super({ ...config, domain: "light" }, mqttUrl);
    this.currentState = {
      state: "off",
      brightness: Math.floor(Math.random() * 256),
      color: { r: 255, g: 255, b: 255 },
    };
  }

  getState(): Record<string, unknown> {
    return { ...this.currentState, color: { ...this.currentState.color } };
  }

  handleCommand(command: Record<string, unknown>): void {
    const action = command.action as string | undefined;

    switch (action) {
      case "turn_on": {
        const brightness =
          typeof command.brightness === "number"
            ? Math.min(255, Math.max(0, command.brightness))
            : this.currentState.brightness;

        const color =
          command.color && typeof command.color === "object"
            ? {
                r: Math.min(255, Math.max(0, (command.color as LightColor).r ?? this.currentState.color.r)),
                g: Math.min(255, Math.max(0, (command.color as LightColor).g ?? this.currentState.color.g)),
                b: Math.min(255, Math.max(0, (command.color as LightColor).b ?? this.currentState.color.b)),
              }
            : this.currentState.color;

        this.currentState = { state: "on", brightness, color };
        this.log(`Turned on (brightness: ${brightness})`);
        break;
      }
      case "turn_off": {
        this.currentState = { ...this.currentState, state: "off" };
        this.log("Turned off");
        break;
      }
      case "toggle": {
        const nextState = this.currentState.state === "on" ? "off" : "on";
        this.currentState = { ...this.currentState, state: nextState };
        this.log(`Toggled to ${nextState}`);
        break;
      }
      default:
        this.log(`Unknown command action: ${action}`);
        return;
    }

    this.publishState();
  }
}
