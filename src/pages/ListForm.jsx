import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  IconChevronLeft,
  IconDeviceFloppy,
  IconBrandWhatsapp,
  IconTrash,
  IconPlus,
  IconBuildingStore,
  IconLeaf,
  IconBasket,
  IconUsers,
  IconUserPlus,
  IconX,
} from "@tabler/icons-react";
import Footer from "../components/layout/Footer";
import { useLists, usePreloadedItems, useStores, useCollaborators } from "../hooks/useLists";
import { sendWhatsApp } from "../utils/whatsapp";
import {
  isOwner,
  isCollaborator,
  getUsers,
  getUserByEmail,
  addCollaborators,
  getCurrentUser,
  getPriceByName,
  getCollaboratorsByList,
} from "../services/storage";
import { useToast } from "../hooks/useToast";
import { useConfirm } from "../hooks/useConfirm";
import Toast from "../components/ui/Toast";
import ConfirmModal from "../components/ui/ConfirmModal";
import "./ListForm.css";

const CATEGORIES = [
  { key: "supermercado", label: "Supermercado", icon: (selected) => <IconBuildingStore size={20} color={selected ? "#fff" : "#4A6741"} /> },
  { key: "verduleria", label: "Verdulería", icon: (selected) => <IconLeaf size={20} color={selected ? "#fff" : "#3B7A47"} /> },
  { key: "otros", label: "Otros", icon: (selected) => <IconBasket size={20} color={selected ? "#fff" : "#B87333"} /> },
];

const CATEGORIES_WITH_STORES = ["supermercado"];

function ListForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const { getById, addList, editList, removeList } = useLists();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("supermercado");
  const [items, setItems] = useState([]);
  const [showPreloaded, setShowPreloaded] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);

  const { items: preloaded } = usePreloadedItems(category);
  const { stores } = useStores(category);

  const { toasts, success, error } = useToast();
  const { confirm, ask, handleConfirm, handleCancel } = useConfirm();

  const [showCollabPanel, setShowCollabPanel] = useState(false);

  const owner = isOwner(id);
  const collab = isCollaborator(id);

  const { collaborators, add, remove } = useCollaborators(id);
  const canEdit = owner || !id;

  const ownerName = collab
    ? (() => {
        const list = getById(id);
        const users = getUsers();
        return users.find((u) => u.id === list?.owner_id)?.name || "Otro usuario";
      })()
    : null;

  const [pendingCollabs, setPendingCollabs] = useState([]);
  const [emailCollab, setEmailCollab] = useState("");

  const [userSuggestions, setUserSuggestions] = useState([]);

  function getDefaultName(cat, store) {
    const fecha = new Date().toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
    });
    const catLabel = {
      supermercado: "Supermercado",
      verduleria: "Verdulería",
      otros: "Otros",
    }[cat];
    if (store) return `${catLabel} ${store.name} - ${fecha}`;
    return `${catLabel} - ${fecha}`;
  }

  useEffect(() => {
    if (isEditing) {
      const list = getById(id);
      if (!list) {
        navigate("/");
        return;
      }
      setName(list.name);
      setCategory(list.category);
      setItems(list.items || []);
      setSelectedStore(list.store || null); // ← recuperar store
    } else {
      setName(getDefaultName("supermercado", null));
    }
    setLoaded(true);
  }, [id]);

  function handleStoreSelect(store) {
    if (selectedStore?.id === store.id) {
      setSelectedStore(null);
      setName(getDefaultName(category, null));
    } else {
      setSelectedStore(store);
      setName(getDefaultName(category, store));
    }
  }

  function handleCategoryChange(key) {
    const preloadedNames = preloaded.map((p) => p.name);
    const nonPreloaded = items.filter((i) => !preloadedNames.includes(i.name));
    setItems(nonPreloaded);
    setCategory(key);
    setSelectedStore(null);
    setName(getDefaultName(key, null));
  }

  function handleAddItem() {
    setItems([
      ...items,
      {
        id: crypto.randomUUID(),
        name: "",
        quantity: null,
        unit: "",
        price: null,
        ver: true,
        expanded: false,
      },
    ]);
  }

  function handleItemChange(itemId, field, value) {
    setItems(
      items.map((i) => {
        if (i.id !== itemId) return i;
        const updated = { ...i, [field]: value };
        if (field === "price") {
          updated.ver = !value;
        }
        return updated;
      }),
    );
  }

  function handleRemoveItem(itemId) {
    setItems(items.filter((i) => i.id !== itemId));
  }

  function handleTogglePreloaded(preloadedItem) {
    const exists = items.find((i) => i.name === preloadedItem.name);
    if (exists) {
      setItems(items.filter((i) => i.name !== preloadedItem.name));
    } else {
      const history = getPriceByName(preloadedItem.name);
      setItems([
        ...items,
        {
          id: crypto.randomUUID(),
          name: preloadedItem.name,
          quantity: null,
          unit: preloadedItem.unit || "",
          price: history?.price || null,
          ver: !history?.price,
          expanded: false,
        },
      ]);
    }
  }

  function validate() {
    if (!name.trim()) {
      error("Ponele un nombre a la lista");
      return false;
    }
    if (items.length === 0) {
      error("Agregá al menos un item");
      return false;
    }
    return true;
  }

  function handleSave() {
    if (!validate()) return;
    if (isEditing) {
      editList(id, { name, category, items, store: selectedStore });
      success("Lista guardada");
      setTimeout(() => navigate(`/categorias?cat=${category}`), 1000);
    } else {
      const newList = addList({ name, category, items, store: selectedStore });
      if (pendingCollabs.length > 0) {
        addCollaborators(
          newList.id,
          pendingCollabs.map((c) => c.id),
        );
      }
      success("Lista creada");
      setTimeout(() => navigate("/"), 1000);
    }
  }

  function handleWhatsApp() {
    if (!validate()) return;
    if (isEditing) {
      editList(id, { name, category, items, store: selectedStore });
      sendWhatsApp({ name, category, items });
      setTimeout(() => navigate(`/categorias?cat=${category}`), 500);
    } else {
      const newList = addList({ name, category, items, store: selectedStore });
      if (pendingCollabs.length > 0) {
        addCollaborators(
          newList.id,
          pendingCollabs.map((c) => c.id),
        );
      }
      sendWhatsApp(newList);
      setTimeout(() => navigate("/"), 500);
    }
  }

  async function handleDelete() {
    const confirmed = await ask("¿Eliminar esta lista?");
    if (confirmed) {
      removeList(id);
      navigate("/categorias");
    }
  }

  if (isEditing && !loaded) return null;

  function handleAddCollaborator() {
    if (!emailCollab.trim()) return;
    if (!isEditing) {
      const user = getUserByEmail(emailCollab.trim());
      if (!user) {
        error("No existe una cuenta con ese email");
        return;
      }
      const currentUser = getCurrentUser();
      if (user.id === currentUser?.id) {
        error("No podés invitarte a vos mismo");
        return;
      }
      if (pendingCollabs.find((c) => c.email === user.email)) {
        error("Ya está en la lista");
        return;
      }
      setPendingCollabs([...pendingCollabs, { id: user.id, name: user.name, email: user.email }]);
      setEmailCollab("");
      success(`${user.name} agregado`);
    } else {
      const result = add(emailCollab.trim());
      if (result.error) {
        error(result.error);
      } else {
        success(`${result.user.name} agregado como colaborador`);
        setEmailCollab("");
      }
    }
  }

  async function handleRemoveCollaborator(userId, name) {
    const confirmed = await ask(`¿Eliminar a ${name} como colaborador?`);
    if (confirmed) remove(userId);
  }

  function handleToggleExpand(itemId) {
    setItems(items.map((i) => (i.id === itemId ? { ...i, expanded: !i.expanded } : i)));
  }

  function handleItemNameChange(itemId, value) {
    const history = getPriceByName(value);
    setItems(
      items.map((i) =>
        i.id === itemId
          ? {
              ...i,
              name: value,
              price: history?.price || i.price,
              ver: history ? false : i.ver,
            }
          : i,
      ),
    );
  }

  function handleEmailChange(value) {
    setEmailCollab(value);
    if (value.trim().length < 2) {
      setUserSuggestions([]);
      return;
    }
    const currentUser = getCurrentUser();
    const allUsers = getUsers();
    const collabIds = (isEditing ? collaborators : pendingCollabs).map((c) => c.id || c.user_id);
    const filtered = allUsers.filter(
      (u) =>
        u.id !== currentUser?.id &&
        !collabIds.includes(u.id) &&
        (u.name.toLowerCase().includes(value.toLowerCase()) || u.email.toLowerCase().includes(value.toLowerCase())),
    );
    setUserSuggestions(filtered);
  }

  function handleSelectSuggestion(user) {
    setEmailCollab(user.email);
    setUserSuggestions([]);
    if (!isEditing) {
      if (pendingCollabs.find((c) => c.id === user.id)) return;
      setPendingCollabs([...pendingCollabs, { id: user.id, name: user.name, email: user.email }]);
      setEmailCollab("");
    } else {
      const result = add(user.email);
      if (result.error) error(result.error);
      else success(`${user.name} agregado como colaborador`);
      setEmailCollab("");
    }
  }

  return (
    <div className="page">
      <div className="nav-bar">
        <button className="nav-back" onClick={() => navigate(-1)}>
          <IconChevronLeft size={20} />
        </button>
        <div>
          <span className="nav-title">
            {isEditing ? "Editar lista" : "Nueva lista"}
            {id && (collab || collaborators.length > 0 || pendingCollabs.length > 0) && (
              <IconUsers size={16} color="#4A6741" style={{ marginLeft: 6 }} />
            )}
          </span>
          {collab && ownerName && <p className="nav-subtitle">Compartida por {ownerName}</p>}
        </div>
      </div>

      <div className="listform-content">
        <p className="section-label">Nombre de la lista</p>
        <input
          className="input-name"
          type="text"
          placeholder="Ej: Compras del martes..."
          value={name}
          onChange={(e) => canEdit && setName(e.target.value)}
          readOnly={!canEdit}
          style={!canEdit ? { opacity: 0.7 } : {}}
        />
        <p className="section-label">Categoría</p>
        <div className="cat-tabs-scroll">
          {CATEGORIES.map(({ key, label, icon }) => (
            <button key={key} className={`cat-opt-tab ${category === key ? "cat-opt-tab--selected" : ""}`} onClick={() => handleCategoryChange(key)}>
              <span>{icon(category === key)}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
        {CATEGORIES_WITH_STORES.includes(category) && (
          <>
            <p className="section-label">Comercio</p>
            <div className="cat-tabs-scroll">
              {stores.map((store) => (
                <button
                  key={store.id}
                  className={`store-chip ${selectedStore?.id === store.id ? "store-chip--selected" : ""}`}
                  onClick={() => handleStoreSelect(store)}
                >
                  {store.name}
                </button>
              ))}
            </div>
          </>
        )}
        <div className="items-header">
          <p className="section-label" style={{ margin: 0 }}>
            Items
          </p>
          <button className="btn-preloaded" onClick={() => setShowPreloaded(!showPreloaded)}>
            {showPreloaded ? "Ocultar sugerencias" : "⭐ Ver sugerencias"}
          </button>
        </div>
        {showPreloaded && (
          <>
            <div className="panel-overlay" onClick={() => setShowPreloaded(false)} />
            <div className="preloaded-list">
              {preloaded.map((p) => {
                const selected = items.find((i) => i.name === p.name);
                return (
                  <button
                    key={p.id}
                    className={`preloaded-item ${selected ? "preloaded-item--selected" : ""}`}
                    onClick={() => handleTogglePreloaded(p)}
                  >
                    {p.name}
                    {selected && " ✓"}
                  </button>
                );
              })}
            </div>
          </>
        )}
        <div className="items-container">
          {items.map((item) => (
            <div key={item.id} className="item-row-wrap">
              <div className="item-row">
                <input
                  className="item-input-name"
                  type="text"
                  placeholder="Item..."
                  value={item.name}
                  onChange={(e) => handleItemNameChange(item.id, e.target.value)}
                />
                {getPriceByName(item.name) && !item.expanded && (
                  <span className="item-price-badge">${getPriceByName(item.name).price.toLocaleString("es-AR")}</span>
                )}
                <button className={`btn-ver ${item.ver ? "btn-ver--active" : ""}`} onClick={() => handleItemChange(item.id, "ver", !item.ver)}>
                  VER
                </button>
                <button className="btn-info-expand" onClick={() => handleToggleExpand(item.id)}>
                  {item.expanded ? "−" : "+"}
                </button>
                <button className="item-del" onClick={() => handleRemoveItem(item.id)}>
                  <IconTrash size={16} color="#C4BCB0" />
                </button>
              </div>

              {item.expanded && (
                <div className="item-row-extra">
                  <div className="item-extra-field">
                    <span className="item-extra-label">Cant.</span>
                    <input
                      className="item-input-qty"
                      type="number"
                      min="1"
                      placeholder="—"
                      value={item.quantity || ""}
                      onChange={(e) => handleItemChange(item.id, "quantity", Number(e.target.value) || null)}
                    />
                  </div>
                  <div className="item-extra-field">
                    <span className="item-extra-label">Unidad</span>
                    <input
                      className="item-input-unit"
                      type="text"
                      placeholder="kg, u..."
                      value={item.unit || ""}
                      onChange={(e) => handleItemChange(item.id, "unit", e.target.value)}
                    />
                  </div>
                  <div className="item-extra-field">
                    <span className="item-extra-label">Precio</span>
                    <div className="item-price-wrap">
                      <span className="item-price-symbol">$</span>
                      <input
                        className="item-input-price"
                        type="number"
                        placeholder="0"
                        value={item.price || ""}
                        onChange={(e) => handleItemChange(item.id, "price", Number(e.target.value) || null)}
                      />
                    </div>
                    {getPriceByName(item.name) && (
                      <span className="item-price-hint">
                        Último: ${getPriceByName(item.name).price.toLocaleString("es-AR")} ({getPriceByName(item.name).date})
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          <button className="add-item-row" onClick={handleAddItem}>
            <span className="add-item-icon">
              <IconPlus size={16} color="#4A6741" />
            </span>
            <span className="add-item-text">Agregar item</span>
          </button>
        </div>
        {(owner || !id) && (
          <>
            <div className="items-header" style={{ marginTop: "var(--space-xl)" }}>
              <p className="section-label" style={{ margin: 0 }}>
                Colaboradores
              </p>
              <button className="btn-preloaded" onClick={() => setShowCollabPanel(!showCollabPanel)}>
                <IconUsers size={14} /> Invitar
              </button>
            </div>

            {(isEditing ? collaborators : pendingCollabs).length > 0 && (
              <div className="collab-inline-list">
                {(isEditing ? collaborators : pendingCollabs).map((c) => (
                  <div key={c.id} className="collab-inline-row">
                    <div className="collab-avatar">{c.name[0].toUpperCase()}</div>
                    <span className="collab-inline-name">{c.name}</span>
                    <button
                      className="collab-remove"
                      onClick={() =>
                        isEditing
                          ? handleRemoveCollaborator(c.user_id || c.id, c.name)
                          : setPendingCollabs(pendingCollabs.filter((p) => p.id !== c.id))
                      }
                    >
                      <IconX size={14} color="#C0392B" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {showCollabPanel && (
              <>
                <div className="panel-overlay" onClick={() => setShowCollabPanel(false)} />
                <div className="collab-panel">
                  <div className="collab-add">
                    <div className="collab-input-wrap">
                      <input
                        className="input-name"
                        type="email"
                        placeholder="Nombre o email..."
                        value={emailCollab}
                        onChange={(e) => handleEmailChange(e.target.value)}
                      />
                      {userSuggestions.length > 0 && (
                        <div className="collab-suggestions">
                          {userSuggestions.map((u) => (
                            <button key={u.id} className="collab-suggestion-row" onClick={() => handleSelectSuggestion(u)}>
                              <div className="collab-avatar">{u.name[0].toUpperCase()}</div>
                              <div className="collab-info">
                                <p className="collab-name">{u.name}</p>
                                <p className="collab-email">{u.email}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button className="btn-collab-add" onClick={handleAddCollaborator}>
                      <IconUserPlus size={18} color="#fff" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      <div className="bottom-actions">
        <div className="bottom-actions-row">
          <button className="btn-save" onClick={handleSave}>
            <IconDeviceFloppy size={18} color="#fff" />
            {isEditing ? "Guardar" : "Guardar"}
          </button>
          <button className="btn-wap" onClick={handleWhatsApp}>
            <IconBrandWhatsapp size={18} color="#128C4F" />
            <span>WhatsApp</span>
          </button>
        </div>
        {isEditing && (
          <button className="btn-delete-list" onClick={handleDelete}>
            <IconTrash size={16} color="#C0392B" />
            Eliminar lista
          </button>
        )}
      </div>

      <Toast toasts={toasts} />
      {confirm && <ConfirmModal message={confirm.message} onConfirm={handleConfirm} onCancel={handleCancel} />}

      <Footer />
    </div>
  );
}

export default ListForm;
