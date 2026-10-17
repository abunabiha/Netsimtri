import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  PLATFORM_CATALOG,
  TopologyManager,
} from "@netsimtri/engine";

export const PORT = Number(process.env.PORT) || 8080;

export function createServer(customManager?: TopologyManager): http.Server {
  const manager = customManager || new TopologyManager();

  // Populate default starter topology if empty
  if (manager.getDevices().length === 0) {
    try {
      const r1 = manager.addDevice({
        id: "r1",
        hostname: "R1",
        platform: "cisco-2900",
        position: { x: 420, y: 140 },
      });
      const sw1 = manager.addDevice({
        id: "sw1",
        hostname: "SW1",
        platform: "catalyst-2960",
        position: { x: 420, y: 300 },
      });
      const pca = manager.addDevice({
        id: "pca",
        hostname: "PC-A",
        platform: "pc",
        position: { x: 220, y: 440 },
      });
      const pcb = manager.addDevice({
        id: "pcb",
        hostname: "PC-B",
        platform: "pc",
        position: { x: 620, y: 440 },
      });

      manager.addLink(r1.id, "GigabitEthernet0/0/0", sw1.id, "GigabitEthernet0/1");
      manager.addLink(sw1.id, "FastEthernet0/1", pca.id, "eth0");
      manager.addLink(sw1.id, "FastEthernet0/2", pcb.id, "eth0");
    } catch {
      // Ignore if initialization fails
    }
  }

  return http.createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
    const method = req.method ?? "GET";

    // Helper functions
    const sendJSON = (statusCode: number, data: unknown) => {
      res.writeHead(statusCode, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      });
      res.end(JSON.stringify(data));
    };

    const sendError = (statusCode: number, err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      sendJSON(statusCode, { error: message });
    };

    const getBody = async <T = Record<string, unknown>>(): Promise<T> => {
      return new Promise((resolve, reject) => {
        let body = "";
        req.on("data", (chunk) => {
          body += chunk;
        });
        req.on("end", () => {
          try {
            resolve(body ? JSON.parse(body) : ({} as T));
          } catch {
            reject(new Error("Invalid JSON body"));
          }
        });
        req.on("error", reject);
      });
    };

    if (method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      });
      res.end();
      return;
    }

    // 1. Health endpoint
    if (url.pathname === "/health" && method === "GET") {
      sendJSON(200, { status: "ok" });
      return;
    }

    // 2. Platform Catalog API
    if (url.pathname === "/api/platforms" && method === "GET") {
      sendJSON(200, Object.values(PLATFORM_CATALOG));
      return;
    }

    // 3. Topology APIs
    if (url.pathname === "/api/topology" && method === "GET") {
      sendJSON(200, manager.exportJSON());
      return;
    }

    // Add Device
    if (url.pathname === "/api/topology/devices" && method === "POST") {
      try {
        const body = await getBody<{ hostname: string; platform: string; position?: { x: number; y: number } }>();
        const dev = manager.addDevice({
          hostname: body.hostname,
          platform: body.platform,
          position: body.position,
        });
        sendJSON(201, dev);
      } catch (err: unknown) {
        sendError(400, err);
      }
      return;
    }

    // Update Device (position or hostname)
    if (url.pathname.startsWith("/api/topology/devices/") && method === "PUT") {
      const deviceId = url.pathname.replace("/api/topology/devices/", "");
      try {
        const body = await getBody<{ hostname?: string; position?: { x: number; y: number } }>();
        if (body.hostname) {
          manager.renameDevice(deviceId, body.hostname);
        }
        if (body.position) {
          manager.updatePosition(deviceId, body.position);
        }
        const updated = manager.getDevice(deviceId);
        sendJSON(200, updated);
      } catch (err: unknown) {
        sendError(400, err);
      }
      return;
    }

    // Delete Device
    if (url.pathname.startsWith("/api/topology/devices/") && method === "DELETE") {
      const deviceId = url.pathname.replace("/api/topology/devices/", "");
      try {
        manager.removeDevice(deviceId);
        sendJSON(200, { success: true });
      } catch (err: unknown) {
        sendError(400, err);
      }
      return;
    }

    // Add Link
    if (url.pathname === "/api/topology/links" && method === "POST") {
      try {
        const body = await getBody<{ fromDevice: string; fromInterface: string; toDevice: string; toInterface: string }>();
        const link = manager.addLink(
          body.fromDevice,
          body.fromInterface,
          body.toDevice,
          body.toInterface
        );
        sendJSON(201, link);
      } catch (err: unknown) {
        sendError(400, err);
      }
      return;
    }

    // Delete Link
    if (url.pathname.startsWith("/api/topology/links/") && method === "DELETE") {
      const linkId = url.pathname.replace("/api/topology/links/", "");
      try {
        manager.removeLink(linkId);
        sendJSON(200, { success: true });
      } catch (err: unknown) {
        sendError(400, err);
      }
      return;
    }

    // Clear Topology
    if (url.pathname === "/api/topology/clear" && method === "POST") {
      manager.clear();
      sendJSON(200, { success: true });
      return;
    }

    // Import Topology JSON
    if (url.pathname === "/api/topology/import" && method === "POST") {
      try {
        const body = await getBody();
        const result = manager.importJSON(body as unknown as import("@netsimtri/engine").TopologyData);
        sendJSON(200, result);
      } catch (err: unknown) {
        sendError(400, err);
      }
      return;
    }

    // 4. GUI Web Application (GET /)
    if (url.pathname === "/" && method === "GET") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(renderWebGUI());
      return;
    }

    sendJSON(404, { error: "Endpoint not found" });
  });
}

