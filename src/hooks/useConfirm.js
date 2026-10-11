import { useState, useCallback } from "react";
import { useBackClose } from "./useBackClose";

export function useConfirm() {
  const [confirm, setConfirm] = useState(null);

  const ask = useCallback((message) => {
    return new Promise((resolve) => {
      setConfirm({ message, resolve });
    });
  }, []);

  function handleConfirm() {
    confirm?.resolve(true);
    setConfirm(null);
  }

  function handleCancel() {
    confirm?.resolve(false);
    setConfirm(null);
  }

  // El gesto "atrás" del celular cierra (cancela) el modal.
  useBackClose(Boolean(confirm), handleCancel);

  return { confirm, ask, handleConfirm, handleCancel };
}
