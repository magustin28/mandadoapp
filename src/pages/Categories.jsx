import { useSearchParams, useNavigate } from "react-router-dom";
import Footer from "../components/layout/Footer";
import { useLists } from "../hooks/useLists";
import { IconPencil, IconTrash, IconCopy, IconBuildingStore, IconLeaf, IconBasket, IconUsers, IconPlus } from "@tabler/icons-react";
import "./Categories.css";
import { useToast } from "../hooks/useToast";
import { useConfirm } from "../hooks/useConfirm";
import Toast from "../components/ui/Toast";
import ConfirmModal from "../components/ui/ConfirmModal";
import { getListsByCollaborator, getCurrentUser, isSharedList } from "../services/storage";

const CATEGORIES = [
  { key: "supermercado", label: "Supermercado", icon: <IconBuildingStore size={18} /> },
  { key: "verduleria", label: "Verdulería", icon: <IconLeaf size={18} /> },
  { key: "otros", label: "Otros", icon: <IconBasket size={18} /> },
];

function Categories() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { lists, getByCategory, removeList, duplicateList } = useLists();

  const activeCat = searchParams.get("cat") || "supermercado";
  const filteredLists = getByCategory(activeCat).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  const { toasts, success } = useToast();
  const { confirm, ask, handleConfirm, handleCancel } = useConfirm();

  const currentUser = getCurrentUser();
  const collabListIds = currentUser ? getListsByCollaborator(currentUser.id).map((c) => c.list_id) : [];

  async function handleDelete(id) {
    const confirmed = await ask("¿Eliminar esta lista?");
    if (confirmed) {
      removeList(id);
      success("Lista eliminada");
    }
  }

  function handleCopy(id) {
    const copy = duplicateList(id);
    navigate(`/lista/${copy.id}`);
  }

  return (
    <div className="page">
      <div className="cat-header">
        <h1 className="home-title">Categorías</h1>
      </div>
      <div className="cat-tabs">
        {CATEGORIES.map(({ key, label, icon }) => (
          <button key={key} className={`cat-tab ${activeCat === key ? "cat-tab--active" : ""}`} onClick={() => setSearchParams({ cat: key })}>
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="cat-content">
        {filteredLists.length === 0 ? (
          <div className="empty-state">
            <p>No hay listas en esta categoría.</p>
            <button className="btn-go-new" onClick={() => navigate("/nueva")}>
              Crear lista nueva
            </button>
          </div>
        ) : (
          <div className="cat-lists">
            {filteredLists.map((list) => (
              <div key={list.id} className="cat-list-card">
                <div className="cat-list-info" onClick={() => navigate(`/lista/${list.id}`)}>
                  {" "}
                  <p className="list-name">
                    {list.name}
                    {isSharedList(list.id) && (
                      <IconUsers size={14} color="#4A6741" style={{ marginLeft: 6, verticalAlign: "middle", flexShrink: 0 }} />
                    )}
                  </p>
                  <p className="list-meta">
                    {list.items?.length || 0} items · {new Date(list.createdAt).toLocaleDateString("es-AR")}
                  </p>
                </div>{" "}
                <div className="cat-list-actions">
                  <button className="btn-edit" onClick={() => navigate(`/lista/${list.id}/editar`)}>
                    <IconPencil size={18} color="#8C7E6E" />
                  </button>
                  <button className="btn-copy" onClick={() => handleCopy(list.id)}>
                    <IconCopy size={18} color="#8C7E6E" />
                  </button>
                  <button className="btn-delete" onClick={() => handleDelete(list.id)}>
                    <IconTrash size={18} color="#C0392B" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {filteredLists.length > 0 && (
        <button className="btn-fab" onClick={() => navigate("/nueva")}>
          <IconPlus size={22} color="#fff" />
        </button>
      )}

      <Toast toasts={toasts} />
      {confirm && <ConfirmModal message={confirm.message} onConfirm={handleConfirm} onCancel={handleCancel} />}

      <Footer />
    </div>
  );
}

export default Categories;
