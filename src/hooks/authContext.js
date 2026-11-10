import { createContext, useContext } from "react";

// El contexto (y su hook de acceso) viven en su propio archivo a propósito:
// si estuvieran declarados en el mismo módulo que AuthProvider, una recarga en
// caliente (HMR) durante el desarrollo puede dejar dos copias del módulo en
// memoria — cada una con su propio contexto — y `useAuth()` explotaría con
// "debe usarse dentro de <AuthProvider>" aunque el Provider esté montado.
export const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  }
  return ctx;
}
