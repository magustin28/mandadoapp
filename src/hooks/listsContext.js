import { createContext, useContext } from "react";

// El contexto (y su hook de acceso) viven en su propio archivo a propósito.
// Si el contexto estuviera declarado en el mismo módulo que las páginas
// consumidoras o que el Provider, una recarga en caliente (HMR) durante el
// desarrollo puede dejar dos copias del módulo en memoria — cada una con su
// propio contexto — y `useLists()` explotaría con "debe usarse dentro de
// <ListsProvider>" aunque el Provider esté montado. Al vivir acá, la
// identidad del contexto es siempre la misma.
export const ListsContext = createContext(null);

export function useLists() {
  const ctx = useContext(ListsContext);
  if (!ctx) {
    throw new Error("useLists debe usarse dentro de <ListsProvider>");
  }
  return ctx;
}
