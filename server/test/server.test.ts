import { describe, it, expect, beforeAll, afterAll } from "vitest";
import http from "node:http";
import { createServer } from "../src/index.js";
import { TopologyManager } from "@netsimtri/engine";

describe("Server REST API and Web GUI (M1)", () => {
  let server: http.Server;
  let testPort: number;
  let baseUrl: string;

  beforeAll(async () => {
    const manager = new TopologyManager();
    server = createServer(manager);
    await new Promise<void>((resolve) => {
      server.listen(0, () => {
        const addr = server.address() as { port: number };
        testPort = addr.port;
        baseUrl = `http://127.0.0.1:${testPort}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it("should respond to GET /health with 200 OK", async () => {
    const res = await fetch(`${baseUrl}/health`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ status: "ok" });
  });

  it("should serve interactive Web GUI at GET /", async () => {
    const res = await fetch(`${baseUrl}/`);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("NetSimTRI");
    expect(html).toContain("Topology Canvas");
    expect(html).toContain("Palet Perangkat");
  });

  it("should return supported platforms at GET /api/platforms", async () => {
    const res = await fetch(`${baseUrl}/api/platforms`);
    expect(res.status).toBe(200);
    const platforms = await res.json();
    expect(Array.isArray(platforms)).toBe(true);
    const ids = platforms.map((p: { id: string }) => p.id);
    expect(ids).toContain("catalyst-2960");
    expect(ids).toContain("cisco-2900");
    expect(ids).toContain("pc");
  });

  it("should handle full topology CRUD via API (FR-1, FR-2, FR-8)", async () => {
    // 1. Get initial topology
    const resInitial = await fetch(`${baseUrl}/api/topology`);
    expect(resInitial.status).toBe(200);
    const topo = await resInitial.json();
    expect(topo.schemaVersion).toBe(4);

    // 2. Add device 1
    const resD1 = await fetch(`${baseUrl}/api/topology/devices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hostname: "SW-Core",
        platform: "catalyst-2960",
        position: { x: 200, y: 150 },
      }),
    });
    expect(resD1.status).toBe(201);
    const swCore = await resD1.json();
    expect(swCore.hostname).toBe("SW-Core");

    // 3. Add device 2
    const resD2 = await fetch(`${baseUrl}/api/topology/devices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hostname: "PC-Admin",
        platform: "pc",
        position: { x: 100, y: 300 },
      }),
    });
    expect(resD2.status).toBe(201);
    const pcAdmin = await resD2.json();

    // 4. Connect with link
    const resLink = await fetch(`${baseUrl}/api/topology/links`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fromDevice: swCore.id,
        fromInterface: "FastEthernet0/1",
        toDevice: pcAdmin.id,
        toInterface: "eth0",
      }),
    });
    expect(resLink.status).toBe(201);
    const link = await resLink.json();
    expect(link.status).toBe("up");

    // 5. Delete device and verify link cleanup
    const resDel = await fetch(`${baseUrl}/api/topology/devices/${swCore.id}`, {
      method: "DELETE",
    });
    expect(resDel.status).toBe(200);

    const resCheck = await fetch(`${baseUrl}/api/topology`);
    const updatedTopo = await resCheck.json();
    expect(updatedTopo.devices.some((d: { id: string }) => d.id === swCore.id)).toBe(false);
    expect(updatedTopo.links.some((l: { id: string }) => l.id === link.id)).toBe(false);
  });
});
