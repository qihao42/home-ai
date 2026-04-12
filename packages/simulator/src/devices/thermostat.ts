import { SimulatedDevice } from "../base-device.js";
import { fluctuate } from "../behaviors/fluctuator.js";
import type { DeviceConfig } from "../types.js";

type ThermostatMode = "heat" | "cool" | "auto" | "off";
type HvacAction = "heating" | "cooling" | "idle";

interface ThermostatState {
  readonly current_temperature: number;
  readonly target_temperature: number;
  readonly mode: ThermostatMode;
  readonly hvac_action: HvacAction;
}

export class SimulatedThermostat extends SimulatedDevice {
  private currentState: ThermostatState;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(config: Omit<DeviceConfig, "domain">, mqttUrl: string) {
    super({ ...config, domain: "climate" }, mqttUrl);
    this.currentState = {
      current_temperature: 20 + Math.random() * 5,
      target_temperature: 22,
      mode: "auto",
      hvac_action: "idle",
    };
  }

  async start(): Promise<void> {
    await super.start();
    this.intervalId = setInterval(() => {
      this.currentState = this.computeNextState(this.currentState);
      this.publishState();
    }, 3000);
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
      case "set_temperature": {
        const target = command.temperature;
        if (typeof target === "number" && target >= 10 && target <= 35) {
          this.currentState = {
            ...this.currentState,
            target_temperature: parseFloat(target.toFixed(1)),
          };
          this.log(`Target temperature set to ${target}°C`);
        } else {
          this.log(`Invalid temperature: ${target}`);
          return;
        }
        break;
      }
      case "set_mode": {
        const mode = command.mode as ThermostatMode | undefined;
        const validModes: readonly ThermostatMode[] = ["heat", "cool", "auto", "off"];
        if (mode && validModes.includes(mode)) {
          this.currentState = { ...this.currentState, mode };
          this.log(`Mode set to ${mode}`);
        } else {
          this.log(`Invalid mode: ${mode}`);
          return;
        }
        break;
      }
      default:
        this.log(`Unknown command action: ${action}`);
        return;
    }

    this.publishState();
  }

  private computeNextState(state: ThermostatState): ThermostatState {
    if (state.mode === "off") {
      const drifted = fluctuate(state.current_temperature, 10, 40, 0.1);
      return {
        ...state,
        current_temperature: parseFloat(drifted.toFixed(1)),
        hvac_action: "idle",
      };
    }

    const diff = state.target_temperature - state.current_temperature;
    const shouldHeat =
      (state.mode === "heat" || state.mode === "auto") && diff > 0.5;
    const shouldCool =
      (state.mode === "cool" || state.mode === "auto") && diff < -0.5;

    let nextTemp = state.current_temperature;
    let nextAction: HvacAction = "idle";

    if (shouldHeat) {
      nextTemp = state.current_temperature + 0.2 + Math.random() * 0.3;
      nextAction = "heating";
    } else if (shouldCool) {
      nextTemp = state.current_temperature - 0.2 - Math.random() * 0.3;
      nextAction = "cooling";
    } else {
      nextTemp = fluctuate(state.current_temperature, 10, 40, 0.05);
      nextAction = "idle";
    }

    return {
      ...state,
      current_temperature: parseFloat(nextTemp.toFixed(1)),
      hvac_action: nextAction,
    };
  }
}
