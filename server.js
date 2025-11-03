import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 10000;

const RADIO_URL = "http://186.29.40.51:8000/stream";

app.get("/", async (req, res) => {
  try {
    const response = await fetch(RADIO_URL, {
      headers: {
        "Icy-MetaData": "1",
        "User-Agent": "RadioConectaProxy/1.0"
      }
    });

    // Copiamos las cabeceras necesarias
    res.setHeader("Content-Type", response.headers.get("content-type") || "audio/mpeg");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Pipea el stream binario directamente
    response.body.pipe(res);
  } catch (err) {
    console.error("❌ Error al conectar con la emisora:", err);
    res.status(500).send("Error al conectar con la emisora.");
  }
});

app.listen(PORT, () => {
  console.log(`🎧 Proxy activo en puerto ${PORT}`);
});
