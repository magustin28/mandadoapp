import { useState, useEffect, useCallback } from "react";
import {
  getPreloadedItems,
  savePreloadedItem,
  updatePreloadedItem,
  deletePreloadedItem,
  getStores,
  saveStore,
  deleteStore,
  addCollaborator,
  removeCollaborator,
  getCollaboratorsByList,
  getPriceHistory,
} from "../services/storage";
import { supabase } from "../lib/supabaseClient";

// Hooks puntuales por página (una categoría, una lista). Viven acá y no en
// useLists.jsx para que ese archivo exporte solo el componente ListsProvider
// (requisito de Fast Refresh) y no mezcle el estado global de listas.
// No tienen el problema de refetch entre navegaciones que resolvió el Provider.

export function usePreloadedItems(category) {
  const [items, setItems] = useState([]);

  const refresh = useCallback(async () => {
    if (!category) return;
    try {
      const data = await getPreloadedItems(category);
      setItems(data);
    } catch (err) {
      console.error("Error cargando items precargables:", err);
    }
  }, [category]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function addItem(item) {
    const newItem = await savePreloadedItem(category, item);
    await refresh();
    return newItem;
  }

  async function editItem(id, data) {
    await updatePreloadedItem(category, id, data);
    await refresh();
  }

  async function removeItem(id) {
    await deletePreloadedItem(category, id);
    await refresh();
  }

  return { items, addItem, editItem, removeItem };
}

export function useStores(category) {
  const [stores, setStores] = useState([]);

  const refresh = useCallback(async () => {
    if (!category) return;
    try {
      const data = await getStores(category);
      setStores(data);
    } catch (err) {
      console.error("Error cargando comercios:", err);
    }
  }, [category]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function addStore(store) {
    const newStore = await saveStore(category, store);
    await refresh();
    return newStore;
  }

  async function removeStore(id) {
    await deleteStore(category, id);
    await refresh();
  }

  return { stores, addStore, removeStore };
}

export function useCollaborators(listId) {
  const [collaborators, setCollaborators] = useState([]);

  const refresh = useCallback(async () => {
    if (!listId) return;
    try {
      const data = await getCollaboratorsByList(listId);
      setCollaborators(data);
    } catch (err) {
      console.error("Error cargando colaboradores:", err);
    }
  }, [listId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!listId) return;

    const channel = supabase
      .channel(`collaborators-${listId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "collaborators", filter: `list_id=eq.${listId}` }, refresh)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [listId, refresh]);

  async function add(email) {
    const result = await addCollaborator(listId, email);
    if (result.collaborator) await refresh();
    return result;
  }

  async function remove(userId) {
    await removeCollaborator(listId, userId);
    await refresh();
  }

  return { collaborators, add, remove };
}

export function usePriceHistory() {
  const [history, setHistory] = useState([]);

  const refresh = useCallback(async () => {
    try {
      const data = await getPriceHistory();
      setHistory(data);
    } catch (err) {
      console.error("Error cargando historial de precios:", err);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function getByName(name) {
    if (!name) return null;
    const matches = history.filter((h) => h.item_name.toLowerCase() === name.toLowerCase());
    if (!matches.length) return null;
    return matches.reduce((latest, cur) => (new Date(cur.date) > new Date(latest.date) ? cur : latest));
  }

  return { history, getByName, refresh };
}
