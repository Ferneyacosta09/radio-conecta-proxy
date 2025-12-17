import express from "express";
import http from "http";

const app = express();
const PORT = process.env.PORT || 8080;

// USAMOS STREAM DIRECTO
const RADIO_HOST = "200.119.37.140";
const RADIO_PORT = 8000;
const RADIO_PATH = "/stream";

app.get("/", (req, res) => {
  console.log("🎧 Cliente conectado al proxy");

  res.writeHead(200, {
    "Content-Type": "audio/mpeg",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });

  const radioReq = http.request(
    {
      host: RADIO_HOST,
      port: RADIO_PORT,
      path: RADIO_PATH,
      method: "GET",
      headers: {
        "User-Agent": "Fly-Proxy",
        "Accept": "*/*",
      },
    },
    (radioRes) => {
      radioRes.pipe(res);
    }
  );

  radioReq.on("error", (err) => {
    console.error("❌ Error Icecast:", err.message);
    res.end();
  });

  radioReq.end();

  req.on("close", () => {
    console.log("🔌 Cliente desconectado");
    radioReq.destroy();
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Proxy activo en puerto ${PORT}`);
});
