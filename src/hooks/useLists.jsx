import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  getLists,
  getListById,
  saveList,
  updateList,
  deleteList,
  copyList,
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
import { useAuth } from "./useAuth";

const ListsContext = createContext(null);

// El fetch de listas se hace UNA sola vez acá y se comparte entre todas las
// páginas (Home, Categories, ListForm, ListDetail...) — antes cada página
// tenía su propia instancia de useLists() y volvía a pedir todo a Supabase
// cada vez que navegabas entre ellas.
export function ListsProvider({ children }) {
  const { user } = useAuth();
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setLists([]);
      setLoading(false);
      return;
    }
    try {
      const data = await getLists();
      setLists(data);
    } catch (err) {
      console.error("Error cargando listas:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("lists-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "lists" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "list_items" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "collaborators" }, refresh)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user, refresh]);

  async function addList(list) {
    const newList = await saveList(list);
    await refresh();
    return newList;
  }

  async function editList(id, data) {
    await updateList(id, data);
    await refresh();
  }

  async function removeList(id) {
    await deleteList(id);
    await refresh();
  }

  function getById(id) {
    return lists.find((l) => l.id === id);
  }

  async function fetchById(id) {
    return getListById(id);
  }

  function getByCategory(category) {
    return lists.filter((l) => l.category === category);
  }

  async function duplicateList(id) {
    const copy = await copyList(id);
    await refresh();
    return copy;
  }

  const value = {
    lists,
    loading,
    addList,
    editList,
    removeList,
    getById,
    fetchById,
    getByCategory,
    duplicateList,
  };

  return <ListsContext.Provider value={value}>{children}</ListsContext.Provider>;
}

export function useLists() {
  const ctx = useContext(ListsContext);
  if (!ctx) {
    throw new Error("useLists debe usarse dentro de <ListsProvider>");
  }
  return ctx;
}

// Estos hooks son puntuales por página (una categoría, una lista) y no
// tienen el mismo problema de refetch entre navegaciones, así que quedan
// como estaban.

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
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "collaborators", filter: `list_id=eq.${listId}` },
        refresh,
      )
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
