import { supabase } from "../lib/supabaseClient";

async function getUserId() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id;
}

function mapItem(row) {
  return {
    id: row.id,
    name: row.name,
    quantity: row.quantity,
    unit: row.unit,
    price: row.price,
    ver: row.ver,
    position: row.position,
  };
}

function mapList(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    store: row.store,
    owner_id: row.owner_id,
    ownerName: row.profiles?.name || null,
    isShared: (row.collaborators || []).length > 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    items: (row.list_items || [])
      .slice()
      .sort((a, b) => a.position - b.position)
      .map(mapItem),
  };
}

const LIST_SELECT = "*, list_items(*), profiles!lists_owner_id_fkey(name, email), collaborators(id)";

function normalizeStore(store) {
  if (!store) return null;
  return typeof store === "string" ? store : store.name || null;
}

// ---------- Listas ----------

export async function getLists() {
  const { data, error } = await supabase.from("lists").select(LIST_SELECT).order("updated_at", { ascending: false });
  if (error) throw error;
  return data.map(mapList);
}

export async function getListById(id) {
  const { data, error } = await supabase.from("lists").select(LIST_SELECT).eq("id", id).single();
  if (error) throw error;
  return mapList(data);
}

export async function saveList(list) {
  const userId = await getUserId();
  const { data: newList, error } = await supabase
    .from("lists")
    .insert({
      name: list.name,
      category: list.category,
      store: normalizeStore(list.store),
      owner_id: userId,
    })
    .select()
    .single();
  if (error) throw error;

  if (list.items?.length) {
    const rows = list.items.map((item, index) => ({
      list_id: newList.id,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      price: item.price,
      ver: item.ver || false,
      position: index,
    }));
    const { error: itemsError } = await supabase.from("list_items").insert(rows);
    if (itemsError) throw itemsError;
  }

  return getListById(newList.id);
}

// Sincroniza el array de items de una lista contra la tabla list_items.
// IMPORTANTE: espera el array COMPLETO de items de la lista (no un diff parcial),
// igual que antes se guardaba el array entero en localStorage.
async function syncListItems(listId, items) {
  const { data: currentItems, error: fetchError } = await supabase
    .from("list_items")
    .select("id")
    .eq("list_id", listId);
  if (fetchError) throw fetchError;

  const currentIds = currentItems.map((i) => i.id);
  const incomingIds = items.filter((i) => i.id).map((i) => i.id);
  const toDelete = currentIds.filter((id) => !incomingIds.includes(id));

  if (toDelete.length) {
    const { error: deleteError } = await supabase.from("list_items").delete().in("id", toDelete);
    if (deleteError) throw deleteError;
  }

  // Siempre mandamos un id explícito por fila (el que ya trae el item desde
  // el form, generado con crypto.randomUUID() al crearlo en memoria; o uno
  // nuevo acá como respaldo). Si algunas filas tuvieran id y otras no,
  // upsert() arma una sola consulta con columnas fijas para todo el lote,
  // y las filas sin id terminan mandando NULL explícito en vez de dejar que
  // la base use su default — eso rompía la constraint de la primary key.
  const rows = items.map((item, index) => ({
    id: item.id || crypto.randomUUID(),
    list_id: listId,
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    price: item.price,
    ver: item.ver || false,
    position: index,
  }));

  const { error: upsertError } = await supabase.from("list_items").upsert(rows);
  if (upsertError) throw upsertError;
}

