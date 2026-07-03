const LISTS_KEY = "mandado_lists";
const ITEMS_KEY = "mandado_preloaded_items";

// ─── Listas ───────────────────────────────────────────

export function getListById(id) {
  const lists = getAllLists();
  return lists.find((l) => l.id === id) || null;
}

export function saveList(list) {
  const lists = getAllLists();
  const currentUser = getCurrentUser();
  const newList = {
    ...list,
    id: crypto.randomUUID(),
    owner_id: currentUser?.id || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(LISTS_KEY, JSON.stringify([...lists, newList]));
  return newList;
}

export function updateList(id, data) {
  const lists = getAllLists();
  const updated = lists.map((l) => (l.id === id ? { ...l, ...data, updatedAt: new Date().toISOString() } : l));
  localStorage.setItem(LISTS_KEY, JSON.stringify(updated));
}

export function deleteList(id) {
  const lists = getAllLists();
  const filtered = lists.filter((l) => l.id !== id);
  localStorage.setItem(LISTS_KEY, JSON.stringify(filtered));
}

export function getAllLists() {
  const data = localStorage.getItem(LISTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function getLists() {
  const lists = getAllLists();
  const currentUser = getCurrentUser();
  if (!currentUser) return [];

  const ownLists = lists.filter((l) => l.owner_id === currentUser.id);
  const collabListIds = getListsByCollaborator(currentUser.id).map((c) => c.list_id);
  const collabLists = lists.filter((l) => collabListIds.includes(l.id));

  return [...ownLists, ...collabLists];
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

export function copyList(id) {
  const lists = getAllLists();
  const currentUser = getCurrentUser();
  const original = lists.find((l) => l.id === id);
  if (!original) return null;
  const copy = {
    ...original,
    id: crypto.randomUUID(),
    name: `${original.name} - copia`,
    owner_id: currentUser?.id || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(LISTS_KEY, JSON.stringify([...lists, copy]));
  return copy;
}

// ─── Usuarios ─────────────────────────────────────────

const USERS_KEY = "mandado_users";
const CURRENT_USER_KEY = "mandado_current_user";

export function getUsers() {
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
}

export function getUserByEmail(email) {
  const users = getUsers();
  return users.find((u) => u.email === email.toLowerCase()) || null;
}

export function registerUser(name, email, password) {
  const users = getUsers();
  const exists = users.find((u) => u.email === email.toLowerCase());
  if (exists) return { error: "Ya existe una cuenta con ese email" };
  const newUser = {
    id: crypto.randomUUID(),
    name,
    email: email.toLowerCase(),
    password,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
  return { user: newUser };
}

export function loginUser(email, password) {
  const user = getUserByEmail(email);
  if (!user) return { error: "No existe una cuenta con ese email" };
  if (user.password !== password) return { error: "Contraseña incorrecta" };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return { user };
}

export function logoutUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

export function getCurrentUser() {
  const data = localStorage.getItem(CURRENT_USER_KEY);
  return data ? JSON.parse(data) : null;
}

export function updateUser(id, data) {
  const users = getUsers();
  const updated = users.map((u) => (u.id === id ? { ...u, ...data } : u));
  localStorage.setItem(USERS_KEY, JSON.stringify(updated));
  const current = getCurrentUser();
  if (current?.id === id) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ ...current, ...data }));
  }
}

// ─── Colaboradores ────────────────────────────────────

const COLLABORATORS_KEY = "mandado_collaborators";

export function getCollaborators() {
  const data = localStorage.getItem(COLLABORATORS_KEY);
  return data ? JSON.parse(data) : [];
}

export function getCollaboratorsByList(listId) {
  return getCollaborators().filter((c) => c.list_id === listId);
}

export function getListsByCollaborator(userId) {
  return getCollaborators().filter((c) => c.user_id === userId);
}

export function addCollaborator(listId, email) {
  const user = getUserByEmail(email);
  if (!user) return { error: "No existe una cuenta con ese email" };

  const currentUser = getCurrentUser();
  if (user.id === currentUser?.id) return { error: "No podés invitarte a vos mismo" };

  const collaborators = getCollaborators();
  const exists = collaborators.find((c) => c.list_id === listId && c.user_id === user.id);
  if (exists) return { error: "Este usuario ya es colaborador" };

  const newCollab = {
    id: crypto.randomUUID(),
    list_id: listId,
    user_id: user.id,
    role: "editor",
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(COLLABORATORS_KEY, JSON.stringify([...collaborators, newCollab]));
  return { collaborator: newCollab, user };
}

export function removeCollaborator(listId, userId) {
  const collaborators = getCollaborators();
  const filtered = collaborators.filter((c) => !(c.list_id === listId && c.user_id === userId));
  localStorage.setItem(COLLABORATORS_KEY, JSON.stringify(filtered));
}

export function isCollaborator(listId) {
  const currentUser = getCurrentUser();
  if (!currentUser) return false;
  const collaborators = getCollaborators();
  return collaborators.some((c) => c.list_id === listId && c.user_id === currentUser.id);
}

export function isOwner(listId) {
  const currentUser = getCurrentUser();
  if (!currentUser) return false;
  const list = getListById(listId);
  return list?.owner_id === currentUser.id;
}

export function addCollaborators(listId, userIds) {
  const collaborators = getCollaborators();
  const newCollabs = userIds.map((userId) => ({
    id: crypto.randomUUID(),
    list_id: listId,
    user_id: userId,
    role: "editor",
    createdAt: new Date().toISOString(),
  }));
  localStorage.setItem(COLLABORATORS_KEY, JSON.stringify([...collaborators, ...newCollabs]));
}
