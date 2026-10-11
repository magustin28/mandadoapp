import { useEffect, useRef } from "react";

// Cierra un modal/panel con el gesto "atrás" del celular: al abrirse empuja
// un estado al historial y, cuando el usuario vuelve atrás, ejecuta onClose en
// vez de navegar a la pantalla anterior.
export function useBackClose(isOpen, onClose) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;

    // Preservamos el estado de React Router (key/idx/usr) y sumamos el nuestro.
    const baseState = window.history.state;
    window.history.pushState({ ...baseState, backClose: true }, "");

    let closedByBack = false;
    function handlePop() {
      closedByBack = true;
      onCloseRef.current();
    }
    window.addEventListener("popstate", handlePop);

    return () => {
      window.removeEventListener("popstate", handlePop);
      // Si se cerró con el botón (no con atrás), sacamos la entrada que agregamos.
      if (!closedByBack && window.history.state?.backClose) {
        window.history.back();
      }
    };
  }, [isOpen]);
}
