import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 10000;

// Habilitar CORS
app.use(cors());

// Proxy hacia tu stream Icecast
app.use(
  "/",
  createProxyMiddleware({
    target: "http://186.29.40.51:8000/stream", // tu Icecast real
    changeOrigin: true,
    ws: true,
    secure: false, // Importante: Render usa HTTPS, Icecast HTTP
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept": "*/*",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
    onError: (err, req, res) => {
      console.error("Error en proxy:", err);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Error conectando con la emisora.");
    },
  })
);

app.listen(PORT, () => {
  console.log(`🎧 Radio proxy activo en puerto ${PORT}`);
});
