import { useState, useEffect, useRef } from "react";
import { IconPencil, IconTrash, IconCheck, IconPlus } from "@tabler/icons-react";
import Footer from "../components/layout/Footer";
import CategoryTabs from "../components/ui/CategoryTabs";
import IconButton from "../components/ui/IconButton";
import PageUI from "../components/ui/PageUI";
import PriceBadge from "../components/ui/PriceBadge";
import { usePreloadedItems, usePriceHistory } from "../hooks/listsData";
import { useBackClose } from "../hooks/useBackClose";
import { usePageUI } from "../hooks/usePageUI";
import { UNIDADES, normalizarUnidad, ordenarPorNombre } from "../utils/items";
import "./MisItems.css";

function MisItems() {
  const [activeCat, setActiveCat] = useState("supermercado");
  const [newName, setNewName] = useState("");
  const [newUnit, setNewUnit] = useState("unid.");
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const { items, addItem, editItem, removeItem } = usePreloadedItems(activeCat);
  const { getByName: getPriceByName } = usePriceHistory();
  const ui = usePageUI();

  // Se muestran siempre en orden alfabético (colación española).
  const itemsOrdenados = ordenarPorNombre(items);

  // Al editar una fila, tocar afuera (o el gesto atrás del celular) cancela la edición.
  const editRowRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (editingId && editRowRef.current && !editRowRef.current.contains(e.target)) {
        setEditingId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [editingId]);

  useBackClose(Boolean(editingId), () => setEditingId(null));

  async function handleAdd() {
    if (!newName.trim()) return;
    await addItem({ name: newName.trim(), unit: newUnit });
    setNewName("");
    setNewUnit("unid.");
  }

  function handleEditStart(item) {
    setEditingId(item.id);
    setEditData({ name: item.name, unit: item.unit });
  }

  async function handleEditSave(id) {
    await editItem(id, editData);
    setEditingId(null);
  }

  function handleDelete(id) {
    return ui.confirmarYHacer({
      mensaje: "¿Eliminar este item?",
      accion: () => removeItem(id),
      exito: "Item eliminado",
      contextoError: "Error eliminando el item:",
      mensajeError: "No se pudo eliminar el item. Intentá de nuevo.",
    });
  }

  return (
    <div className="page">
      <div className="mis-header">
        <h1 className="page-title">Mis items</h1>
        <p className="mis-subtitle">Items sugeridos al crear una lista</p>
      </div>

      <CategoryTabs value={activeCat} onChange={setActiveCat} />

      <div className="mis-content">
        <div className="items-container">
          {itemsOrdenados.map((item) => {
            const unidadEdit = normalizarUnidad(editData.unit) || "";
            const precio = getPriceByName(item.name)?.price;
            return (
              <div key={item.id} className="mis-item-row" ref={editingId === item.id ? editRowRef : undefined}>
                {editingId === item.id ? (
                  <>
                    <input className="item-input-name" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
                    <select className="item-input-unit" value={unidadEdit} onChange={(e) => setEditData({ ...editData, unit: e.target.value })}>
                      <option value="">—</option>
                      {unidadEdit && !UNIDADES.includes(unidadEdit) && <option value={unidadEdit}>{unidadEdit}</option>}
                      {UNIDADES.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                    <button className="btn-confirm" onClick={() => handleEditSave(item.id)}>
                      <IconCheck size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="mis-item-name">{item.name}</span>
                    <span className="mis-item-unit">{normalizarUnidad(item.unit) || ""}</span>
                    <PriceBadge price={precio} />
                    <IconButton icon={IconPencil} label="Editar item" onClick={() => handleEditStart(item)} />
                    <IconButton icon={IconTrash} label="Eliminar item" variant="danger" onClick={() => handleDelete(item.id)} />
                  </>
                )}
              </div>
            );
          })}

          <div className="mis-add-row">
            <input
              className="item-input-name"
              placeholder="Nuevo item..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <select className="item-input-unit" value={newUnit} onChange={(e) => setNewUnit(e.target.value)}>
              <option value="">—</option>
              {UNIDADES.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
            <button className="btn-add-item" onClick={handleAdd}>
              <IconPlus size={16} />
            </button>
          </div>
        </div>
      </div>

      <PageUI ui={ui} />

      <Footer />
    </div>
  );
}

export default MisItems;
