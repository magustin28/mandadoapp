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
  IconCheck,
  IconUsers,
  IconUserPlus,
  IconX,
} from "@tabler/icons-react";
import Footer from "../components/layout/Footer";
import { useLists, usePreloadedItems, useStores, useCollaborators } from "../hooks/useLists";
import { sendWhatsApp } from "../utils/whatsapp";
import { isOwner, isCollaborator, getUsers, getUserByEmail, addCollaborators, getCurrentUser } from "../services/storage";
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

  const canEdit = owner || !id;
  const isShared = id && (owner || collab);

  const { collaborators, add, remove } = useCollaborators(id);

  const ownerName = collab
    ? (() => {
        const list = getById(id);
        const users = getUsers();
        return users.find((u) => u.id === list?.owner_id)?.name || "Otro usuario";
      })()
    : null;

  const [pendingCollabs, setPendingCollabs] = useState([]);
  const [emailCollab, setEmailCollab] = useState("");

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
    setItems([...items, { id: crypto.randomUUID(), name: "", quantity: 1, unit: "u" }]);
  }

  function handleItemChange(itemId, field, value) {
    const parsed = field === "quantity" ? Number(value) || 1 : value;
    setItems(items.map((i) => (i.id === itemId ? { ...i, [field]: parsed } : i)));
  }

  function handleRemoveItem(itemId) {
    setItems(items.filter((i) => i.id !== itemId));
  }

  function handleTogglePreloaded(preloadedItem) {
    const exists = items.find((i) => i.name === preloadedItem.name);
    if (exists) {
      setItems(items.filter((i) => i.name !== preloadedItem.name));
    } else {
      setItems([
        ...items,
        {
          id: crypto.randomUUID(),
          name: preloadedItem.name,
          quantity: 1,
          unit: preloadedItem.unit,
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
      navigate("/categorias");
    } else {
      const newList = addList({ name, category, items, store: selectedStore });
      if (pendingCollabs.length > 0) {
        addCollaborators(
          newList.id,
          pendingCollabs.map((c) => c.id),
        );
      }
      success("Lista creada");
      navigate("/");
    }
  }

  function handleWhatsApp() {
    if (!validate()) return;
    if (isEditing) {
      editList(id, { name, category, items, store: selectedStore });
      sendWhatsApp({ name, category, items });
      navigate("/categorias");
    } else {
      const newList = addList({ name, category, items, store: selectedStore });
      if (pendingCollabs.length > 0) {
        addCollaborators(
          newList.id,
          pendingCollabs.map((c) => c.id),
        );
      }
      sendWhatsApp(newList);
      navigate("/");
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

  return (
    <div className="page">
      <div className="nav-bar">
        <button className="nav-back" onClick={() => navigate(-1)}>
          <IconChevronLeft size={20} />
        </button>
        <div>
          <span className="nav-title">
            {isEditing ? "Editar lista" : "Nueva lista"}
            {isShared && <IconUsers size={16} color="#4A6741" style={{ marginLeft: 6 }} />}{" "}
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
        )}

        <div className="items-container">
          {items.map((item) => (
            <div key={item.id} className="item-row">
              <input
                className="item-input-name"
                type="text"
                placeholder="Item..."
                value={item.name}
                onChange={(e) => handleItemChange(item.id, "name", e.target.value)}
              />
              <input
                className="item-input-qty"
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => handleItemChange(item.id, "quantity", e.target.value)}
              />
              <input
                className="item-input-unit"
                type="text"
                placeholder="u"
                value={item.unit}
                onChange={(e) => handleItemChange(item.id, "unit", e.target.value)}
              />
              <button className="item-del" onClick={() => handleRemoveItem(item.id)}>
                <IconTrash size={16} color="#C4BCB0" />
              </button>
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
                <IconUsers size={14} />{" "}
                {(isEditing ? collaborators.length : pendingCollabs.length) > 0
                  ? `${isEditing ? collaborators.length : pendingCollabs.length} colaborador${(isEditing ? collaborators.length : pendingCollabs.length) > 1 ? "es" : ""}`
                  : "Invitar"}
              </button>
            </div>

            {showCollabPanel && (
              <div className="collab-panel">
                {/* lista de colaboradores */}
                {(isEditing ? collaborators : pendingCollabs).length > 0 && (
                  <div className="collab-list">
                    {(isEditing ? collaborators : pendingCollabs).map((c) => (
                      <div key={c.id} className="collab-row">
                        <div className="collab-avatar">{c.name[0].toUpperCase()}</div>
                        <div className="collab-info">
                          <p className="collab-name">{c.name}</p>
                          <p className="collab-email">{c.email}</p>
                        </div>
                        <button
                          className="collab-remove"
                          onClick={() =>
                            isEditing
                              ? handleRemoveCollaborator(c.user_id || c.id, c.name)
                              : setPendingCollabs(pendingCollabs.filter((p) => p.id !== c.id))
                          }
                        >
                          <IconX size={16} color="#C0392B" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="collab-add">
                  <input
                    className="input-name"
                    type="email"
                    placeholder="Email del colaborador..."
                    value={emailCollab}
                    onChange={(e) => setEmailCollab(e.target.value)}
                  />
                  <button className="btn-collab-add" onClick={handleAddCollaborator}>
                    <IconUserPlus size={18} color="#fff" />
                  </button>
                </div>
              </div>
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
