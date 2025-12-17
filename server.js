import express from "express";
import http from "http";

const app = express();
const PORT = process.env.PORT || 8080;

/**
 * SOLO ESTA LINEA SE CAMBIA SI CAMBIA LA IP
 */
const ICECAST_HOST = "200.119.37.140";
const ICECAST_PORT = 8000;
const ICECAST_MOUNT = "/stream";

app.get("/", (req, res) => {
  console.log("🎧 Oyente conectado");

  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const icecastReq = http.get({
    hostname: ICECAST_HOST,
    port: ICECAST_PORT,
    path: ICECAST_MOUNT,
    headers: {
      "User-Agent": "Fly-Proxy"
    }
  }, (icecastRes) => {
    icecastRes.pipe(res);
  });

  icecastReq.on("error", (err) => {
    console.error("❌ Error Icecast:", err.message);
    if (!res.headersSent) {
      res.status(502).end("Icecast no disponible");
    }
  });

  req.on("close", () => {
    console.log("🔌 Oyente desconectado");
    icecastReq.destroy();
  });
});

app.listen(PORT, () => {
  console.log(`✅ Proxy activo en puerto ${PORT}`);
});

