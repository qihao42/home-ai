export interface DeviceConfig {
  readonly id: string;
  readonly name: string;
  readonly domain: string;
  readonly room: string;
}

export interface ScenarioRoom {
  readonly name: string;
  readonly devices: readonly DeviceConfig[];
}

export interface ScenarioConfig {
  readonly name: string;
  readonly rooms: readonly ScenarioRoom[];
}