export async function updateList(id, data) {
  const { items, ...listFields } = data;

  if (Object.keys(listFields).length > 0) {
    const { error } = await supabase
      .from("lists")
      .update({ ...listFields, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  }

  if (items) {
    await syncListItems(id, items);
  }

  return getListById(id);
}

export async function deleteList(id) {
  const { error } = await supabase.from("lists").delete().eq("id", id);
  if (error) throw error;
}

export async function copyList(id) {
  const original = await getListById(id);
  return saveList({
    name: `${original.name} (copia)`,
    category: original.category,
    store: original.store,
    items: original.items.map((item) => ({ ...item, id: undefined, ver: false })),
  });
}

export async function isOwner(listId) {
  const userId = await getUserId();
  const { data, error } = await supabase.from("lists").select("owner_id").eq("id", listId).single();
  if (error) return false;
  return data.owner_id === userId;
}

export async function isCollaborator(listId) {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from("collaborators")
    .select("id")
    .eq("list_id", listId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) return false;
  return Boolean(data);
}

export async function isSharedList(listId) {
  const { data, error } = await supabase.from("collaborators").select("id").eq("list_id", listId);
  if (error) return false;
  return data.length > 0;
}

// ---------- Items precargables ----------

export async function getPreloadedItems(category) {
  const { data, error } = await supabase.from("preloaded_items").select("*").eq("category", category).order("name");
  if (error) throw error;
  return data;
}

export async function savePreloadedItem(category, item) {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from("preloaded_items")
    .insert({ ...item, category, owner_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePreloadedItem(category, id, data) {
  const { error } = await supabase.from("preloaded_items").update(data).eq("id", id);
  if (error) throw error;
}

export async function deletePreloadedItem(category, id) {
  const { error } = await supabase.from("preloaded_items").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Comercios ----------

export async function getStores(category) {
  const { data, error } = await supabase.from("stores").select("*").eq("category", category).order("name");
  if (error) throw error;
  return data;
}

export async function saveStore(category, store) {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from("stores")
    .insert({ ...store, category, owner_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteStore(category, id) {
  const { error } = await supabase.from("stores").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Colaboradores ----------

export async function getProfileByEmail(email) {
  const { data, error } = await supabase.from("profiles").select("id, name, email").eq("email", email).maybeSingle();
  if (error) throw error;
  return data;
}

export async function searchProfiles(query) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, email")
    .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
    .limit(10);
  if (error) throw error;
  return data;
}

export async function getCollaboratorsByList(listId) {
  const { data, error } = await supabase
    .from("collaborators")
    .select("id, user_id, role, created_at, profiles(name, email)")
    .eq("list_id", listId);
  if (error) throw error;
  return data.map((c) => ({
    id: c.id,
    list_id: listId,
    user_id: c.user_id,
    role: c.role,
    createdAt: c.created_at,
    name: c.profiles?.name || "Usuario",
    email: c.profiles?.email || "",
  }));
}

export async function addCollaborator(listId, email) {
  const profile = await getProfileByEmail(email);

  if (!profile) {
    return { collaborator: null, error: "No encontramos un usuario registrado con ese email" };
  }

  const { data, error } = await supabase
    .from("collaborators")
    .insert({ list_id: listId, user_id: profile.id, role: "editor" })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return { collaborator: null, error: "Esa persona ya es colaboradora de esta lista" };
    }
    return { collaborator: null, error: error.message };
  }

  return { collaborator: { ...data, name: profile.name, email: profile.email }, error: null };
}

export async function addCollaborators(listId, userIds) {
  const rows = userIds.map((userId) => ({ list_id: listId, user_id: userId, role: "editor" }));
  const { error } = await supabase.from("collaborators").insert(rows);
  if (error) throw error;
}

export async function removeCollaborator(listId, userId) {
  const { error } = await supabase.from("collaborators").delete().match({ list_id: listId, user_id: userId });
  if (error) throw error;
}

// ---------- Historial de precios ----------

export async function getPriceHistory() {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from("price_history")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getPriceByName(name) {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from("price_history")
    .select("*")
    .eq("user_id", userId)
    .eq("item_name", name)
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function savePriceHistory(items) {
  const userId = await getUserId();
  const rows = items
    .filter((item) => item.price)
    .map((item) => ({
      item_name: item.name,
      price: item.price,
      user_id: userId,
    }));
  if (!rows.length) return;
  const { error } = await supabase.from("price_history").insert(rows);
  if (error) throw error;
}
