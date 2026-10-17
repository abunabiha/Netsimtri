import { PlatformSpec } from "./types.js";

/**
 * Standard Hardware Platforms supported by NetSimTRI (PRD Section 5.3 & FR-14).
 */
export const PLATFORM_CATALOG: Record<string, PlatformSpec> = {
  "pc": {
    id: "pc",
    name: "Standard PC / Workstation",
    type: "pc",
    curriculum: "CCNA / CCNP",
    dialect: "none",
    defaultInterfaces: ["eth0"],
  },
  "catalyst-2960": {
    id: "catalyst-2960",
    name: "Cisco Catalyst 2960 Switch",
    type: "switch",
    curriculum: "CCNA",
    dialect: "ios15",
    defaultInterfaces: [
      ...Array.from({ length: 24 }, (_, i) => `FastEthernet0/${i + 1}`),
      "GigabitEthernet0/1",
      "GigabitEthernet0/2",
    ],
  },
  "cisco-2900": {
    id: "cisco-2900",
    name: "Cisco 2900 Integrated Services Router",
    type: "router",
    curriculum: "CCNA",
    dialect: "ios15",
    defaultInterfaces: [
      "GigabitEthernet0/0/0",
      "GigabitEthernet0/0/1",
      "GigabitEthernet0/0/2",
    ],
  },
  "catalyst-c9300l": {
    id: "catalyst-c9300l",
    name: "Cisco Catalyst 9300L Multilayer Switch",
    type: "switch",
    curriculum: "CCNP",
    dialect: "iosxe",
    defaultInterfaces: [
      ...Array.from({ length: 24 }, (_, i) => `GigabitEthernet1/0/${i + 1}`),
      "TenGigabitEthernet1/1/1",
      "TenGigabitEthernet1/1/2",
      "TenGigabitEthernet1/1/3",
      "TenGigabitEthernet1/1/4",
    ],
  },
  "cisco-c8200l": {
    id: "cisco-c8200l",
    name: "Cisco Catalyst 8200L Edge Router",
    type: "router",
    curriculum: "CCNP",
    dialect: "iosxe",
    defaultInterfaces: [
      "GigabitEthernet0/0/0",
      "GigabitEthernet0/0/1",
      "GigabitEthernet0/0/2",
      "GigabitEthernet0/0/3",
    ],
  },
};

export function getPlatformSpec(platformId: string): PlatformSpec {
  const spec = PLATFORM_CATALOG[platformId];
  if (!spec) {
    throw new Error(`Unknown platform: ${platformId}`);
  }
  return spec;
}
