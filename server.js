import express from "express";
import http from "http";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());

// Proxy manual hacia el stream Icecast
app.get("/", (req, res) => {
  const options = {
    host: "186.29.40.51",
    port: 8000,
    path: "/stream",
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept": "*/*",
      "Icy-MetaData": "1", // Para compatibilidad con Icecast
    },
  };

  const proxy = http.get(options, (stream) => {
    // Pasamos los encabezados del stream al cliente
    res.writeHead(200, {
      "Content-Type": stream.headers["content-type"] || "audio/mpeg",
      "Connection": "keep-alive",
      "Transfer-Encoding": "chunked",
      "Accept-Ranges": "bytes",
    });

    stream.pipe(res);
  });

  proxy.on("error", (err) => {
    console.error("Error conectando con el stream:", err.message);
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "text/plain" });
    }
    res.end("Error al conectar con la emisora.");
  });
});

app.listen(PORT, () => {
  console.log(`🎧 Proxy de radio activo en puerto ${PORT}`);
});
