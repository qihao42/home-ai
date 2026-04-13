# Orbital - Hardware Bill of Materials (BOM)

Phase 1 estimated cost: ~RM78-80 | Phase 1+2: ~RM138-140

## Components

| # | Component | Price | Platform | Purpose |
|---|-----------|-------|----------|---------|
| 1 | ESP32-S3 SuperMini | ~RM26 | Lazada | Phase 1 core controller chip |
| 1B | XIAO ESP32S3 Sense (Pre-Soldered) | ~USD$13.99 (~RM60) | Seeed Studio | Phase 2 smart voice upgrade (MEMS mic + camera) |
| 2 | WS2812B 8x8 LED Matrix Panel | ~RM21 | Lazada | Visual surface (64 RGB LEDs) |
| 3 | Dupont Jumper Wires 20cm (x2 sets) | ~RM6 | Lazada | Hardware wiring (M-M + M-F) |
| 4 | UGREEN USB-C to C 1M Data Cable | ~RM22 | Shopee | Code upload & serial debug (480Mbps) |
| 5 | MB102 Breadboard 400-hole | ~RM3-5 | Shopee | Solderless prototyping platform |

## Wiring Diagram (Phase 1)

```
ESP32-S3 SuperMini          WS2812B 8x8 LED Panel
┌──────────────┐            ┌──────────────────┐
│              │            │                  │
│  GPIO (D2)   │───────────→│  DIN (Data In)   │
│              │            │                  │
│  5V          │───────────→│  VCC (Power)     │
│              │            │                  │
│  GND         │───────────→│  GND (Ground)    │
│              │            │                  │
└──────────────┘            └──────────────────┘
       │
       │ USB-C Data Cable
       │
  ┌────┴─────┐
  │  Laptop  │
  └──────────┘
```

All connections via breadboard + jumper wires. No soldering required.

## Purchase Links

- **ESP32-S3 SuperMini**: [Lazada](https://www.lazada.com.my/products/esp32-s3-esp32-c3-esp32-h2-esp32-c6-development-board-modules-mini-wifi-bt-bluetooth-module-single-core-supmermini-esp32-s3-xiao-i4182728293.html) - Select "S3 SuperMini"
- **XIAO ESP32S3 Sense**: [Seeed Studio](https://www.seeedstudio.com/Seeed-Studio-XIAO-ESP32S3-Sense-Pre-Soldered-p-6335.html) - Select "Pre-Soldered"
- **WS2812B 8x8 Panel**: [Lazada](https://www.lazada.com.my/products/ws2812b-rgb-individually-addressable-flexible-digital-led-panel-strip-light-ws2812-8x8-16x16-8x32-dc5v-module-matrix-screen-i2728868451.html) - Select "8x8 Panel"
- **Dupont Wires**: [Lazada](https://www.lazada.com.my/products/dupont-jumper-wire-20cm-breadboard-jumper-cable-male-to-male-female-to-female-male-to-female-i493040156.html) - Buy 2 sets (M-M + M-F, 20cm)
- **USB-C Cable**: [Shopee](https://shopee.com.my/UGREEN-1M-60W-USB-C-to-Type-C-Type-C-USB-C-USBC-TypeC-Cable-PD-QC-3.0-Fast-Charge-Sync-Data-Transfer-Cables-i.62591396.8030642521) - Black 1M
- **Breadboard**: [Shopee](https://shopee.com.my/MB102-Solderless-Mini-Medium-Large-Breadboard-170-400-830-Holes-Solderless-Breadboard-Arduino-UNO-Board-i.678234279.16218546637) - 400 Holes
