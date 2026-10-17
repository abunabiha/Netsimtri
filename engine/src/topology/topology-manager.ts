import { getPlatformSpec } from "./platform-catalog.js";
import {
  Device,
  DeviceInterface,
  DevicePosition,
  InterfaceStatus,
  Link,
  TopologyData,
} from "./types.js";

export interface CreateDeviceInput {
  id?: string;
  hostname: string;
  platform: string;
  position?: DevicePosition;
}

/**
 * Topology Manager enforcing FR-1, FR-2, FR-8, and FR-14 rules.
 */
export class TopologyManager {
  private devices = new Map<string, Device>();
  private links = new Map<string, Link>();
  private idCounter = 0;
  private macCounter = 1;

  public getDevices(): Device[] {
    return Array.from(this.devices.values());
  }

  public getDevice(id: string): Device | undefined {
    return this.devices.get(id);
  }

  public getLinks(): Link[] {
    return Array.from(this.links.values());
  }

  public getLink(id: string): Link | undefined {
    return this.links.get(id);
  }

  /**
   * Adds a new network device to the topology (FR-1 & FR-14).
   * Enforces unique hostname within topology.
   */
  public addDevice(input: CreateDeviceInput): Device {
    const hostname = input.hostname.trim();
    if (!hostname) {
      throw new Error("Device hostname cannot be empty");
    }

    if (this.isHostnameTaken(hostname)) {
      throw new Error(`Device hostname '${hostname}' already exists in topology`);
    }

    const platformSpec = getPlatformSpec(input.platform);
    const id = input.id || `dev-${++this.idCounter}`;

    if (this.devices.has(id)) {
      throw new Error(`Device ID '${id}' already exists`);
    }

    const interfaces: DeviceInterface[] = platformSpec.defaultInterfaces.map((ifName) => ({
      id: ifName,
      name: ifName,
      status: "up",
      macAddress: this.generateMacAddress(),
    }));

    const device: Device = {
      id,
      hostname,
      type: platformSpec.type,
      platform: input.platform,
      position: input.position || { x: 100, y: 100 },
      interfaces,
      runningConfig: [`hostname ${hostname}`],
      startupConfig: [`hostname ${hostname}`],
    };

    this.devices.set(id, device);
    return device;
  }

  /**
   * Renames an existing device, enforcing uniqueness (FR-1).
   */
  public renameDevice(deviceId: string, newHostname: string): Device {
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new Error(`Device '${deviceId}' not found`);
    }

    const trimmed = newHostname.trim();
    if (!trimmed) {
      throw new Error("Device hostname cannot be empty");
    }

    if (this.isHostnameTaken(trimmed, deviceId)) {
      throw new Error(`Device hostname '${trimmed}' already exists in topology`);
    }

    device.hostname = trimmed;
    device.runningConfig = device.runningConfig.map((line) =>
      line.startsWith("hostname ") ? `hostname ${trimmed}` : line
    );

