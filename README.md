# SmartHome Hub

A complete smart home platform inspired by Home Assistant, built entirely in TypeScript. Runs on Windows with zero hardware requirements -- all IoT devices are simulated via an embedded MQTT broker.

![License](https://img.shields.io/badge/license-MIT-blue)
![TypeScript](https://img.shields.io/badge/typescript-5.7-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18-green)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Simulated Devices](#simulated-devices)
- [REST API](#rest-api)
- [Automations](#automations)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)

---

## Overview

SmartHome Hub is a monorepo containing four packages that together form a fully functional smart home control system. An embedded MQTT broker (Aedes) handles device communication, a Fastify server manages state and automations, simulated IoT devices publish realistic sensor data, and a React dashboard provides real-time control.

No physical hardware is required. The simulator package creates 11 virtual devices across 4 rooms that behave like real IoT devices -- publishing state changes over MQTT and responding to commands.

---

## Features

- **Device Control** -- Toggle lights (on/off, brightness), switches, and thermostat (mode, target temperature)
- **Sensor Monitoring** -- View real-time temperature, humidity, motion detection, and door contact readings
- **Automation Engine** -- Create trigger/condition/action rules (e.g., motion detected -> turn on light)
- **Real-Time Updates** -- WebSocket connection pushes state changes to the dashboard instantly
- **State History** -- Track and chart entity state changes over time with sql.js persistence
- **MQTT Auto-Discovery** -- Devices announce themselves on connection; the server registers them automatically
- **Responsive Dashboard** -- Works on both desktop and mobile browsers
- **Immutable Architecture** -- All state objects use `Object.freeze` and `Readonly` types throughout

---

## Architecture

```
+---------------------+         +-----------------------+
|                     |  MQTT   |                       |
|     Simulator       |-------->|    Aedes MQTT Broker   |
|   (11 devices)      |<--------|    (embedded, :1883)   |
|                     |         |                       |
+---------------------+         +-----------+-----------+
                                            |
                                            | MQTT Client
                                            v
                                +-----------+-----------+
                                |                       |
                                |    Fastify Server     |
                                |       (:3000)         |
                                |                       |
                                |  +- Entity Registry   |
                                |  +- Event Bus         |
                                |  +- Automation Engine |
                                |  +- State History     |
                                |  +- sql.js Database   |
                                |                       |
                                +---+---------------+---+
                                    |               |
                            REST API|          WebSocket
                                    v               v
                                +---+---------------+---+
                                |                       |
                                |   React Dashboard     |
                                |       (:5173)         |
                                |                       |
                                |  +- Zustand Stores    |
                                |  +- Entity Cards      |
                                |  +- History Charts    |
                                |  +- Automation Editor |
                                |                       |
                                +-----------------------+
```

**Data Flow:**

1. Simulated devices connect to the MQTT broker and publish discovery messages.
2. The server's MQTT client receives discovery payloads and registers entities in the registry.
3. Devices periodically publish state updates (sensor readings, status changes).
4. The server processes state changes, persists history, and evaluates automation triggers.
5. State changes are broadcast to all connected dashboard clients via WebSocket.
6. The dashboard sends commands through the REST API, which publishes MQTT set-commands back to devices.

---

## Project Structure

```
smarthome-hub/
+-- package.json                 # Workspace root (npm workspaces)
+-- tsconfig.base.json           # Shared TypeScript config
+-- data/                        # SQLite database (auto-created)
+-- packages/
    +-- shared/                  # Shared types, schemas, constants
    |   +-- src/
    |       +-- constants/
    |       |   +-- entity-domains.ts
    |       |   +-- mqtt-topics.ts
    |       +-- schemas/
    |       |   +-- automation.schema.ts
    |       |   +-- device.schema.ts
    |       |   +-- entity.schema.ts
    |       +-- types/
    |           +-- api.ts
    |           +-- automation.ts
    |           +-- device.ts
    |           +-- entity.ts
    |           +-- event.ts
    |
    +-- server/                  # Fastify backend + MQTT broker
    |   +-- src/
    |       +-- api/
    |       |   +-- plugins/     # CORS, error handler, WebSocket
    |       |   +-- routes/      # entities, devices, services, automations, history
    |       |   +-- ws/          # WebSocket broadcaster and handler
    |       |   +-- server.ts
    |       +-- automation/      # Engine, triggers, conditions, actions
    |       +-- core/            # Entity registry, event bus, logger, state history
    |       +-- integrations/    # MQTT device discovery and state mapping
    |       +-- mqtt/            # Aedes broker, MQTT client, topic parser
    |       +-- persistence/     # sql.js database, migrations, repositories
    |       +-- config.ts
    |       +-- index.ts
    |
    +-- simulator/               # Virtual IoT devices
    |   +-- src/
    |       +-- behaviors/       # Fluctuator (sensor drift), scheduler
    |       +-- devices/         # light, smart-switch, thermostat, sensors
    |       +-- scenarios/       # Home layout definitions
    |       +-- base-device.ts
    |       +-- device-factory.ts
    |       +-- index.ts
    |
    +-- dashboard/               # React frontend
        +-- src/
            +-- api/             # REST client, WebSocket connection
            +-- components/
            |   +-- automations/ # AutomationList, AutomationEditor
            |   +-- cards/       # LightCard, SwitchCard, SensorCard, etc.
            |   +-- common/      # Slider, Toggle, StatusBadge
            |   +-- history/     # HistoryChart
            |   +-- layout/      # Header, Sidebar, MainLayout
            +-- hooks/           # use-entity, use-websocket
            +-- pages/           # Dashboard, Devices, Automations, History
            +-- stores/          # Zustand (entity-store, automation-store)
            +-- utils/           # entity-icon, format-value
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **npm** >= 9 (ships with Node 18+)
- **Windows**, macOS, or Linux

### Installation

```bash
git clone https://github.com/qihao42/home-ai.git
cd home-ai
npm install
```

### Build

The shared package must be built first since other packages depend on it:

```bash
npm run build
```

### Run

Open three terminal windows (or use the combined dev command):

**Option A: All-in-one** (requires `concurrently`):
```bash
npm run dev
```

**Option B: Separate terminals:**

```bash
# Terminal 1 -- Start the server and embedded MQTT broker
npm run dev:server

# Terminal 2 -- Start the device simulator
npm run dev:simulator

# Terminal 3 -- Start the dashboard
npm run dev:dashboard
```

Once running:
- **Dashboard** -- http://localhost:5173
- **REST API** -- http://localhost:3000/api
- **MQTT Broker** -- mqtt://localhost:1883

---

## Configuration

The server reads configuration from environment variables with sensible defaults:

| Variable     | Default                  | Description                          |
|------------- |--------------------------|--------------------------------------|
| `PORT`       | `3000`                   | HTTP server port                     |
| `MQTT_PORT`  | `1883`                   | MQTT broker port                     |
| `DB_PATH`    | `./data/smarthome.db`    | SQLite database file path            |

All configuration values are validated at startup using Zod schemas.

---

## Simulated Devices

The simulator creates 11 devices across 4 rooms:

| Room         | Device                      | Domain          | Behavior                               |
|------------- |-----------------------------|-----------------|----------------------------------------|
| Living Room  | Living Room Light 1         | `light`         | On/off, brightness control             |
| Living Room  | Living Room Light 2         | `light`         | On/off, brightness control             |
| Living Room  | Living Room Temperature     | `sensor`        | Fluctuating temperature readings        |
| Living Room  | Living Room Motion          | `binary_sensor` | Periodic motion detection events        |
| Bedroom      | Bedroom Light               | `light`         | On/off, brightness control             |
| Bedroom      | Bedroom Smart Switch        | `switch`        | On/off toggle                          |
| Kitchen      | Kitchen Light               | `light`         | On/off, brightness control             |
| Kitchen      | Kitchen Humidity            | `sensor`        | Fluctuating humidity readings           |
| Kitchen      | Kitchen Fridge Door         | `binary_sensor` | Open/closed contact sensor             |
| Hallway      | Hallway Thermostat          | `climate`       | Mode (heat/cool/off), target temp      |
| Hallway      | Hallway Motion              | `binary_sensor` | Periodic motion detection events        |

Sensors use a fluctuator behavior to produce realistic drifting values. Binary sensors trigger on schedules to simulate real-world events.

---

## REST API

All endpoints return a standard response envelope:

```json
{
  "success": true,
  "data": { ... }
}
```

### Endpoints

| Method | Path                          | Description                        |
|--------|-------------------------------|------------------------------------|
| GET    | `/api/entities`               | List all entities                  |
| GET    | `/api/entities?domain=light`  | Filter entities by domain          |
| GET    | `/api/devices`                | List registered devices            |
| POST   | `/api/services/:domain/:action` | Call a service (turn_on, etc.)   |
| GET    | `/api/automations`            | List all automations               |
| POST   | `/api/automations`            | Create a new automation            |
| GET    | `/api/history/:entity_id`     | Get state history for an entity    |

### Service Call Example

```bash
# Turn on a light
curl -X POST http://localhost:3000/api/services/light/turn_on \
  -H "Content-Type: application/json" \
  -d '{"entity_id": "living_room_light_1"}'

# Set brightness
curl -X POST http://localhost:3000/api/services/light/turn_on \
  -H "Content-Type: application/json" \
  -d '{"entity_id": "living_room_light_1", "brightness": 128}'

# Set thermostat
curl -X POST http://localhost:3000/api/services/climate/set_temperature \
  -H "Content-Type: application/json" \
  -d '{"entity_id": "hallway_thermostat", "temperature": 22}'
```

### WebSocket

Connect to `ws://localhost:3000/ws` to receive real-time state change events. Messages are JSON-encoded entity state objects pushed whenever any entity's state changes.

---

## Automations

Automations follow a trigger-condition-action model:

- **Trigger** -- What starts the automation (entity state change, time-based)
- **Condition** -- Optional checks that must pass (entity state equals a value)
- **Action** -- What happens when triggered (call a service)

### Example Automation

"When motion is detected in the hallway, turn on the living room light":

```json
{
  "name": "Hallway Motion Light",
  "trigger": {
    "entity_id": "hallway_motion",
    "state": "on"
  },
  "conditions": [],
  "actions": [
    {
      "service": "light.turn_on",
      "entity_id": "living_room_light_1"
    }
  ]
}
```

Automations can be created and managed through both the REST API and the dashboard UI.

---

## Screenshots

> Screenshots will be added here once the dashboard is running.

| View | Description |
|------|-------------|
| ![Dashboard](docs/screenshots/dashboard.png) | Main dashboard with entity cards |
| ![Devices](docs/screenshots/devices.png) | Device list grouped by room |
| ![Automations](docs/screenshots/automations.png) | Automation editor |
| ![History](docs/screenshots/history.png) | State history charts |

---

## Tech Stack

| Layer       | Technology                                                   |
|-------------|--------------------------------------------------------------|
| Language    | TypeScript 5.7 (strict mode, ESM throughout)                |
| Monorepo    | npm workspaces                                               |
| Server      | Fastify 5, fastify-plugin, @fastify/cors, @fastify/websocket |
| MQTT        | Aedes (embedded broker), mqtt.js (client)                    |
| Database    | sql.js (WASM-based SQLite, no native dependencies)           |
| Validation  | Zod schemas shared between client and server                 |
| Frontend    | React 18, Vite 6, Tailwind CSS 3, Zustand 5                 |
| Charts      | Recharts                                                     |
| Events      | EventEmitter3 (typed event bus)                              |
| Scheduling  | node-cron (automation time triggers)                         |
| Dev Tools   | tsx (watch mode), concurrently, Vitest                       |

---

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

---

## License

MIT
