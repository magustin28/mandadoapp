// Vuelve atrás si hay historial dentro de la app; si no (ej. abrir directo por
// URL), va a un fallback para no salir de la aplicación.
export function goBack(navigate, fallback = "/") {
  const idx = window.history.state?.idx;
  if (typeof idx === "number" && idx > 0) {
    navigate(-1);
  } else {
    navigate(fallback);
  }
}
