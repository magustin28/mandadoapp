import { IconBuildingStore, IconApple, IconBread, IconFirstAidKit, IconBasket } from "@tabler/icons-react";

// Definición única de las categorías: clave, etiqueta, color e ícono.
// Se reutiliza en Home, Categorías, Mis items, ListForm y ListDetail.
export const CATEGORIAS = [
  { key: "supermercado", label: "Supermercado", color: "#4A6741", Icon: IconBuildingStore },
  { key: "verduleria", label: "Verdulería", color: "#3B7A47", Icon: IconApple },
  { key: "dietetica", label: "Dietética", color: "#6E8B3D", Icon: IconBread },
  { key: "farmacia", label: "Farmacia", color: "#4A6FA5", Icon: IconFirstAidKit },
  { key: "otros", label: "Otros", color: "#B87333", Icon: IconBasket },
];

export const CATEGORY_LABELS = CATEGORIAS.reduce((acc, { key, label }) => {
  acc[key] = label;
  return acc;
}, {});

export function getCategoria(key) {
  return CATEGORIAS.find((c) => c.key === key);
}
