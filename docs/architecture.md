# Orbital - Technical Architecture & Strategy

## Core Philosophy: Privacy-First by Design

- **Local-First**: All processing (STT, LLM) runs on user's local desktop "Brain", not corporate servers
- **Zero-Telemetry Baseline**: System functions entirely offline. Cloud features are strictly opt-in
- **Open Source Transparency**: Desktop software and agent framework under MIT/Apache 2.0

## Ecosystem Architecture

### Part A: Desktop "Brain" (Phase 1)

Central processing hub. Hosts local LLMs (via Ollama/OpenCode) and Whisper-based transcription. Bridges the hardware Sphere to powerful computing without needing expensive onboard AI chips.

### Part B: Super App (Control & Monetization)

- **Custom Keyboard Extension**: WisprFlow-style dictation, faster than Siri, processing through user's private Desktop Brain
- **Remote Management**: Encrypted SSH-tunneling (Termius-style) for smart home management from anywhere

### Part C: The Sphere (Hardware Interface)

- **Visuals**: P1.9 high-density spherical LED matrix (3840Hz refresh rate)
- **Processing**: ESP32-S3 (low thermal footprint, native Matter + Wi-Fi support)
- **Interaction**: Physical AI avatar with visual feedback, acts as Matter/Thread border router

## Hardware Selection: Why ESP32-S3?

| Criteria | ESP32-S3 |
|----------|----------|
| LED driving | Enough power for thousands of LEDs at 60fps |
| Connectivity | Built-in Wi-Fi + Bluetooth, native HA/ESPHome support |
| Cost | Chip < $2, low heat generation |
| Ecosystem | Open-source smart home standard chip |

### Phase 2 Alternatives (Smart Voice)

| Option | Pros | Cons |
|--------|------|------|
| Raspberry Pi Zero 2 W (~$15) | Linux, complex audio processing, local wake-word | Expensive, high power, heat issues |
| Custom Audio AI SoC (Amlogic/Allwinner) | Purpose-built for smart speakers, cheap | Very high software dev threshold |

**Strategy**: Phase 1 entirely on ESP32-S3 to validate market fast. Reconsider architecture for Phase 2.

## The "Hybrid Architecture" for AI Voice

**Problem**: $38 chip cannot run local LLMs. Target audience (geek/open-source community) is Privacy-First.

**Solution**:
- Basic commands (lights, timers) run purely on local network via open-source protocols
- AI conversation features use "Opt-in Cloud AI Switch" in the App
- Only upon user consent does relay server call external LLM APIs
- Privacy choice handed entirely to user (major marketing hook)

## Financial Model

| Tier | Price | Features |
|------|-------|----------|
| Open-Source (Free) | $0 | Local Desktop Brain, local STT/TTS, basic HA integration |
| Sphere Pro (Subscription) | $8-12/mo | Premium ElevenLabs voice API, cloud relay, AI Keyboard |
| Sphere Hardware | $149.00 | Physical P1.9 LED Sphere, Matter/Thread, local wake-word |

- **Target COGS**: $38.20/unit (Shenzhen-direct LED supply chain)
- **Gross Margin**: ~74%
- **Target Market**: $117B DIY home automation market

## Collaboration Model

### Malaysia (Software, Marketing & Cloud) - Hao & Darry

- Traffic & marketing loop (SEO/GTM), official website, crowdfunding landing page
- Frontend & interaction hub (Web/App for sphere control)
- Cloud relay & API architecture (Opt-in Cloud AI)
- Prototype code testing (ESP32 flash & verification)

### US (Hardware, Crowdfunding & Localization) - Ming

- LED hardware execution (supplier interface, manufacturing, prototyping)
- US market testing (real home environments, beta testing)
- Crowdfunding operations (Kickstarter entity, pricing, fulfillment)
