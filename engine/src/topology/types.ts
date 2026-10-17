/**
 * Topology and Network Device Types (PRD Section 10 & FR-1, FR-2, FR-8, FR-14)
 */

export type DeviceType = "router" | "switch" | "pc";

export type InterfaceStatus = "up" | "down" | "admin_down";

export interface DeviceInterface {
  id: string; // e.g. "Fa0/1", "Gi0/0/0", "eth0"
  name: string;
  status: InterfaceStatus;
  macAddress: string;
  ipAddress?: string;
  prefix?: number;
  gateway?: string;
  connectedLinkId?: string;
}

export interface DevicePosition {
  x: number;
  y: number;
}

export interface Device {
  id: string;
  hostname: string;
  type: DeviceType;
  platform: string; // e.g. "catalyst-2960", "cisco-2900", "pc"
  position: DevicePosition;
  interfaces: DeviceInterface[];
  runningConfig: string[];
  startupConfig: string[];
}

export interface LinkEndpoint {
  device: string;
  interface: string;
}

export interface Link {
  id: string;
  from: LinkEndpoint;
  to: LinkEndpoint;
  status: "up" | "down";
}

export interface TopologyScenario {
  tags?: string[];
  objectives?: string[];
  modules?: string[];
  requiredPlatforms?: string[];
  checks?: string[];
}

export interface TopologyData {
  schemaVersion: number; // Must be 4 according to PRD Section 10
  devices: Device[];
  links: Link[];
  scenario?: TopologyScenario;
}

export interface PlatformSpec {
  id: string;
  name: string;
  type: DeviceType;
  curriculum: "CCNA" | "CCNP" | "CCNA / CCNP";
  dialect: "ios15" | "iosxe" | "none";
  defaultInterfaces: string[];
}
