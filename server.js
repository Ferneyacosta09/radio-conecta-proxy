import express from "express";
import http from "http";

const app = express();
const PORT = process.env.PORT || 10000;

// URL del stream original
const RADIO_URL = "http://186.29.40.51:8000/stream";

app.get("/", (req, res) => {
  console.log("🎧 Nueva conexión de cliente al proxy...");

  // Configurar cabeceras de respuesta
  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*"); // 🔥 Importante para tu web

  // Hacer la petición HTTP al servidor de la emisora
  const radioReq = http.get(RADIO_URL, (radioRes) => {
    radioRes.pipe(res); // retransmitir flujo binario directamente
  });

  radioReq.on("error", (err) => {
    console.error("❌ Error al conectar con la emisora:", err.message);
    res.status(500).send("Error al conectar con la emisora.");
  });

  req.on("close", () => {
    console.log("🔌 Cliente desconectado");
    radioReq.destroy();
  });
});

app.listen(PORT, () => {
  console.log(`✅ Proxy activo en puerto ${PORT}`);
});
