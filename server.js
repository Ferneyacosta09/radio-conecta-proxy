import express from "express";
import httpProxy from "http-proxy-middleware";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 10000;

// Tu servidor Icecast
const ICECAST_URL = "http://186.29.40.51:8000/stream";

app.use(cors());

// --- Configurar proxy con headers correctos ---
import { createProxyMiddleware } from "http-proxy-middleware";

app.use(
  "/",
  createProxyMiddleware({
    target: ICECAST_URL,
    changeOrigin: true,
    ws: true,
    followRedirects: true,
    headers: {
      "User-Agent": "Mozilla/5.0 (RadioConecta-Proxy)",
      "Connection": "keep-alive",
      "Accept": "*/*",
      "Range": "bytes=0-",
    },
    selfHandleResponse: false,
    onProxyRes(proxyRes, req, res) {
      // Permitir streaming sin buffering
      proxyRes.headers["Access-Control-Allow-Origin"] = "*";
      proxyRes.headers["Content-Type"] = "audio/mpeg";
      proxyRes.headers["Connection"] = "keep-alive";
      res.writeHead(200, proxyRes.headers);
    },
    onError(err, req, res) {
      console.error("❌ Error en proxy:", err.message);
      res.writeHead(502);
      res.end("Proxy error: " + err.message);
    },
  })
);

app.listen(PORT, () => {
  console.log(`🎧 Proxy HTTPS activo en puerto ${PORT}`);
});
