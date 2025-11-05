(function () {
  if (window.RadioPlayer && window.RadioPlayer.audio) {
    console.log("🎵 RadioPlayer ya inicializado");
    return;
  }

  console.log("🎵 Inicializando RadioPlayer...");

  const STREAM_HTTP = "http://186.29.40.51:8000/stream";
  const STREAM_HTTPS = "https://radio-conecta-proxy-1.onrender.com";
  const STREAM_URL = window.location.protocol === "https:" ? STREAM_HTTPS : STREAM_HTTP;

  const audio = new Audio(STREAM_URL);
  audio.preload = "none";
  audio.crossOrigin = "anonymous";
  audio.playsInline = true;
  audio.loop = false;

  let userPaused = false;
  let reconnectTimer = null;

  // --- Mantener volumen persistente ---
  try {
    const savedVol = localStorage.getItem("rc_volume");
    if (savedVol !== null) audio.volume = parseFloat(savedVol);
  } catch (_) {}

  audio.addEventListener("volumechange", () => {
    try { localStorage.setItem("rc_volume", String(audio.volume)); } catch (_) {}
    const slider = document.querySelector("#sticky-player input[type='range']");
    if (slider) slider.value = String(Math.round(audio.volume * 100));
  });

  // --- Control de reconexión ---
  function reconnect() {
    if (userPaused) return; // no reconectar si el usuario pausó
    console.log("🔄 Reintentando conexión de stream...");
    clearTimeout(reconnectTimer);
    audio.src = STREAM_URL + "?nocache=" + Date.now();
    audio.load();
    audio.play().catch(() => {
      reconnectTimer = setTimeout(reconnect, 10000);
    });
  }

  ["error", "stalled", "ended"].forEach(evt => {
    audio.addEventListener(evt, () => {
      console.warn(`⚠️ Evento ${evt}, reconectando...`);
      reconnect();
    });
  });

  // --- UI Sticky Player ---
  function ensureStickyPlayer() {
    if (document.getElementById("sticky-player")) return;

    const bar = document.createElement("div");
    bar.id = "sticky-player";
    bar.className = "sticky-player";
    bar.innerHTML = `
      <div class="sp-container">
        <div class="sp-left">
          <img src="img/logo/logo.png" alt="Radio Conecta" class="sp-logo" onerror="this.style.display='none'">
          <div class="sp-info">
            <div class="sp-title">Radio Conecta</div>
            <div class="sp-subtitle">En vivo ahora</div>
          </div>
        </div>
        <div class="sp-center">
          <button class="sp-btn sp-toggle" aria-label="Reproducir/Pausar">
            <svg class="sp-icon sp-play" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3l14 9-14 9V3z"/>
            </svg>
            <svg class="sp-icon sp-pause" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 4h4v16H6zM14 4h4v16h-4z"/>
            </svg>
          </button>
        </div>
        <div class="sp-right">
          <div class="sp-volume">
            <input class="sp-vol-slider" type="range" min="0" max="100" step="1" value="${Math.round(audio.volume * 100)}" />
          </div>
          <div class="sp-live-badge">
            <span class="sp-live-dot"></span> EN VIVO
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(bar);

    const toggle = bar.querySelector(".sp-toggle");
    const vol = bar.querySelector(".sp-vol-slider");
    const playIcon = bar.querySelector(".sp-play");
    const pauseIcon = bar.querySelector(".sp-pause");

    function syncButton() {
      if (audio.paused) {
        playIcon.style.display = "block";
        pauseIcon.style.display = "none";
      } else {
        playIcon.style.display = "none";
        pauseIcon.style.display = "block";
      }
    }

    toggle.addEventListener("click", async () => {
      try {
        if (audio.paused) {
          userPaused = false;
          await audio.play();
        } else {
          userPaused = true;
          audio.pause();
        }
        syncButton();
      } catch (err) {
        console.warn("Play/Pause error:", err);
      }
    });

    vol.addEventListener("input", () => {
      audio.volume = parseInt(vol.value, 10) / 100;
    });

    audio.addEventListener("play", syncButton);
    audio.addEventListener("pause", syncButton);
    syncButton();
  }

  // --- Media Session API ---
  if ("mediaSession" in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: "Radio Conecta",
      artist: "En vivo",
      artwork: [
        { src: "img/logo/logo.png", sizes: "256x256", type: "image/png" }
      ]
    });
  }

  window.RadioPlayer = {
    audio,
    play: () => audio.play(),
    pause: () => audio.pause(),
    toggle: () => (audio.paused ? audio.play() : audio.pause()),
    setVolume: (v) => { audio.volume = Math.max(0, Math.min(1, v)); },
    getStreamUrl: () => STREAM_URL
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ensureStickyPlayer);
  } else {
    ensureStickyPlayer();
  }
})();
