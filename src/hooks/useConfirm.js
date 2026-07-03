import { useState, useCallback } from "react";

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

  return { confirm, ask, handleConfirm, handleCancel };
}
