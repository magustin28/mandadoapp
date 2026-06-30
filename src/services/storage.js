const LISTS_KEY = "mandado_lists";
const ITEMS_KEY = "mandado_preloaded_items";

// ─── Listas ───────────────────────────────────────────

export function getLists() {
  const data = localStorage.getItem(LISTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function getListById(id) {
  const lists = getLists();
  return lists.find((l) => l.id === id) || null;
}

export function saveList(list) {
  const lists = getLists();
  const newList = {
    ...list,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(LISTS_KEY, JSON.stringify([...lists, newList]));
  return newList;
}

export function updateList(id, data) {
  const lists = getLists();
  const updated = lists.map((l) => (l.id === id ? { ...l, ...data, updatedAt: new Date().toISOString() } : l));
  localStorage.setItem(LISTS_KEY, JSON.stringify(updated));
}

export function deleteList(id) {
  const lists = getLists();
  const filtered = lists.filter((l) => l.id !== id);
  localStorage.setItem(LISTS_KEY, JSON.stringify(filtered));
}

// ─── Items precargables ───────────────────────────────

const DEFAULT_ITEMS = {
  supermercado: [
    { id: crypto.randomUUID(), name: "Leche", unit: "litros" },
    { id: crypto.randomUUID(), name: "Arroz", unit: "kg" },
    { id: crypto.randomUUID(), name: "Aceite", unit: "u" },
    { id: crypto.randomUUID(), name: "Fideos", unit: "u" },
    { id: crypto.randomUUID(), name: "Azúcar", unit: "kg" },
    { id: crypto.randomUUID(), name: "Harina", unit: "kg" },
    { id: crypto.randomUUID(), name: "Sal", unit: "u" },
    { id: crypto.randomUUID(), name: "Huevos", unit: "u" },
  ],
  verduleria: [
    { id: crypto.randomUUID(), name: "Tomate", unit: "kg" },
    { id: crypto.randomUUID(), name: "Lechuga", unit: "u" },
    { id: crypto.randomUUID(), name: "Zanahoria", unit: "kg" },
    { id: crypto.randomUUID(), name: "Papa", unit: "kg" },
    { id: crypto.randomUUID(), name: "Cebolla", unit: "kg" },
    { id: crypto.randomUUID(), name: "Zapallo", unit: "kg" },
  ],
  otros: [
    { id: crypto.randomUUID(), name: "Detergente", unit: "u" },
    { id: crypto.randomUUID(), name: "Jabón", unit: "u" },
    { id: crypto.randomUUID(), name: "Papel higiénico", unit: "u" },
  ],
};

export function getPreloadedItems(category) {
  const data = localStorage.getItem(ITEMS_KEY);

  if (!data) {
    // Primera vez: guardamos los defaults en localStorage
    localStorage.setItem(ITEMS_KEY, JSON.stringify(DEFAULT_ITEMS));
    return DEFAULT_ITEMS[category] || [];
  }

  return JSON.parse(data)[category] || [];
}

export function savePreloadedItem(category, item) {
  const data = localStorage.getItem(ITEMS_KEY);
  const items = data ? JSON.parse(data) : DEFAULT_ITEMS;
  const newItem = { ...item, id: crypto.randomUUID() };
  items[category] = [...(items[category] || []), newItem];
  localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  return newItem;
}

export function updatePreloadedItem(category, id, data) {
  const stored = localStorage.getItem(ITEMS_KEY);
  const items = stored ? JSON.parse(stored) : DEFAULT_ITEMS;
  items[category] = items[category].map((i) => (i.id === id ? { ...i, ...data } : i));
  localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
}

export function deletePreloadedItem(category, id) {
  const stored = localStorage.getItem(ITEMS_KEY);
  const items = stored ? JSON.parse(stored) : DEFAULT_ITEMS;
  items[category] = items[category].filter((i) => i.id !== id);
  localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
}

const STORES_KEY = "mandado_stores";

const DEFAULT_STORES = {
  supermercado: [
    { id: crypto.randomUUID(), name: "Buenos Días" },
    { id: crypto.randomUUID(), name: "Carrefour" },
    { id: crypto.randomUUID(), name: "Disco" },
  ],
  verduleria: [],
  otros: [],
};

export function getStores(category) {
  const data = localStorage.getItem(STORES_KEY);
  if (!data) {
    localStorage.setItem(STORES_KEY, JSON.stringify(DEFAULT_STORES));
    return DEFAULT_STORES[category] || [];
  }
  return JSON.parse(data)[category] || [];
}

export function saveStore(category, store) {
  const data = localStorage.getItem(STORES_KEY);
  const stores = data ? JSON.parse(data) : DEFAULT_STORES;
  const newStore = { ...store, id: crypto.randomUUID() };
  stores[category] = [...(stores[category] || []), newStore];
  localStorage.setItem(STORES_KEY, JSON.stringify(stores));
  return newStore;
}

export function deleteStore(category, id) {
  const data = localStorage.getItem(STORES_KEY);
  const stores = data ? JSON.parse(data) : DEFAULT_STORES;
  stores[category] = stores[category].filter((s) => s.id !== id);
  localStorage.setItem(STORES_KEY, JSON.stringify(stores));
}
