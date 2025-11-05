import express from "express";
import http from "http";

const app = express();
const PORT = process.env.PORT || 10000;
const RADIO_URL = "http://186.29.40.51:8000/stream";

app.get("/", (req, res) => {
  console.log("🎧 Nueva conexión al proxy...");

  // ✅ Soporte básico para Range requests del navegador
  const range = req.headers.range || "bytes=0-";

  res.writeHead(200, {
    "Content-Type": "audio/mpeg",
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
    "Access-Control-Allow-Origin": "*",
    "Accept-Ranges": "bytes",
    "Transfer-Encoding": "chunked",
    "Connection": "keep-alive",
  });

  const options = {
    headers: {
      "Icy-MetaData": "1", // para compatibilidad con servidores Icecast
      "Range": range,
      "User-Agent": "RadioConectaProxy",
    },
  };

  // 🔁 Petición directa al servidor de la emisora
  const radioReq = http.get(RADIO_URL, options, (radioRes) => {
    if (radioRes.statusCode !== 200 && radioRes.statusCode !== 206) {
      console.error("⚠️ Código inesperado del stream:", radioRes.statusCode);
      res.end();
      return;
    }

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

  radioReq.on("error", (err) => {
    console.error("❌ Error al conectar con la emisora:", err.message);
    if (!res.headersSent) res.status(502).end("Error al conectar con la emisora.");
  });

  req.on("close", () => {
    console.log("🔌 Cliente desconectado");
    radioReq.destroy();
    res.end();
  });
});

app.listen(PORT, () => {
  console.log(`✅ Proxy activo en puerto ${PORT}`);
});
