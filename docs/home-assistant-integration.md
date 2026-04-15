# Home Assistant ↔ HomeAI Integration

HomeAI's server listens on **two** MQTT topic prefixes:

- `smarthome/{domain}/{id}/{state|config}` — HomeAI native devices (our simulator, future ESP32 firmware)
- `homeassistant/{domain}/{id}/{state|config}` — Home Assistant MQTT discovery

This means **any device published to an HA instance** (via MQTT Discovery) can be bridged into HomeAI, satisfying **Milestone 3** from the Technical Proposal.

## Scenarios

### A. Use your existing HA devices in HomeAI

If you run Home Assistant at home and have it set up with MQTT Discovery:

1. Edit HA's `configuration.yaml` to add an **MQTT Mirror / Bridge** to HomeAI's broker at `<homeai-server>:1883`:
   ```yaml
   mqtt:
     broker: <homeai-server-ip>
     port: 1883
     discovery: true
     discovery_prefix: homeassistant
   ```
2. Restart HA.
3. HA will publish its discovery messages to HomeAI's broker.
4. HomeAI's server auto-registers the devices. Open the dashboard — your HA-connected bulbs / sensors appear alongside the simulated ones.

### B. HA acts as the hub; HomeAI as the "visual" layer

This is the cleanest split for most users:

- HA controls Zigbee / Matter / WiFi devices (the heavy lifting)
- HomeAI subscribes to HA state events and drives the LED sphere visual feedback
- Orbital sphere reacts to HA automations (door opens → welcome animation)

### C. HomeAI standalone + ESP32

If the user doesn't run HA, ESP32 firmware publishes directly to HomeAI's native prefix `smarthome/...`. This is the demo path for Kickstarter / crowdfunding where the product ships without requiring HA.

## Milestone 3 Test (from docs/testing-milestones.md)

1. Install HA on your computer (Docker or VM)
2. Point HA's MQTT to HomeAI's broker (`<server>:1883`)
3. Create a virtual entity in HA (e.g. a "virtual lock" input_boolean)
4. Bridge it to MQTT via HA automations
5. Toggle the virtual lock in HA's UI
6. HomeAI dashboard should show the state change within 1 second
7. Orbital LED auto-mode plays the Welcome animation when the virtual lock opens

## Security Note

Port 1883 is **not** exposed to the public internet on the HomeAI server. For HA to reach it, either:

- Put both servers on the same LAN / Tailscale network, or
- Use an MQTT bridge with TLS and authentication (planned for v2)

For now, the integration works best when HA and HomeAI are on the same private network.
