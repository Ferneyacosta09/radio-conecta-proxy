import express from "express";
import { Readable } from "stream";

const app = express();
const PORT = process.env.PORT || 10000;
const RADIO_URL = "http://186.29.40.51:8000/stream";

app.set("trust proxy", true);
app.disable("x-powered-by");

app.get("/", async (req, res) => {
  console.log("🎧 Nueva conexión al proxy");

  try {
    const response = await fetch(RADIO_URL, {
      headers: {
        "Icy-MetaData": "1",
        "User-Agent": "RadioConectaProxy/3.0"
      }
    });

    // Validar si el stream está bien
    if (!response.ok || !response.body) {
      throw new Error(`Stream inválido: ${response.status} ${response.statusText}`);
    }

    // Convertir el ReadableStream web en Readable Node.js
    const nodeStream = Readable.fromWeb(response.body);

    res.writeHead(200, {
      "Content-Type": response.headers.get("content-type") || "audio/mpeg",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
      "Connection": "keep-alive",
      "Transfer-Encoding": "chunked"
    });

    nodeStream.pipe(res);

    nodeStream.on("error", (err) => {
      console.error("❌ Error en el stream de origen:", err);
      res.end();
    });

  } catch (err) {
    console.error("❌ Error al conectar con la emisora:", err);
    if (!res.headersSent)
      res.status(500).send("Error al conectar con la emisora.");
  }
});

app.listen(PORT, () => {
  console.log(`🎧 Proxy activo en Render (puerto ${PORT})`);
});
