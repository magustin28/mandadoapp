import { useEffect, useRef } from "react";

// ── Trampa de historial compartida ──────────────────────────────────────────
// Los modales y paneles se cierran con el gesto "atrás" del celular: al abrirse
// se empuja UNA entrada de historial (una sola para todos) y cuando el usuario
// vuelve atrás cerramos el panel de arriba en vez de navegar a la pantalla
// anterior.
//
// El control está acá afuera (y no dentro de cada hook) a propósito: si cada
// panel manejara su propia entrada, cerrar un panel sacaba del historial la
// entrada que pertenecía a otro panel abierto encima — y ese "atrás" fantasma
// cancelaba el modal de arriba (por ejemplo, el de "Cerrar sesión").
const traps = []; // paneles abiertos, en orden de apertura (el último está arriba)
let entradaEmpujada = false; // ¿hay una entrada nuestra en el historial?
let backPropio = false; // el próximo popstate lo provocamos nosotros
let listenerListo = false;

function empujarEntrada() {
  if (entradaEmpujada) return;
  // Preservamos el estado de React Router (key/idx/usr) y sumamos el nuestro.
  window.history.pushState({ ...window.history.state, backClose: true }, "");
  entradaEmpujada = true;
}

function sacarEntrada() {
  if (!entradaEmpujada) return;
  entradaEmpujada = false;
  // Solo la sacamos si la entrada actual sigue siendo la nuestra: si en el
  // medio hubo una navegación (por ej. saltar a /login), no tocamos nada.
  if (window.history.state?.backClose) {
    backPropio = true;
    window.history.back();
  }
}

function handlePop() {
  if (backPropio) {
    // Es el back() que disparamos nosotros al cerrar un panel, no el usuario.
    backPropio = false;
    return;
  }

  // Gesto del usuario: el navegador ya consumió la entrada que habíamos empujado.
  entradaEmpujada = false;

  const arriba = traps[traps.length - 1];
  if (arriba) arriba.onClose();

  // Si quedan paneles abiertos, necesitamos otra entrada para el próximo atrás.
  setTimeout(() => {
    if (traps.length) empujarEntrada();
  }, 0);
}

export function useBackClose(isOpen, onClose) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;

    if (!listenerListo) {
      listenerListo = true;
      window.addEventListener("popstate", handlePop);
    }

    const trap = { onClose: () => onCloseRef.current() };
    traps.push(trap);
    empujarEntrada();

    return () => {
      const i = traps.indexOf(trap);
      if (i !== -1) traps.splice(i, 1);
      // Sacamos la entrada solo si ya no queda ningún panel abierto.
      if (!traps.length) sacarEntrada();
    };
  }, [isOpen]);
}