function renderWebGUI(): string {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NetSimTRI - Simulator Jaringan CCNA & CCNP Polinela</title>
  <style>
    :root {
      --bg: #0f172a;
      --panel: #1e293b;
      --panel-border: #334155;
      --primary: #2563eb;
      --primary-hover: #1d4ed8;
      --accent: #0ea5e9;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --success: #10b981;
      --danger: #ef4444;
      --warning: #f59e0b;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
    }
    header {
      background: var(--panel);
      border-bottom: 1px solid var(--panel-border);
      padding: 10px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 10;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand h1 {
      font-size: 1.15rem;
      font-weight: 700;
      color: #38bdf8;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .badge {
      font-size: 0.7rem;
      padding: 2px 8px;
      border-radius: 9999px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .badge-ccna { background: rgba(14, 165, 233, 0.2); color: #38bdf8; border: 1px solid #0284c7; }
    .badge-ccnp { background: rgba(168, 85, 247, 0.2); color: #c084fc; border: 1px solid #9333ea; }
    .badge-both { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid #059669; }
    .top-actions {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    button {
      background: var(--panel);
      color: var(--text);
      border: 1px solid var(--panel-border);
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 0.82rem;
      font-weight: 500;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
    }
    button:hover { background: #334155; }
    button.primary { background: var(--primary); border-color: var(--primary); color: white; }
    button.primary:hover { background: var(--primary-hover); }
    button.active { background: #0284c7; border-color: #38bdf8; color: white; }
    button.danger { border-color: #7f1d1d; color: #f87171; }
    button.danger:hover { background: #7f1d1d; color: white; }

    .main-container {
      display: flex;
      flex: 1;
      height: calc(100vh - 54px);
      position: relative;
    }
    /* Left Sidebar: Device Palette */
    .sidebar {
      width: 240px;
      background: var(--panel);
      border-right: 1px solid var(--panel-border);
      display: flex;
      flex-direction: column;
      z-index: 5;
    }
    .sidebar-header {
      padding: 12px 16px;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      border-bottom: 1px solid var(--panel-border);
    }
    .palette-group {
      padding: 12px 14px;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .palette-group h3 {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-bottom: 8px;
      text-transform: uppercase;
    }
    .palette-item {
      background: #0f172a;
      border: 1px solid var(--panel-border);
      border-radius: 6px;
      padding: 8px 10px;
      margin-bottom: 8px;
      cursor: grab;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: border-color 0.15s;
    }
    .palette-item:hover {
      border-color: #38bdf8;
      background: #1e293b;
    }
    .palette-item-name {
      font-size: 0.82rem;
      font-weight: 600;
    }
    .palette-item-desc {
      font-size: 0.7rem;
      color: var(--text-muted);
    }

    /* Center Canvas */
    .canvas-container {
      flex: 1;
      position: relative;
      background: #0b1120;
      overflow: hidden;
      cursor: default;
    }
    .canvas-grid {
      position: absolute;
      width: 100%;
      height: 100%;
      background-size: 30px 30px;
      background-image:
        linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
    }
    svg.canvas-svg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: all;
    }
    .link-line {
      stroke: #64748b;
      stroke-width: 3;
      cursor: pointer;
      transition: stroke 0.2s;
    }
    .link-line:hover {
      stroke: #38bdf8;
      stroke-width: 4;
    }
    .link-led {
      r: 4;
      stroke: #0f172a;
      stroke-width: 1.5;
    }
    .link-led.up { fill: #10b981; }
    .link-led.down { fill: #ef4444; }

    /* Device Nodes */
    .device-node {
      position: absolute;
      width: 80px;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: move;
      user-select: none;
      z-index: 4;
    }
    .device-node.selected .device-icon-box {
      border-color: #38bdf8;
      box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.3);
    }
    .device-icon-box {
      width: 54px;
      height: 54px;
      background: #1e293b;
      border: 2px solid #475569;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.6rem;
      transition: all 0.15s ease;
    }
    .device-node:hover .device-icon-box {
      border-color: #94a3b8;
    }
    .device-label {
      margin-top: 6px;
      font-size: 0.78rem;
      font-weight: 700;
      color: #f1f5f9;
      text-align: center;
      background: rgba(15, 23, 42, 0.85);
      padding: 2px 6px;
      border-radius: 4px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      white-space: nowrap;
    }
    .device-platform {
      font-size: 0.65rem;
      color: var(--text-muted);
      margin-top: 1px;
    }

    /* Right Inspector Panel */
    .inspector {
      width: 320px;
      background: var(--panel);
      border-left: 1px solid var(--panel-border);
      display: flex;
      flex-direction: column;
      z-index: 5;
    }
    .inspector-header {
      padding: 12px 16px;
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--text);
      border-bottom: 1px solid var(--panel-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .inspector-content {
      padding: 16px;
      overflow-y: auto;
      flex: 1;
    }
    .detail-card {
      background: #0f172a;
      border: 1px solid var(--panel-border);
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 12px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.78rem;
      margin-bottom: 6px;
    }
    .detail-row span:first-child { color: var(--text-muted); }
    .detail-row span:last-child { font-weight: 600; color: #f1f5f9; }
    .interface-list {
      margin-top: 10px;
      max-height: 220px;
      overflow-y: auto;
    }
    .interface-item {
      background: #1e293b;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 4px;
      padding: 6px 10px;
      margin-bottom: 4px;
      font-size: 0.75rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .if-status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      display: inline-block;
      margin-right: 5px;
    }
    .if-status-dot.up { background: #10b981; }
    .if-status-dot.down { background: #ef4444; }

    /* Modals & Dialogs */
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 100;
    }
    .modal-box {
      background: var(--panel);
      border: 1px solid var(--panel-border);
      border-radius: 8px;
      padding: 20px;
      width: 360px;
      max-width: 90%;
    }
    .modal-title { font-size: 0.95rem; font-weight: 700; margin-bottom: 12px; }
    .modal-body select, .modal-body input {
      width: 100%;
      background: #0f172a;
      color: var(--text);
      border: 1px solid var(--panel-border);
      border-radius: 6px;
      padding: 8px;
      font-size: 0.85rem;
      margin-bottom: 14px;
    }
    .modal-actions { display: flex; justify-content: flex-end; gap: 8px; }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <h1>🌐 NetSimTRI <span>Topology Canvas</span></h1>
      <span class="badge badge-ccna">CCNA 200-301</span>
      <span class="badge badge-ccnp">CCNP Enterprise</span>
    </div>
    <div class="top-actions">
      <button id="btn-cable" title="Tarik kabel antar dua interface"><span id="cable-icon">🔌</span> Mode Kabel</button>
      <button id="btn-export" title="Ekspor topologi ke format JSON">📥 Ekspor</button>
      <button id="btn-import" title="Impor topologi dari format JSON">📤 Impor</button>
      <button id="btn-clear" class="danger" title="Bersihkan seluruh kanvas">🗑️ Hapus Semua</button>
    </div>
  </header>

  <div class="main-container">
    <!-- Palette -->
    <div class="sidebar">
      <div class="sidebar-header">Palet Perangkat (FR-14)</div>
      
      <div class="palette-group">
        <h3>Router</h3>
        <div class="palette-item" onclick="addDevice('cisco-2900')">
          <div>
            <div class="palette-item-name">Cisco 2900</div>
            <div class="palette-item-desc">3x GE Interface</div>
          </div>
          <span class="badge badge-ccna">CCNA</span>
        </div>
        <div class="palette-item" onclick="addDevice('cisco-c8200l')">
          <div>
            <div class="palette-item-name">Cisco C8200L</div>
            <div class="palette-item-desc">4x GE (IOS-XE)</div>
          </div>
          <span class="badge badge-ccnp">CCNP</span>
        </div>
      </div>

      <div class="palette-group">
        <h3>Switch</h3>
        <div class="palette-item" onclick="addDevice('catalyst-2960')">
          <div>
            <div class="palette-item-name">Catalyst 2960</div>
            <div class="palette-item-desc">24 FE + 2 GE</div>
          </div>
          <span class="badge badge-ccna">CCNA</span>
        </div>
        <div class="palette-item" onclick="addDevice('catalyst-c9300l')">
          <div>
            <div class="palette-item-name">Catalyst C9300L</div>
            <div class="palette-item-desc">L3 Switch (IOS-XE)</div>
          </div>
          <span class="badge badge-ccnp">CCNP</span>
        </div>
      </div>

      <div class="palette-group">
        <h3>End Devices</h3>
        <div class="palette-item" onclick="addDevice('pc')">
          <div>
            <div class="palette-item-name">Standard PC</div>
            <div class="palette-item-desc">1x Ethernet</div>
          </div>
          <span class="badge badge-both">Dual</span>
        </div>
      </div>
    </div>

    <!-- Canvas -->
    <div class="canvas-container" id="canvas-container">
      <div class="canvas-grid"></div>
      <svg class="canvas-svg" id="canvas-svg"></svg>
      <div id="nodes-layer"></div>
    </div>

    <!-- Right Inspector -->
    <div class="inspector" id="inspector">
      <div class="inspector-header">
        <span>Inspektur Perangkat</span>
        <button id="btn-delete-device" class="danger" style="display:none; padding: 2px 8px;" onclick="deleteSelectedDevice()">Hapus</button>
      </div>
      <div class="inspector-content" id="inspector-content">
        <p style="color: var(--text-muted); font-size: 0.8rem; text-align: center; margin-top: 40px;">
          Pilih salah satu perangkat di kanvas untuk melihat rincian interface dan konfigurasinya.
        </p>
      </div>
    </div>
  </div>

  <!-- Connect Cable Dialog -->
  <div class="modal-overlay" id="cable-modal">
    <div class="modal-box">
      <div class="modal-title" id="cable-modal-title">Pilih Interface</div>
      <div class="modal-body">
        <label style="font-size: 0.75rem; color: var(--text-muted); display: block; margin-bottom: 4px;">Pilih Port yang Tersedia:</label>
        <select id="interface-select"></select>
      </div>
      <div class="modal-actions">
        <button onclick="closeCableModal()">Batal</button>
        <button class="primary" onclick="confirmCableInterface()">Pilih</button>
      </div>
    </div>
  </div>

  <!-- Hidden Import File Input -->
  <input type="file" id="file-import" accept=".json" style="display: none;" onchange="handleFileImport(event)" />

  <script>
    let topology = { schemaVersion: 4, devices: [], links: [] };
    let selectedDeviceId = null;
    let cableMode = false;
    let cableSource = null; // { deviceId, interfaceId }

    const svg = document.getElementById("canvas-svg");
    const nodesLayer = document.getElementById("nodes-layer");
    const container = document.getElementById("canvas-container");

    const ICONS = {
      router: "⚡",
      switch: "🔀",
      pc: "💻"
    };

    async function loadTopology() {
      try {
        const res = await fetch("/api/topology");
        topology = await res.json();
        render();
      } catch (err) {
        console.error("Gagal memuat topologi:", err);
      }
    }

    function render() {
      // 1. Render Links
      svg.innerHTML = "";
      for (const link of topology.links) {
        const fromDev = topology.devices.find(d => d.id === link.from.device);
        const toDev = topology.devices.find(d => d.id === link.to.device);
        if (!fromDev || !toDev) continue;

        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", fromDev.position.x);
        line.setAttribute("y1", fromDev.position.y);
        line.setAttribute("x2", toDev.position.x);
        line.setAttribute("y2", toDev.position.y);
        line.setAttribute("class", "link-line");
        line.onclick = () => {
          if (confirm(\`Hapus koneksi kabel antara \${fromDev.hostname} (\${link.from.interface}) dan \${toDev.hostname} (\${link.to.interface})?\`)) {
            deleteLink(link.id);
          }
        };

        // Status LEDs
        const led1 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        const led2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        const dx = toDev.position.x - fromDev.position.x;
        const dy = toDev.position.y - fromDev.position.y;
        const len = Math.sqrt(dx*dx + dy*dy) || 1;
        const offset = 32;

        led1.setAttribute("cx", fromDev.position.x + (dx/len)*offset);
        led1.setAttribute("cy", fromDev.position.y + (dy/len)*offset);
        led1.setAttribute("class", \`link-led \${link.status === "up" ? "up" : "down"}\`);

        led2.setAttribute("cx", toDev.position.x - (dx/len)*offset);
        led2.setAttribute("cy", toDev.position.y - (dy/len)*offset);
        led2.setAttribute("class", \`link-led \${link.status === "up" ? "up" : "down"}\`);

        svg.appendChild(line);
        svg.appendChild(led1);
        svg.appendChild(led2);
      }

      // 2. Render Device Nodes
      nodesLayer.innerHTML = "";
      for (const dev of topology.devices) {
        const node = document.createElement("div");
        node.className = \`device-node \${dev.id === selectedDeviceId ? "selected" : ""}\`;
        node.style.left = \`\${dev.position.x}px\`;
        node.style.top = \`\${dev.position.y}px\`;

        node.innerHTML = \`
          <div class="device-icon-box">\${ICONS[dev.type] || "📦"}</div>
          <div class="device-label">\${dev.hostname}</div>
          <div class="device-platform">\${dev.platform}</div>
        \`;

        // Click to select
        node.onclick = (e) => {
          e.stopPropagation();
          handleDeviceClick(dev);
        };

        // Drag handling
        setupDrag(node, dev);
        nodesLayer.appendChild(node);
      }

      updateInspector();
    }

    function setupDrag(element, device) {
      let isDragging = false;
      let startX, startY;
      let initialPos = { ...device.position };

      element.onmousedown = (e) => {
        if (cableMode) return; // Disallow dragging during cable connection
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        initialPos = { ...device.position };

        const onMouseMove = (moveEvent) => {
          if (!isDragging) return;
          const dx = moveEvent.clientX - startX;
          const dy = moveEvent.clientY - startY;
          device.position.x = Math.max(50, initialPos.x + dx);
          device.position.y = Math.max(50, initialPos.y + dy);
          element.style.left = \`\${device.position.x}px\`;
          element.style.top = \`\${device.position.y}px\`;
          // Real-time link redrawing
          renderLinksOnly();
        };

        const onMouseUp = async () => {
          if (!isDragging) return;
          isDragging = false;
          window.removeEventListener("mousemove", onMouseMove);
          window.removeEventListener("mouseup", onMouseUp);

          // Save position to server
          await fetch(\`/api/topology/devices/\${device.id}\`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ position: device.position })
          });
        };

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
      };
    }

    function renderLinksOnly() {
      const lines = svg.querySelectorAll("line");
      const circles = svg.querySelectorAll("circle");
      let idx = 0;
      for (const link of topology.links) {
        const fromDev = topology.devices.find(d => d.id === link.from.device);
        const toDev = topology.devices.find(d => d.id === link.to.device);
        if (!fromDev || !toDev || !lines[idx]) continue;

        lines[idx].setAttribute("x1", fromDev.position.x);
        lines[idx].setAttribute("y1", fromDev.position.y);
        lines[idx].setAttribute("x2", toDev.position.x);
        lines[idx].setAttribute("y2", toDev.position.y);

        const led1 = circles[idx * 2];
        const led2 = circles[idx * 2 + 1];
        if (led1 && led2) {
          const dx = toDev.position.x - fromDev.position.x;
          const dy = toDev.position.y - fromDev.position.y;
          const len = Math.sqrt(dx*dx + dy*dy) || 1;
          const offset = 32;
          led1.setAttribute("cx", fromDev.position.x + (dx/len)*offset);
          led1.setAttribute("cy", fromDev.position.y + (dy/len)*offset);
          led2.setAttribute("cx", toDev.position.x - (dx/len)*offset);
          led2.setAttribute("cy", toDev.position.y - (dy/len)*offset);
        }
        idx++;
      }
    }

    function handleDeviceClick(dev) {
      if (cableMode) {
        handleCableStep(dev);
        return;
      }
      selectedDeviceId = dev.id;
      render();
    }

    async function addDevice(platform) {
      const hostnamePrefix = platform.includes("2960") || platform.includes("9300") ? "SW" : platform.includes("pc") ? "PC" : "R";
      let counter = 1;
      let candidate = \`\${hostnamePrefix}\${counter}\`;
      while (topology.devices.some(d => d.hostname.toLowerCase() === candidate.toLowerCase())) {
        counter++;
        candidate = \`\${hostnamePrefix}\${counter}\`;
      }

      const res = await fetch("/api/topology/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hostname: candidate,
          platform,
          position: { x: 300 + Math.random() * 200, y: 200 + Math.random() * 150 }
        })
      });

      if (res.ok) {
        const newDev = await res.json();
        topology.devices.push(newDev);
        selectedDeviceId = newDev.id;
        render();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal menambah perangkat");
      }
    }

    async function deleteSelectedDevice() {
      if (!selectedDeviceId) return;
      const dev = topology.devices.find(d => d.id === selectedDeviceId);
      if (!confirm(\`Hapus perangkat \${dev.hostname}? Semua kabel yang terhubung akan ikut terhapus.\`)) return;

      const res = await fetch(\`/api/topology/devices/\${selectedDeviceId}\`, { method: "DELETE" });
      if (res.ok) {
        selectedDeviceId = null;
        await loadTopology();
      }
    }

    async function renameSelectedDevice() {
      if (!selectedDeviceId) return;
      const dev = topology.devices.find(d => d.id === selectedDeviceId);
      const newName = prompt("Masukkan hostname baru:", dev.hostname);
      if (!newName || newName.trim() === dev.hostname) return;

      const res = await fetch(\`/api/topology/devices/\${selectedDeviceId}\`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostname: newName.trim() })
      });

      if (res.ok) {
        await loadTopology();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal mengubah nama perangkat");
      }
    }

    // Cable Connection Workflow
    const btnCable = document.getElementById("btn-cable");
    btnCable.onclick = () => {
      cableMode = !cableMode;
      cableSource = null;
      btnCable.className = cableMode ? "active" : "";
      if (cableMode) {
        alert("Mode Kabel Aktif! Klik perangkat pertama untuk memilih port asal.");
      }
    };

    let pendingCableDevice = null;
    function handleCableStep(dev) {
      pendingCableDevice = dev;
      const availableIfs = dev.interfaces.filter(i => !i.connectedLinkId);
      if (availableIfs.length === 0) {
        alert(\`Semua port pada \${dev.hostname} sudah terpakai!\`);
        return;
      }

      const select = document.getElementById("interface-select");
      select.innerHTML = "";
      for (const iface of availableIfs) {
        const opt = document.createElement("option");
        opt.value = iface.id;
        opt.textContent = \`\${iface.name} (\${iface.status})\`;
        select.appendChild(opt);
      }

      document.getElementById("cable-modal-title").textContent = cableSource 
        ? \`Pilih Port Tujuan di \${dev.hostname}\` 
        : \`Pilih Port Asal di \${dev.hostname}\`;
      document.getElementById("cable-modal").style.display = "flex";
    }

    function closeCableModal() {
      document.getElementById("cable-modal").style.display = "none";
      pendingCableDevice = null;
    }

    async function confirmCableInterface() {
      const ifId = document.getElementById("interface-select").value;
      const dev = pendingCableDevice;
      closeCableModal();

      if (!cableSource) {
        cableSource = { deviceId: dev.id, interfaceId: ifId, hostname: dev.hostname };
        alert(\`Port asal: \${dev.hostname} (\${ifId}). Sekarang klik perangkat tujuan!\`);
      } else {
        if (cableSource.deviceId === dev.id) {
          alert("Tidak bisa menghubungkan kabel ke perangkat yang sama!");
          return;
        }

        const res = await fetch("/api/topology/links", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fromDevice: cableSource.deviceId,
            fromInterface: cableSource.interfaceId,
            toDevice: dev.id,
            toInterface: ifId
          })
        });

        if (res.ok) {
          cableSource = null;
          cableMode = false;
          btnCable.className = "";
          await loadTopology();
        } else {
          const err = await res.json();
          alert(err.error || "Gagal membuat koneksi kabel");
        }
      }
    }

    async function deleteLink(linkId) {
      const res = await fetch(\`/api/topology/links/\${linkId}\`, { method: "DELETE" });
      if (res.ok) {
        await loadTopology();
      }
    }

    function updateInspector() {
      const content = document.getElementById("inspector-content");
      const btnDelete = document.getElementById("btn-delete-device");

      if (!selectedDeviceId) {
        btnDelete.style.display = "none";
        content.innerHTML = \`<p style="color: var(--text-muted); font-size: 0.8rem; text-align: center; margin-top: 40px;">Pilih salah satu perangkat di kanvas untuk melihat rincian.</p>\`;
        return;
      }

      const dev = topology.devices.find(d => d.id === selectedDeviceId);
      if (!dev) return;

      btnDelete.style.display = "inline-flex";
      content.innerHTML = \`
        <div class="detail-card">
          <div class="detail-row"><span>Hostname</span><span>\${dev.hostname} <button style="padding: 1px 6px; font-size: 0.7rem; margin-left: 6px;" onclick="renameSelectedDevice()">Ubah</button></span></div>
          <div class="detail-row"><span>Platform</span><span>\${dev.platform}</span></div>
          <div class="detail-row"><span>Tipe</span><span>\${dev.type.toUpperCase()}</span></div>
          <div class="detail-row"><span>Posisi</span><span>(\${Math.round(dev.position.x)}, \${Math.round(dev.position.y)})</span></div>
        </div>

        <h4 style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); margin: 12px 0 6px 0;">Daftar Interface (\${dev.interfaces.length})</h4>
        <div class="interface-list">
          \${dev.interfaces.map(i => \`
            <div class="interface-item">
              <div>
                <span class="if-status-dot \${i.status === "up" ? "up" : "down"}"></span>
                <strong>\${i.name}</strong>
              </div>
              <div style="color: var(--text-muted); font-size: 0.7rem;">
                \${i.connectedLinkId ? "🔌 Terhubung" : "Tersedia"}
              </div>
            </div>
          \`).join("")}
        </div>
      \`;
    }

    // Import / Export
    document.getElementById("btn-export").onclick = () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(topology, null, 2));
      const a = document.createElement("a");
      a.setAttribute("href", dataStr);
      a.setAttribute("download", \`netsimtri-topology-v4.json\`);
      a.click();
    };

    document.getElementById("btn-import").onclick = () => {
      document.getElementById("file-import").click();
    };

    async function handleFileImport(e) {
      const file = e.target.files[0];
      if (!file) return;
      const text = await file.text();
      try {
        const json = JSON.parse(text);
        const res = await fetch("/api/topology/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(json)
        });
        if (res.ok) {
          await loadTopology();
          alert("Topologi berhasil diimpor!");
        } else {
          const err = await res.json();
          alert("Gagal impor: " + err.error);
        }
      } catch (err) {
        alert("Format berkas JSON tidak valid!");
      }
      e.target.value = "";
    }

    document.getElementById("btn-clear").onclick = async () => {
      if (!confirm("Apakah Anda yakin ingin mengosongkan seluruh kanvas?")) return;
      await fetch("/api/topology/clear", { method: "POST" });
      selectedDeviceId = null;
      await loadTopology();
    };

    // Initialize
    loadTopology();
  </script>
</body>
</html>`;
}

// Jalankan server jika berkas ini dieksekusi langsung
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (process.env.NODE_ENV !== "test" && isMain) {
  const server = createServer();
  server.listen(PORT, () => {
    console.log(`NetSimTRI server berjalan di http://localhost:${PORT}`);
  });
}
