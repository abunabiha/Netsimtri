import { describe, it, expect, beforeEach } from "vitest";
import { TopologyManager } from "../src/topology/topology-manager.js";
import { PLATFORM_CATALOG } from "../src/topology/platform-catalog.js";

describe("Topology Manager (FR-1, FR-2, FR-8, FR-14)", () => {
  let mgr: TopologyManager;

  beforeEach(() => {
    mgr = new TopologyManager();
  });

  describe("Platform Catalog (FR-14)", () => {
    it("should provide CCNA platforms (Catalyst 2960, Cisco 2900, PC)", () => {
      expect(PLATFORM_CATALOG["catalyst-2960"].curriculum).toBe("CCNA");
      expect(PLATFORM_CATALOG["cisco-2900"].curriculum).toBe("CCNA");
      expect(PLATFORM_CATALOG["pc"].curriculum).toBe("CCNA / CCNP");
    });

    it("should provide CCNP platforms (Catalyst C9300L, C8200L)", () => {
      expect(PLATFORM_CATALOG["catalyst-c9300l"].curriculum).toBe("CCNP");
      expect(PLATFORM_CATALOG["cisco-c8200l"].curriculum).toBe("CCNP");
    });
  });

  describe("FR-1 Kanvas Topologi & Perangkat", () => {
    it("should add devices with unique hostnames and default interfaces", () => {
      const sw1 = mgr.addDevice({
        hostname: "SW-1",
        platform: "catalyst-2960",
        position: { x: 150, y: 200 },
      });

      expect(sw1.hostname).toBe("SW-1");
      expect(sw1.type).toBe("switch");
      expect(sw1.interfaces.length).toBe(26); // 24 FE + 2 GE
      expect(sw1.interfaces[0].id).toBe("FastEthernet0/1");

      const pc1 = mgr.addDevice({
        hostname: "PC-A",
        platform: "pc",
        position: { x: 50, y: 200 },
      });

      expect(pc1.interfaces.length).toBe(1);
      expect(pc1.interfaces[0].id).toBe("eth0");
      expect(mgr.getDevices().length).toBe(2);
    });

    it("should reject adding a device with duplicate hostname (case-insensitive)", () => {
      mgr.addDevice({ hostname: "Router-1", platform: "cisco-2900" });

      expect(() => {
        mgr.addDevice({ hostname: "router-1", platform: "cisco-2900" });
      }).toThrow("already exists in topology");
    });

    it("should rename device enforcing hostname uniqueness", () => {
      const r1 = mgr.addDevice({ hostname: "R1", platform: "cisco-2900" });
      mgr.addDevice({ hostname: "R2", platform: "cisco-2900" });

      expect(() => {
        mgr.renameDevice(r1.id, "R2");
      }).toThrow("already exists in topology");

      const updated = mgr.renameDevice(r1.id, "Gateway-Router");
      expect(updated.hostname).toBe("Gateway-Router");
      expect(updated.runningConfig[0]).toBe("hostname Gateway-Router");
    });

    it("should update device canvas position", () => {
      const dev = mgr.addDevice({ hostname: "SW-1", platform: "catalyst-2960" });
      const moved = mgr.updatePosition(dev.id, { x: 300, y: 450 });
      expect(moved.position).toEqual({ x: 300, y: 450 });
    });

    it("should remove device and automatically delete all connected cables (FR-1)", () => {
      const pc = mgr.addDevice({ hostname: "PC-1", platform: "pc" });
      const sw = mgr.addDevice({ hostname: "SW-1", platform: "catalyst-2960" });
      const r = mgr.addDevice({ hostname: "R-1", platform: "cisco-2900" });

      const link1 = mgr.addLink(pc.id, "eth0", sw.id, "FastEthernet0/1");
      const link2 = mgr.addLink(sw.id, "GigabitEthernet0/1", r.id, "GigabitEthernet0/0/0");

      expect(link1.status).toBe("up");
      expect(link2.status).toBe("up");
      expect(mgr.getLinks().length).toBe(2);

      // Deleting SW-1 must delete both link1 and link2
      mgr.removeDevice(sw.id);

      expect(mgr.getDevice(sw.id)).toBeUndefined();
      expect(mgr.getLinks().length).toBe(0);

      // Verify that PC-1 and R-1 interface connectedLinkId is cleared
      const pcDev = mgr.getDevice(pc.id)!;
      const rDev = mgr.getDevice(r.id)!;
      expect(pcDev.interfaces[0].connectedLinkId).toBeUndefined();
      expect(rDev.interfaces[0].connectedLinkId).toBeUndefined();
    });
  });

  describe("FR-2 Kabel dan Koneksi", () => {
    it("should connect two available interfaces with a link", () => {
      const pc = mgr.addDevice({ hostname: "PC-1", platform: "pc" });
      const sw = mgr.addDevice({ hostname: "SW-1", platform: "catalyst-2960" });

      const link = mgr.addLink(pc.id, "eth0", sw.id, "FastEthernet0/1");
      expect(link.status).toBe("up");
      expect(link.from).toEqual({ device: pc.id, interface: "eth0" });
      expect(link.to).toEqual({ device: sw.id, interface: "FastEthernet0/1" });

      expect(pc.interfaces[0].connectedLinkId).toBe(link.id);
      expect(sw.interfaces[0].connectedLinkId).toBe(link.id);
    });

    it("should reject connecting to the same device", () => {
      const sw = mgr.addDevice({ hostname: "SW-1", platform: "catalyst-2960" });

      expect(() => {
        mgr.addLink(sw.id, "FastEthernet0/1", sw.id, "FastEthernet0/2");
      }).toThrow("Cannot connect an interface to the same device");
    });

    it("should reject connecting an interface that is already occupied", () => {
      const pc1 = mgr.addDevice({ hostname: "PC-1", platform: "pc" });
      const pc2 = mgr.addDevice({ hostname: "PC-2", platform: "pc" });
      const sw = mgr.addDevice({ hostname: "SW-1", platform: "catalyst-2960" });

      mgr.addLink(pc1.id, "eth0", sw.id, "FastEthernet0/1");

      expect(() => {
        mgr.addLink(pc2.id, "eth0", sw.id, "FastEthernet0/1");
      }).toThrow("already connected");
    });

    it("should remove link and free up both interfaces", () => {
      const pc = mgr.addDevice({ hostname: "PC-1", platform: "pc" });
      const sw = mgr.addDevice({ hostname: "SW-1", platform: "catalyst-2960" });

      const link = mgr.addLink(pc.id, "eth0", sw.id, "FastEthernet0/1");
      mgr.removeLink(link.id);

      expect(mgr.getLinks().length).toBe(0);
      expect(pc.interfaces[0].connectedLinkId).toBeUndefined();
      expect(sw.interfaces[0].connectedLinkId).toBeUndefined();
    });

    it("should update link status when an interface is shut down", () => {
      const pc = mgr.addDevice({ hostname: "PC-1", platform: "pc" });
      const sw = mgr.addDevice({ hostname: "SW-1", platform: "catalyst-2960" });

      const link = mgr.addLink(pc.id, "eth0", sw.id, "FastEthernet0/1");
      expect(mgr.getLink(link.id)?.status).toBe("up");

      mgr.setInterfaceStatus(sw.id, "FastEthernet0/1", "admin_down");
      expect(mgr.getLink(link.id)?.status).toBe("down");

      mgr.setInterfaceStatus(sw.id, "FastEthernet0/1", "up");
      expect(mgr.getLink(link.id)?.status).toBe("up");
    });
  });

  describe("FR-8 Simpan dan Muat Topologi (JSON Schema v4)", () => {
    it("should export topology conforming to PRD Section 10", () => {
      const pc = mgr.addDevice({ hostname: "PC-1", platform: "pc", position: { x: 10, y: 20 } });
      const sw = mgr.addDevice({ hostname: "SW-1", platform: "catalyst-2960", position: { x: 100, y: 200 } });
      mgr.addLink(pc.id, "eth0", sw.id, "FastEthernet0/1");

      const exported = mgr.exportJSON();
      expect(exported.schemaVersion).toBe(4);
      expect(exported.devices.length).toBe(2);
      expect(exported.links.length).toBe(1);
    });

    it("should import valid schema v4 JSON and restore topology", () => {
      const pc = mgr.addDevice({ hostname: "PC-1", platform: "pc" });
      const sw = mgr.addDevice({ hostname: "SW-1", platform: "catalyst-2960" });
      mgr.addLink(pc.id, "eth0", sw.id, "FastEthernet0/1");

      const jsonStr = JSON.stringify(mgr.exportJSON());

      const newMgr = new TopologyManager();
      newMgr.importJSON(jsonStr);

      expect(newMgr.getDevices().length).toBe(2);
      expect(newMgr.getLinks().length).toBe(1);
      expect(newMgr.getDevice(pc.id)?.hostname).toBe("PC-1");
      expect(newMgr.getLinks()[0].from.device).toBe(pc.id);
    });

    it("should reject import with unknown schema version with clear message", () => {
      const invalidData = {
        schemaVersion: 2,
        devices: [],
        links: [],
      };

      expect(() => {
        mgr.importJSON(invalidData as unknown as import("../src/topology/types.js").TopologyData);
      }).toThrow("Unsupported topology schema version: 2");
    });
  });
});
