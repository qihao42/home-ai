# Orbital - Testing Milestones

## Milestone 1: Hardware Boot-up & Thermal Testing

**Goal**: Proof of Concept

**Hardware needed**: ESP32-S3 + LED Panel + Breadboard + Jumper Wires + USB-C Cable

**Test procedure**:
1. Assemble bare board with ESP32 and LED beads in 3D-printed spherical shell
2. Set brightness to 100%
3. Run continuously for 48 hours

**Success criteria**:
- [ ] System does not crash during 48-hour run
- [ ] Surface temperature of sphere stays below 45 C (not hot to touch)
- [ ] If overheating: reduce LED count or add ventilation holes

---

## Milestone 2: Visual & Control Fluidity Test

**Goal**: UI/UX Validation

**Hardware needed**: Same as Milestone 1

**Test procedure**:
1. Connect phone to device's hotspot or same Wi-Fi
2. Send commands via App to change sphere's color/expression
3. Run LED animations (expressions, fire, rainbow)

**Success criteria**:
- [ ] LED animations run at 60fps with no visible stutter
- [ ] After tapping color change in App, sphere reaction latency < 0.5 seconds
- [ ] All 5 preset animations render correctly

---

## Milestone 3: Smart Home Integration Test

**Goal**: Home Assistant Connectivity (Pure Software Simulation)

**Hardware needed**: Same as above + Computer with Home Assistant VM

**Test procedure**:
1. Install Home Assistant (HA) virtual machine on computer
2. Create "Virtual Entities" in HA (virtual switch, virtual lock)
3. Click "virtual lock open" in browser
4. HA sends command over local network to ESP32 test board

**Success criteria**:
- [ ] Device reads Home Assistant state stream correctly
- [ ] Immediately switches to preset LED animation when receiving virtual signal
- [ ] Welcome animation plays when virtual lock opens
- [ ] Response time from HA trigger to LED animation < 1 second

---

## Phase 2 Testing (Future)

### Voice Wake-word Testing
- MEMS microphone array integration
- Local wake-word detection accuracy > 95%
- False positive rate < 1 per hour

### Matter/Thread Connectivity
- Sphere acts as Matter border router
- Controls Apple Home, Google Home, and Zigbee devices
- End-to-end latency < 2 seconds
