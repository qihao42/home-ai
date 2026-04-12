import type { DeviceConfig, ScenarioConfig } from "./types.js";
import { SimulatedDevice } from "./base-device.js";
import { SimulatedLight } from "./devices/light.js";
import { SimulatedTemperatureSensor } from "./devices/temperature-sensor.js";
import { SimulatedHumiditySensor } from "./devices/humidity-sensor.js";
import { SimulatedMotionSensor } from "./devices/motion-sensor.js";
import { SimulatedDoorSensor } from "./devices/door-sensor.js";
import { SimulatedSmartSwitch } from "./devices/smart-switch.js";
import { SimulatedThermostat } from "./devices/thermostat.js";

function createDevice(config: DeviceConfig, mqttUrl: string): SimulatedDevice {
  const { domain, ...rest } = config;

  switch (domain) {
    case "light":
      return new SimulatedLight(rest, mqttUrl);
    case "sensor": {
      if (config.id.includes("humidity")) {
        return new SimulatedHumiditySensor(rest, mqttUrl);
      }
      return new SimulatedTemperatureSensor(rest, mqttUrl);
    }
    case "binary_sensor": {
      if (config.id.includes("motion")) {
        return new SimulatedMotionSensor(rest, mqttUrl);
      }
      return new SimulatedDoorSensor(rest, mqttUrl);
    }
    case "switch":
      return new SimulatedSmartSwitch(rest, mqttUrl);
    case "climate":
      return new SimulatedThermostat(rest, mqttUrl);
    default:
      throw new Error(`Unknown device domain: ${domain}`);
  }
}

export function createDevicesFromScenario(
  scenario: ScenarioConfig,
  mqttUrl: string
): SimulatedDevice[] {
  const devices: SimulatedDevice[] = [];

  for (const room of scenario.rooms) {
    for (const deviceConfig of room.devices) {
      try {
        const device = createDevice(deviceConfig, mqttUrl);
        devices.push(device);
      } catch (error) {
        process.stdout.write(
          `[factory] Failed to create device ${deviceConfig.id}: ${error}\n`
        );
      }
    }
  }

  return devices;
}
