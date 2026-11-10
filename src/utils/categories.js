import { IconBuildingStore, IconApple, IconBread, IconFirstAidKit, IconBasket } from "@tabler/icons-react";

// Definición única de las categorías: clave, etiqueta e ícono.
// El color de cada una vive en styles/components.css (clases .cat-color--<key>), que es lo que
// toman el puntito de la lista, el cuadradito del Home y el ícono de la pestaña de ListForm.
// Se reutiliza en Home, Categorías, Mis items, ListForm y ListDetail.
export const CATEGORIAS = [
  { key: "supermercado", label: "Supermercado", Icon: IconBuildingStore },
  { key: "verduleria", label: "Verdulería", Icon: IconApple },
  { key: "dietetica", label: "Dietética", Icon: IconBread },
  { key: "farmacia", label: "Farmacia", Icon: IconFirstAidKit },
  { key: "otros", label: "Otros", Icon: IconBasket },
];

export const CATEGORY_LABELS = CATEGORIAS.reduce((acc, { key, label }) => {
  acc[key] = label;
  return acc;
}, {});

export function getCategoria(key) {
  return CATEGORIAS.find((c) => c.key === key);
}
