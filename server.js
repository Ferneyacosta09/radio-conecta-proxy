import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();

const PORT = process.env.PORT || 10000;
const RADIO_URL = "http://186.29.40.51:8000/stream";

app.use(
  "/",
  createProxyMiddleware({
    target: RADIO_URL,
    changeOrigin: true,
    ws: false,
    onProxyRes: (proxyRes, req, res) => {
      // Corrige encabezados ICY → HTTP
      if (proxyRes.statusMessage && proxyRes.statusMessage.startsWith("ICY")) {
        proxyRes.statusMessage = "OK";
      }

      // Forzamos encabezados para mantener streaming
      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("Cache-Control", "no-cache");
    },
    onError: (err, req, res) => {
      console.error("❌ Error en el proxy:", err.message);
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "text/plain" });
      }
      res.end("Error en el proxy de radio.");
    },
  })
);

app.listen(PORT, () => {
  console.log(`🎧 Proxy HTTPS activo en puerto ${PORT}`);
});
