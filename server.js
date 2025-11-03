import express from "express";

const app = express();
const PORT = process.env.PORT || 10000;
const RADIO_URL = "http://186.29.40.51:8000/stream";

app.set('trust proxy', true);
app.disable('x-powered-by');

app.get("/", async (req, res) => {
  console.log("🎧 Nueva conexión al proxy");

  try {
    const response = await fetch(RADIO_URL, {
      headers: {
        "Icy-MetaData": "1",
        "User-Agent": "RadioConectaProxy/2.0"
      }
    });

    res.writeHead(200, {
      "Content-Type": response.headers.get("content-type") || "audio/mpeg",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
      "Connection": "keep-alive",
      "Accept-Ranges": "none",
      "Transfer-Encoding": "chunked"
    });

    response.body.on("error", (err) => {
      console.error("❌ Error en stream de origen:", err);
      res.end();
    });

    response.body.pipe(res);

  } catch (err) {
    console.error("❌ Error al conectar con la emisora:", err);
    if (!res.headersSent) res.status(500).send("Error al conectar con la emisora.");
  }
});

app.listen(PORT, () => {
  console.log(`🎧 Proxy activo en Render (puerto ${PORT})`);
});
