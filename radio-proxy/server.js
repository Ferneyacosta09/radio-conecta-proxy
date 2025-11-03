import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();

// Configura tu stream Icecast
const targetStream = "http://186.29.40.51:8000/stream";

// Proxy del stream
app.use("/", createProxyMiddleware({
  target: targetStream,
  changeOrigin: true,
  ws: true,
  headers: {
    "Access-Control-Allow-Origin": "*"
  },
  onProxyRes(proxyRes) {
    proxyRes.headers["Access-Control-Allow-Origin"] = "*";
  }
}));

// Puerto Render
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🎧 Radio proxy activo en puerto ${PORT}`);
});
