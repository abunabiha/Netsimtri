import http from "node:http";

export const PORT = Number(process.env.PORT) || 8080;

export function createServer(): http.Server {
  return http.createServer((req, res) => {
    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);

    if (url.pathname === "/health" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok" }));
      return;
    }

    if (url.pathname === "/" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NetSimTRI</title>
  <style>
    body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f4f6f8; color: #333; }
    h1 { color: #0b5cab; }
  </style>
</head>
<body>
  <h1>NetSimTRI Simulator</h1>
  <p>Simulator jaringan berbasis Docker untuk pembelajaran CCNA dan CCNP di Politeknik Negeri Lampung.</p>
</body>
</html>`);
      return;
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not Found" }));
  });
}

// Jalankan server jika berkas ini dieksekusi langsung
if (process.env.NODE_ENV !== "test" && import.meta.url === `file://${process.argv[1]}`) {
  const server = createServer();
  server.listen(PORT, () => {
    console.log(`NetSimTRI server berjalan di port ${PORT}`);
  });
}
