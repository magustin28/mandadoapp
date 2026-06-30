import { useState, useEffect } from "react";
import {
  getLists,
  getListById,
  saveList,
  updateList,
  deleteList,
  getPreloadedItems,
  savePreloadedItem,
  updatePreloadedItem,
  deletePreloadedItem,
  getStores,
  saveStore,
  deleteStore,
} from "../services/storage";

export function useLists() {
  const [lists, setLists] = useState([]);

  useEffect(() => {
    setLists(getLists());
  }, []);

  function addList(list) {
    const newList = saveList(list);
    setLists(getLists());
    return newList;
  }

  function editList(id, data) {
    updateList(id, data);
    setLists(getLists());
  }

  function removeList(id) {
    deleteList(id);
    setLists(getLists());
  }

  function getById(id) {
    return getListById(id);
  }

  function getByCategory(category) {
    return lists.filter((l) => l.category === category);
  }

  return {
    lists,
    addList,
    editList,
    removeList,
    getById,
    getByCategory,
  };
}

export function usePreloadedItems(category) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (category) setItems(getPreloadedItems(category));
  }, [category]);

  function addItem(item) {
    const newItem = savePreloadedItem(category, item);
    setItems(getPreloadedItems(category));
    return newItem;
  }

  function editItem(id, data) {
    updatePreloadedItem(category, id, data);
    setItems(getPreloadedItems(category));
  }

  function removeItem(id) {
    deletePreloadedItem(category, id);
    setItems(getPreloadedItems(category));
  }

  return {
    items,
    addItem,
    editItem,
    removeItem,
  };
}

export function useStores(category) {
  const [stores, setStores] = useState([]);

  useEffect(() => {
    if (category) setStores(getStores(category));
  }, [category]);

  function addStore(store) {
    const newStore = saveStore(category, store);
    setStores(getStores(category));
    return newStore;
  }

  function removeStore(id) {
    deleteStore(category, id);
    setStores(getStores(category));
  }

  return { stores, addStore, removeStore };
}