    return device;
  }

  /**
   * Updates position of a device on the canvas (FR-1).
   */
  public updatePosition(deviceId: string, position: DevicePosition): Device {
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new Error(`Device '${deviceId}' not found`);
    }

    device.position = { ...position };
    return device;
  }

  /**
   * Removes a device and automatically deletes all cables/links connected to it (FR-1).
   */
  public removeDevice(deviceId: string): void {
    if (!this.devices.has(deviceId)) {
      throw new Error(`Device '${deviceId}' not found`);
    }

    // Identify and remove all links connected to this device
    const connectedLinks = Array.from(this.links.values()).filter(
      (link) => link.from.device === deviceId || link.to.device === deviceId
    );

    for (const link of connectedLinks) {
      this.removeLink(link.id);
    }

    this.devices.delete(deviceId);
  }

  /**
   * Connects two unused interfaces with a link (FR-2).
   */
  public addLink(
    fromDeviceId: string,
    fromInterfaceId: string,
    toDeviceId: string,
    toInterfaceId: string
  ): Link {
    if (fromDeviceId === toDeviceId) {
      throw new Error("Cannot connect an interface to the same device");
    }

    const fromDev = this.devices.get(fromDeviceId);
    if (!fromDev) {
      throw new Error(`Source device '${fromDeviceId}' not found`);
    }

    const toDev = this.devices.get(toDeviceId);
    if (!toDev) {
      throw new Error(`Target device '${toDeviceId}' not found`);
    }

    const fromIf = fromDev.interfaces.find((i) => i.id === fromInterfaceId);
    if (!fromIf) {
      throw new Error(
        `Interface '${fromInterfaceId}' does not exist on device '${fromDev.hostname}'`
      );
    }

    const toIf = toDev.interfaces.find((i) => i.id === toInterfaceId);
    if (!toIf) {
      throw new Error(
        `Interface '${toInterfaceId}' does not exist on device '${toDev.hostname}'`
      );
    }

    if (fromIf.connectedLinkId) {
      throw new Error(
        `Interface '${fromIf.name}' on device '${fromDev.hostname}' is already connected to another cable`
      );
    }

    if (toIf.connectedLinkId) {
      throw new Error(
        `Interface '${toIf.name}' on device '${toDev.hostname}' is already connected to another cable`
      );
    }

    const linkId = `link-${++this.idCounter}`;
    const isUp = fromIf.status === "up" && toIf.status === "up";

    const link: Link = {
      id: linkId,
      from: { device: fromDeviceId, interface: fromInterfaceId },
      to: { device: toDeviceId, interface: toInterfaceId },
      status: isUp ? "up" : "down",
    };

    fromIf.connectedLinkId = linkId;
    toIf.connectedLinkId = linkId;

    this.links.set(linkId, link);
    return link;
  }

  /**
   * Removes a link/cable and frees up both connected interfaces (FR-2).
   */
  public removeLink(linkId: string): void {
    const link = this.links.get(linkId);
    if (!link) {
      throw new Error(`Link '${linkId}' not found`);
    }

    const fromDev = this.devices.get(link.from.device);
    const toDev = this.devices.get(link.to.device);

    const fromIf = fromDev?.interfaces.find((i) => i.id === link.from.interface);
    if (fromIf) {
      delete fromIf.connectedLinkId;
    }

    const toIf = toDev?.interfaces.find((i) => i.id === link.to.interface);
    if (toIf) {
      delete toIf.connectedLinkId;
    }

    this.links.delete(linkId);
  }

  /**
   * Updates interface status and synchronizes connected link state (FR-2).
   */
  public setInterfaceStatus(
    deviceId: string,
    interfaceId: string,
    status: InterfaceStatus
  ): void {
    const dev = this.devices.get(deviceId);
    if (!dev) {
      throw new Error(`Device '${deviceId}' not found`);
    }

    const iface = dev.interfaces.find((i) => i.id === interfaceId);
    if (!iface) {
      throw new Error(`Interface '${interfaceId}' not found on device '${dev.hostname}'`);
    }

    iface.status = status;

    if (iface.connectedLinkId) {
      const link = this.links.get(iface.connectedLinkId);
      if (link) {
        const otherEndpoint =
          link.from.device === deviceId ? link.to : link.from;
        const otherDev = this.devices.get(otherEndpoint.device);
        const otherIf = otherDev?.interfaces.find(
          (i) => i.id === otherEndpoint.interface
        );

        const bothUp = iface.status === "up" && otherIf?.status === "up";
        link.status = bothUp ? "up" : "down";
      }
    }
  }

  /**
   * Exports topology data conforming to PRD Section 10 (FR-8).
   */
  public exportJSON(): TopologyData {
    return {
      schemaVersion: 4,
      devices: this.getDevices(),
      links: this.getLinks(),
    };
  }

  /**
   * Imports topology data, strictly validating schemaVersion (FR-8).
   */
  public importJSON(raw: TopologyData | string): TopologyData {
    const data: TopologyData = typeof raw === "string" ? JSON.parse(raw) : raw;

    if (!data || typeof data !== "object") {
      throw new Error("Invalid topology data: Expected a JSON object");
    }

    if (data.schemaVersion !== 4) {
      throw new Error(
        `Unsupported topology schema version: ${data.schemaVersion}. Only schemaVersion 4 is supported.`
      );
    }

    if (!Array.isArray(data.devices) || !Array.isArray(data.links)) {
      throw new Error("Invalid topology format: 'devices' and 'links' must be arrays");
    }

    this.clear();

    // Import devices
    for (const d of data.devices) {
      if (this.isHostnameTaken(d.hostname)) {
        throw new Error(`Duplicate hostname in import: '${d.hostname}'`);
      }
      this.devices.set(d.id, {
        ...d,
        position: d.position || { x: 100, y: 100 },
        interfaces: d.interfaces || [],
        runningConfig: d.runningConfig || [],
        startupConfig: d.startupConfig || [],
      });
    }

    // Import links
    for (const l of data.links) {
      const fromDev = this.devices.get(l.from.device);
      const toDev = this.devices.get(l.to.device);

      if (!fromDev || !toDev) {
        throw new Error(`Link '${l.id}' references non-existent device`);
      }

      const fromIf = fromDev.interfaces.find((i) => i.id === l.from.interface);
      const toIf = toDev.interfaces.find((i) => i.id === l.to.interface);

      if (!fromIf || !toIf) {
        throw new Error(`Link '${l.id}' references non-existent interface`);
      }

      fromIf.connectedLinkId = l.id;
      toIf.connectedLinkId = l.id;

      this.links.set(l.id, l);
    }

    return this.exportJSON();
  }

  /**
   * Resets entire topology.
   */
  public clear(): void {
    this.devices.clear();
    this.links.clear();
    this.idCounter = 0;
  }

  private isHostnameTaken(hostname: string, excludeDeviceId?: string): boolean {
    const target = hostname.toLowerCase();
    for (const dev of this.devices.values()) {
      if (excludeDeviceId && dev.id === excludeDeviceId) {
        continue;
      }
      if (dev.hostname.toLowerCase() === target) {
        return true;
      }
    }
    return false;
  }

  private generateMacAddress(): string {
    const hex = (n: number) => n.toString(16).padStart(2, "0").toUpperCase();
    const b4 = hex((this.macCounter >> 16) & 0xff);
    const b5 = hex((this.macCounter >> 8) & 0xff);
    const b6 = hex(this.macCounter & 0xff);
    this.macCounter++;
    return `00:50:79:${b4}:${b5}:${b6}`;
  }
}
