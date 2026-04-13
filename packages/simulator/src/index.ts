import { createConnection } from "node:net";
import { defaultScenario } from "./scenarios/home-default.js";
import { createDevicesFromScenario } from "./device-factory.js";
import type { SimulatedDevice } from "./base-device.js";

const MQTT_URL = "mqtt://localhost:1883";
const MQTT_PORT = 1883;

/** Wait for the MQTT broker to be accepting connections before starting devices */
async function waitForBroker(port: number, maxRetries = 30): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await new Promise<void>((resolve, reject) => {
        const sock = createConnection({ port, host: "localhost" }, () => {
          sock.destroy();
          resolve();
        });
        sock.on("error", (err) => {
          sock.destroy();
          reject(err);
        });
        sock.setTimeout(1000, () => {
          sock.destroy();
          reject(new Error("timeout"));
        });
      });
      return; // connected successfully
    } catch {
      if (attempt === maxRetries) {
        throw new Error(
          `MQTT broker not available on port ${port} after ${maxRetries} attempts`
        );
      }
      process.stdout.write(
        `[simulator] Waiting for MQTT broker... (attempt ${attempt}/${maxRetries})\n`
      );
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}

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

  // Wait for the server's MQTT broker to be ready
  await waitForBroker(MQTT_PORT);
  process.stdout.write("[simulator] MQTT broker is ready.\n");

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
