import express from "express";
import http from "http";

const app = express();
const PORT = process.env.PORT || 10000;
const RADIO_URL = "http://186.29.40.51:8000/stream";

app.get("/", (req, res) => {
  console.log("🎧 Nueva conexión al proxy...");

  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Connection", "close");
  res.setHeader("Access-Control-Allow-Origin", "*");

  const radioReq = http.get(RADIO_URL, (radioRes) => {
    radioRes.pipe(res);
  });

  radioReq.on("error", (err) => {
    console.error("❌ Error de conexión:", err.message);
    if (!res.headersSent) res.status(502).end("Error al conectar con la emisora.");
  });

  // 👉 Si el cliente cierra, cortamos el stream para evitar conexiones huérfanas
  req.on("close", () => {
    console.log("🔌 Cliente desconectado");
    radioReq.destroy();
    res.end();
  });
});

app.listen(PORT, () => {
  console.log(`✅ Proxy activo en puerto ${PORT}`);
});
