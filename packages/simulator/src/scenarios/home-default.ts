import type { ScenarioConfig } from "../types.js";

export const defaultScenario: ScenarioConfig = {
  name: "Default Home",
  rooms: [
    {
      name: "Living Room",
      devices: [
        { id: "living_room_light_1", name: "Living Room Light 1", domain: "light", room: "Living Room" },
        { id: "living_room_light_2", name: "Living Room Light 2", domain: "light", room: "Living Room" },
        { id: "living_room_temp", name: "Living Room Temperature", domain: "sensor", room: "Living Room" },
        { id: "living_room_motion", name: "Living Room Motion", domain: "binary_sensor", room: "Living Room" },
      ],
    },
    {
      name: "Bedroom",
      devices: [
        { id: "bedroom_light_1", name: "Bedroom Light", domain: "light", room: "Bedroom" },
        { id: "bedroom_switch_1", name: "Bedroom Smart Switch", domain: "switch", room: "Bedroom" },
      ],
    },
    {
      name: "Kitchen",
      devices: [
        { id: "kitchen_light_1", name: "Kitchen Light", domain: "light", room: "Kitchen" },
        { id: "kitchen_humidity", name: "Kitchen Humidity", domain: "sensor", room: "Kitchen" },
        { id: "kitchen_fridge_door", name: "Kitchen Fridge Door", domain: "binary_sensor", room: "Kitchen" },
      ],
    },
    {
      name: "Hallway",
      devices: [
        { id: "hallway_thermostat", name: "Hallway Thermostat", domain: "climate", room: "Hallway" },
        { id: "hallway_motion", name: "Hallway Motion", domain: "binary_sensor", room: "Hallway" },
      ],
    },
  ],
};
