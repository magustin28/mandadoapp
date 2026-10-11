// Opciones y formateo de los ítems (cantidad y unidad).

// Cantidades permitidas en el formulario.
export const CANTIDADES = [
  { value: 0.25, label: "1/4" },
  { value: 0.5, label: "1/2" },
  ...Array.from({ length: 10 }, (_, i) => ({ value: i + 1, label: String(i + 1) })),
  { value: 100, label: "100" },
  { value: 200, label: "200" },
  { value: 300, label: "300" },
];

// Unidades permitidas.
export const UNIDADES = ["unid.", "lts.", "kg.", "grs."];

// Muestra 0.25 / 0.5 como fracciones.
export function formatCantidad(quantity) {
  if (quantity === null || quantity === undefined || quantity === "") return "";
  const n = Number(quantity);
  if (n === 0.25) return "1/4";
  if (n === 0.5) return "1/2";
  return String(n);
}

// Normaliza unidades viejas a las permitidas (u a unid., litros a lts, etc.).
export function normalizarUnidad(unit) {
  if (!unit) return null;
  const mapa = {
    u: "unid.",
    unid: "unid.",
    unidad: "unid.",
    unidades: "unid.",
    l: "lts.",
    lts: "lts.",
    litro: "lts.",
    litros: "lts.",
    kg: "kg.",
    kilo: "kg.",
    kilos: "kg.",
    g: "grs.",
    gr: "grs.",
    grs: "grs.",
    gramo: "grs.",
    gramos: "grs.",
  };
  return mapa[String(unit).trim().toLowerCase()] || unit;
}

// "1/4 kg" / "2 lts" / "" si no hay nada.
export function formatearCantidadUnidad(item) {
  const cant = formatCantidad(item.quantity);
  if (!cant) return "";   // sin cantidad no mostramos nada (aunque haya unidad)
  const unidad = normalizarUnidad(item.unit);
  return unidad ? `${cant} ${unidad}` : cant;
}
