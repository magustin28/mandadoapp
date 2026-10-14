import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";

// --- PWA: mantener la app al día ---
if ("serviceWorker" in navigator) {
  const yaControlada = Boolean(navigator.serviceWorker.controller);

  // Cuando una nueva versión del service worker toma el control, recargamos una vez.
  let recargando = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!yaControlada || recargando) return;
    recargando = true;
    window.location.reload();
  });

  // Al abrir la app, forzamos la búsqueda de actualizaciones.
  window.addEventListener("load", () => {
    navigator.serviceWorker.ready.then((reg) => reg.update()).catch(() => {});
  });
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
