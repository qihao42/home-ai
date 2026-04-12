import { defaultScenario } from "./scenarios/home-default.js";
import { createDevicesFromScenario } from "./device-factory.js";
import type { SimulatedDevice } from "./base-device.js";

const MQTT_URL = "mqtt://localhost:1883";

async function shutdown(devices: SimulatedDevice[]): Promise<void> {
  process.stdout.write("\n[simulator] Shutting down all devices...\n");

  const stopPromises = devices.map(async (device) => {
    try {
      await device.stop();
    } catch (error) {
      process.stdout.write(
        `[simulator] Error stopping ${device.name}: ${error}\n`
      );
    }
  });

  await Promise.all(stopPromises);
  process.stdout.write("[simulator] All devices stopped. Goodbye.\n");
}

async function main(): Promise<void> {
  process.stdout.write("[simulator] SmartHome Hub Simulator starting...\n");
  process.stdout.write(`[simulator] Scenario: ${defaultScenario.name}\n`);
  process.stdout.write(`[simulator] MQTT broker: ${MQTT_URL}\n`);

  const devices = createDevicesFromScenario(defaultScenario, MQTT_URL);

  process.stdout.write(
    `[simulator] Created ${devices.length} simulated devices\n`
  );

  let shuttingDown = false;

  const handleSignal = (): void => {
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;
    shutdown(devices).then(() => {
      process.exit(0);
    }).catch((error) => {
      process.stdout.write(`[simulator] Shutdown error: ${error}\n`);
      process.exit(1);
    });
  };

  process.on("SIGINT", handleSignal);
  process.on("SIGTERM", handleSignal);

  const startPromises = devices.map(async (device) => {
    try {
      await device.start();
    } catch (error) {
      process.stdout.write(
        `[simulator] Failed to start ${device.name}: ${error}\n`
      );
    }
  });

  await Promise.all(startPromises);

  process.stdout.write(
    "[simulator] All devices started. Press Ctrl+C to stop.\n"
  );
}

main().catch((error) => {
  process.stdout.write(`[simulator] Fatal error: ${error}\n`);
  process.exit(1);
});
