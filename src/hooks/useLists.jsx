import { useState, useEffect, useCallback } from "react";
import { getLists, getListById, saveList, updateList, deleteList, copyList } from "../services/storage";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./authContext";
import { ListsContext } from "./listsContext";

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

    // Guardar una lista genera VARIOS eventos de Realtime seguidos (borra
    // items, inserta/actualiza items, actualiza la lista). Si refrescáramos
    // en cada evento individual, un refresh disparado a mitad de esa
    // secuencia podría llegar tarde y pisar el estado ya correcto con uno
    // incompleto. Agrupamos la ráfaga con un debounce y refrescamos una
    // sola vez, una vez que se calmó.
    let debounceTimer;
    function scheduleRefresh() {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(refresh, 400);
    }

    const channel = supabase
      .channel("lists-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "lists" }, scheduleRefresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "list_items" }, scheduleRefresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "collaborators" }, scheduleRefresh)
      .subscribe();

    return () => {
      clearTimeout(debounceTimer);
      supabase.removeChannel(channel);
    };
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
