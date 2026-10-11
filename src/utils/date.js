// Formato de fechas centralizado (es-AR). Relativo para lo reciente y
// fecha absoluta ("4 jul" / "4 jul 2026") cuando se pasa el umbral.

const MESES_CORTOS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

// Hasta cuántos días mostramos "Hace X días" (después, fecha absoluta).
const DIAS_RELATIVOS = 7;

const MS_POR_DIA = 24 * 60 * 60 * 1000;

function inicioDelDia(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// "4 jul", y "4 jul 2026" si no es el año actual.
export function formatFechaAbsoluta(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const mes = MESES_CORTOS[date.getMonth()];
  const mismoAnio = date.getFullYear() === new Date().getFullYear();
  return mismoAnio ? `${date.getDate()} ${mes}` : `${date.getDate()} ${mes} ${date.getFullYear()}`;
}

// "hoy" / "ayer" / "hace X días" (hasta DIAS_RELATIVOS) o la fecha absoluta.
export function formatFecha(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const dias = Math.round((inicioDelDia(new Date()) - inicioDelDia(date)) / MS_POR_DIA);

  if (dias <= 0) return "hoy";
  if (dias === 1) return "ayer";
  if (dias < DIAS_RELATIVOS) return `hace ${dias} días`;
  return formatFechaAbsoluta(value);
}
