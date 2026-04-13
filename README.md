# HomeAI

A complete smart home platform with an LED sphere visual device (Orbital), built entirely in TypeScript. The platform includes a Home Assistant-inspired smart home hub with simulated IoT devices, plus an Orbital LED sphere simulator for the ESP32-S3 + WS2812B hardware project.

![License](https://img.shields.io/badge/license-MIT-blue)
![TypeScript](https://img.shields.io/badge/typescript-5.7+-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18-green)

---

## Table of Contents

- [Overview](#overview)
- [Monorepo Structure](#monorepo-structure)
- [Getting Started](#getting-started)
- [SmartHome Hub](#smarthome-hub)
- [Orbital LED Sphere](#orbital-led-sphere)
- [Tech Stack](#tech-stack)

---

## Overview

HomeAI is a monorepo containing two major subsystems:

1. **SmartHome Hub** -- A full-featured smart home control platform with an embedded MQTT broker, Fastify server, device simulator, and React dashboard. No physical hardware required.

2. **Orbital** -- A web-based 8x8 LED sphere simulator for developing and previewing animations before flashing to ESP32-S3 hardware. Includes a WebSocket server for bridging Browser, ESP32, and Home Assistant.

---

## Monorepo Structure

```
home-ai/
├── package.json                 # Workspace root (npm workspaces)
├── tsconfig.base.json           # Shared TypeScript config
├── packages/
│   ├── shared/                  # Shared types, schemas, constants
│   ├── server/                  # Fastify backend + MQTT broker
│   ├── simulator/               # Virtual IoT devices (11 devices, 4 rooms)
│   ├── dashboard/               # React smart home dashboard
│   └── orbital/                 # LED sphere simulator + WebSocket server
│       ├── src/
│       │   ├── components/      # LedMatrix (Canvas), ControlPanel
│       │   ├── engine/          # AnimationEngine + 5 animations
│       │   └── utils/           # HSL/RGB color utilities
│       └── server/              # WebSocket bridge (port 3001)
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **npm** >= 9

### Installation

```bash
git clone https://github.com/qihao42/home-ai.git
cd home-ai
npm install
```

### Run SmartHome Hub

```bash
# All-in-one (server + simulator + dashboard)
npm run dev

# Or individually:
npm run dev:server      # Fastify + MQTT broker (:3000)
npm run dev:simulator   # 11 virtual IoT devices
npm run dev:dashboard   # React dashboard (:5173)
```

### Run Orbital LED Simulator

```bash
# Frontend + WebSocket server together
npm run dev:orbital

# Or individually:
npm run dev:orbital:ui      # Vite dev server (:5173)
npm run dev:orbital:server  # WebSocket server (:3001)
```

---

## SmartHome Hub

### Architecture

```
Simulator (11 devices) → MQTT Broker (:1883) → Fastify Server (:3000) → React Dashboard (:5173)
```

### Features

- **Device Control** -- Lights (on/off, brightness), switches, thermostat (mode, target temp)
- **Sensor Monitoring** -- Real-time temperature, humidity, motion, door contact
- **Automation Engine** -- Trigger/condition/action rules
- **Real-Time Updates** -- WebSocket push to dashboard
- **State History** -- sql.js persistence with charts
- **MQTT Auto-Discovery** -- Devices announce on connection

### Simulated Devices

| Room | Device | Type |
|------|--------|------|
| Living Room | Light 1 & 2, Temperature, Motion | light, sensor, binary_sensor |
| Bedroom | Light, Smart Switch | light, switch |
| Kitchen | Light, Humidity, Fridge Door | light, sensor, binary_sensor |
| Hallway | Thermostat, Motion | climate, binary_sensor |

### REST API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/entities` | List all entities |
| GET | `/api/devices` | List registered devices |
| POST | `/api/services/:domain/:action` | Call a service |
| GET | `/api/automations` | List automations |
| POST | `/api/automations` | Create automation |
| GET | `/api/history/:entity_id` | Get state history |

### Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP server port |
| `MQTT_PORT` | `1883` | MQTT broker port |
| `DB_PATH` | `./data/smarthome.db` | SQLite database path |

---

## Orbital LED Sphere

### Overview

A visual simulator for the Orbital spherical LED device (ESP32-S3 + WS2812B, 8x8 matrix). Develop and preview animations in the browser before flashing hardware.

### Features

- **8x8 LED Matrix** -- Canvas renderer with glow effects and specular highlights
- **5 Animations** -- Smile (blinking face), Fire (heat propagation), Rainbow (diagonal flow), Wave (sine wave), Welcome (scrolling heart)
- **Control Panel** -- Animation selection, play/pause, brightness (0-100%), hue adjustment (0-360)
- **WebSocket Server** -- Port 3001, bridges Browser / ESP32 / Home Assistant
- **Responsive Layout** -- Desktop side-by-side, mobile stacked

### Animation Details

| Animation | FPS | Description |
|-----------|-----|-------------|
| Smile | 10 | Pixel art smiley face with periodic blink |
| Fire | 15 | Bottom-up heat propagation with cooling |
| Rainbow | 30 | Full-spectrum diagonal color flow |
| Wave | 20 | Blue sine wave with vertical concentration |
| Welcome | 8 | Heart pattern scrolling with glow trail |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Language | TypeScript 5.7+ (strict mode, ESM) |
| Monorepo | npm workspaces |
| Server | Fastify 5 |
| MQTT | Aedes (broker), mqtt.js (client) |
| Database | sql.js (WASM SQLite) |
| Dashboard | React 18, Vite 6, Tailwind CSS 3, Zustand 5 |
| Orbital | React 19, Vite 8, Tailwind CSS 4, Canvas API |
| Charts | Recharts |
| WebSocket | ws (Orbital), @fastify/websocket (Hub) |
| Validation | Zod |
| Dev Tools | concurrently, tsx, Vitest |

---

## Roadmap

### Orbital
- [ ] Home Assistant + MQTT integration
- [ ] More animations (clock, weather, notifications)
- [ ] 3D sphere rendering (Three.js) for demo/crowdfunding
- [ ] ESP32 firmware (PlatformIO)
- [ ] iOS app (BLE pairing, chat UI)

### SmartHome Hub
- [ ] Custom integration support
- [ ] Scene management UI
- [ ] Mobile-optimized dashboard

---

## License

MIT
