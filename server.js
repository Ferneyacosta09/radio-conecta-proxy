import express from "express";
import http from "http";

const app = express();
const PORT = process.env.PORT || 10000;

// URL original del stream
const RADIO_URL = "http://186.29.40.51:8000/stream";

app.get("/", (req, res) => {
  console.log("🎧 Nueva conexión al proxy...");

  // Cabeceras para transmisión continua
  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Transfer-Encoding", "chunked");

  // Petición al servidor original
  const radioReq = http.get(RADIO_URL, (radioRes) => {
    if (radioRes.statusCode !== 200) {
      console.error("⚠️ Stream no disponible, código:", radioRes.statusCode);
      res.status(radioRes.statusCode).end();
      return;
    }

    // Transmitir datos del flujo directamente
    radioRes.on("data", (chunk) => res.write(chunk));
    radioRes.on("end", () => {
      console.log("🔚 Fin del flujo remoto");
      res.end();
    });
    radioRes.on("error", (err) => {
      console.error("❌ Error en flujo remoto:", err.message);
      res.end();
    });
  });

  // Manejo de errores
  radioReq.on("error", (err) => {
    console.error("❌ Error al conectar con la emisora:", err.message);
    if (!res.headersSent) {
      res.writeHead(502, { "Content-Type": "text/plain" });
      res.end("Error al conectar con la emisora.");
    }
  });

  // Cerrar cuando el cliente se desconecta
  req.on("close", () => {
    console.log("🔌 Cliente desconectado, cerrando stream...");
    radioReq.destroy();
    res.end();
  });
});

app.listen(PORT, () => {
  console.log(`✅ Proxy activo y optimizado en puerto ${PORT}`);
});
