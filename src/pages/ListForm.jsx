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
} from "@tabler/icons-react";
import Footer from "../components/layout/Footer";
import { useLists, usePreloadedItems, useStores } from "../hooks/useLists";
import { sendWhatsApp } from "../utils/whatsapp";
import "./ListForm.css";

const CATEGORIES = [
  { key: "supermercado", label: "Supermercado", icon: <IconBuildingStore size={20} color="#4A6741" /> },
  { key: "verduleria", label: "Verdulería", icon: <IconLeaf size={20} color="#3B7A47" /> },
  { key: "otros", label: "Otros", icon: <IconBasket size={20} color="#B87333" /> },
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
      alert("Ponele un nombre a la lista");
      return false;
    }
    if (items.length === 0) {
      alert("Agregá al menos un item");
      return false;
    }
    return true;
  }

  function handleSave() {
    if (!validate()) return;
    if (isEditing) {
      editList(id, { name, category, items });
      navigate("/categorias");
    } else {
      addList({ name, category, items });
      navigate("/");
    }
  }

  function handleWhatsApp() {
    if (!validate()) return;
    if (isEditing) {
      editList(id, { name, category, items });
      sendWhatsApp({ name, category, items });
      navigate("/categorias");
    } else {
      const newList = addList({ name, category, items });
      sendWhatsApp(newList);
      navigate("/");
    }
  }

  function handleDelete() {
    if (confirm("¿Eliminar esta lista?")) {
      removeList(id);
      navigate("/categorias");
    }
  }

  if (isEditing && !loaded) return null;

  return (
    <div className="page">
      <div className="nav-bar">
        <button className="nav-back" onClick={() => navigate(-1)}>
          <IconChevronLeft size={20} />
        </button>
        <span className="nav-title">{isEditing ? "Editar lista" : "Nueva lista"}</span>
      </div>

      <div className="listform-content">
        <p className="section-label">Nombre de la lista</p>
        <input className="input-name" type="text" placeholder="Ej: Compras del martes..." value={name} onChange={(e) => setName(e.target.value)} />

        <p className="section-label">Categoría</p>
        <div className="cat-tabs-scroll">
          {CATEGORIES.map(({ key, label, icon }) => (
            <button key={key} className={`cat-opt-tab ${category === key ? "cat-opt-tab--selected" : ""}`} onClick={() => handleCategoryChange(key)}>
              <span>{icon}</span>
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

      <Footer />
    </div>
  );
}

export default ListForm;
