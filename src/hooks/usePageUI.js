import { useCallback } from "react";
import { useToast } from "./useToast";
import { useConfirm } from "./useConfirm";

// Lo que necesita casi toda página: avisos (toasts), el modal de confirmación y dos atajos para el
// patrón que más se repetía: "preguntar antes de borrar" y "mostrar el error si falla".
// Antes cada página repetía los dos hooks y las dos líneas de JSX del final.
export function usePageUI() {
  const { toasts, success, error, info } = useToast();
  const { confirm, ask, handleConfirm, handleCancel } = useConfirm();

  // Corre la acción y muestra el toast de éxito; si falla, loguea y avisa.
  const ejecutar = useCallback(
    async (accion, { exito, mensajeError = "No se pudo completar la acción. Intentá de nuevo.", contextoError = "Error:" } = {}) => {
      try {
        await accion();
        if (exito) success(exito);
        return true;
      } catch (err) {
        console.error(contextoError, err);
        error(mensajeError);
        return false;
      }
    },
    [success, error],
  );

  // Pregunta y, solo si confirma, ejecuta. Devuelve si llegó a ejecutarse, para poder seguir
  // (navegar, limpiar estado, cerrar un panel...).
  const confirmarYHacer = useCallback(
    async ({ mensaje, confirmLabel, ...resto }) => {
      const ok = await ask(mensaje, confirmLabel);
      if (!ok) return false;
      return ejecutar(resto.accion, resto);
    },
    [ask, ejecutar],
  );

  return { toasts, success, error, info, confirm, ask, handleConfirm, handleCancel, ejecutar, confirmarYHacer };
}
