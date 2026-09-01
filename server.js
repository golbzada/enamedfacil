const http = require("http");
const fs = require("fs");
const path = require("path");

const DEFAULT_PORT = parseInt(process.env.PORT || "3000", 10);
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  ".html": "text/html; charset=UTF-8",
  ".css": "text/css; charset=UTF-8",
  ".js": "application/javascript; charset=UTF-8",
  ".mjs": "application/javascript; charset=UTF-8",
  ".json": "application/json; charset=UTF-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
};

function createServer() {
  return http.createServer((req, res) => {
    const parsedUrl = new URL(req.url, "http://localhost:3000");
    let pathname = decodeURIComponent(parsedUrl.pathname);

    if (pathname === "/") {
      pathname = "/index.html";
    }

    let filePath = path.join(PUBLIC_DIR, pathname);

    if (!filePath.startsWith(PUBLIC_DIR)) {
      res.writeHead(403, { "Content-Type": "text/plain; charset=UTF-8" });
      res.end("403 Proibido");
      return;
    }

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      const indexPath = path.join(PUBLIC_DIR, "index.html");
      if (fs.existsSync(indexPath) && !pathname.includes(".")) {
        filePath = indexPath;
      } else {
        res.writeHead(404, { "Content-Type": "text/plain; charset=UTF-8" });
        res.end("404 Nao Encontrado");
        return;
      }
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain; charset=UTF-8" });
        res.end("500 Erro Interno");
        return;
      }

      res.writeHead(200, {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache",
      });
      res.end(data);
    });
  });
}

function startServer(port) {
  const server = createServer();
  server.once("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.log(
        "Porta " + port + " em uso. Tentando porta " + (port + 1) + "...",
      );
      startServer(port + 1);
    } else {
      console.error("Erro ao iniciar servidor:", err);
    }
  });

  server.once("listening", () => {
    const actualPort = server.address().port;
    console.log("====================================================");
    console.log("  MAPAS ENAMED 2026 - Servidor Local Ativo!");
    console.log("  Abra no seu navegador:");
    console.log("    👉 http://localhost:" + actualPort);
    console.log("    👉 http://127.0.0.1:" + actualPort);
    console.log("====================================================");
  });

  server.listen(port);
}

startServer(DEFAULT_PORT);
