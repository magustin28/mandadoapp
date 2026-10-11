import { useState } from "react";
import Footer from "../components/layout/Footer";
import { usePreloadedItems } from "../hooks/useLists";
import { IconPencil, IconTrash, IconCheck, IconPlus } from "@tabler/icons-react";
import { CATEGORIAS } from "../utils/categories";
import "./MisItems.css";
import { useToast } from "../hooks/useToast";
import { useConfirm } from "../hooks/useConfirm";
import Toast from "../components/ui/Toast";
import ConfirmModal from "../components/ui/ConfirmModal";
import { UNIDADES, normalizarUnidad } from "../utils/items";


function MisItems() {
  const [activeCat, setActiveCat] = useState("supermercado");
  const [newName, setNewName] = useState("");
  const [newUnit, setNewUnit] = useState("unid.");
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const { items, addItem, editItem, removeItem } = usePreloadedItems(activeCat);

  const { toasts, success } = useToast();
  const { confirm, ask, handleConfirm, handleCancel } = useConfirm();

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

  async function handleDelete(id) {
    const confirmed = await ask("¿Eliminar este item?");
    if (confirmed) {
      await removeItem(id);
      success("Item eliminado");
    }
  }

  return (
    <div className="page">
      <div className="mis-header">
        <h1 className="home-title">Mis items</h1>
        <p className="mis-subtitle">Items sugeridos al crear una lista</p>
      </div>

      <div className="cat-tabs">
        {CATEGORIAS.map(({ key, label, Icon }) => (
          <button key={key} className={`cat-tab ${activeCat === key ? "cat-tab--active" : ""}`} onClick={() => setActiveCat(key)}>
            <span>
              <Icon size={18} />
            </span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="mis-content">
        <div className="items-container">
          {items.map((item) => {
            const unidadEdit = normalizarUnidad(editData.unit) || "";
            return (
              <div key={item.id} className="mis-item-row">
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
                      <IconCheck size={16} color="#fff" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="mis-item-name">{item.name}</span>
                    <span className="mis-item-unit">{normalizarUnidad(item.unit) || ""}</span>
                    <button className="btn-edit" onClick={() => handleEditStart(item)}>
                      <IconPencil size={18} color="#8C7E6E" />
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(item.id)}>
                      <IconTrash size={18} color="#C0392B" />
                    </button>
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
              <IconPlus size={16} color="#fff" />
            </button>
          </div>
        </div>
      </div>

      <Toast toasts={toasts} />
      {confirm && <ConfirmModal message={confirm.message} onConfirm={handleConfirm} onCancel={handleCancel} />}

      <Footer />
    </div>
  );
}

export default MisItems;
