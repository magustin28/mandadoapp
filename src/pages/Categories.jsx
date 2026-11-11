import { useSearchParams, useNavigate } from "react-router-dom";
import { IconPencil, IconTrash, IconCopy, IconPlus } from "@tabler/icons-react";
import Footer from "../components/layout/Footer";
import CategoryTabs from "../components/ui/CategoryTabs";
import IconButton from "../components/ui/IconButton";
import ListInfo from "../components/ui/ListInfo";
import PageUI from "../components/ui/PageUI";
import { useLists } from "../hooks/listsContext";
import { usePageUI } from "../hooks/usePageUI";
import { formatFecha, masRecientes } from "../utils/date";
import "./Categories.css";

function Categories() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { getByCategory, removeList } = useLists();
  const ui = usePageUI();

  const activeCat = searchParams.get("cat") || "supermercado";
  const filteredLists = masRecientes(getByCategory(activeCat));

  function handleDelete(id) {
    return ui.confirmarYHacer({
      mensaje: "¿Eliminar esta lista?",
      accion: () => removeList(id),
      exito: "Lista eliminada",
      contextoError: "Error eliminando la lista:",
      mensajeError: "No se pudo eliminar la lista. Intentá de nuevo.",
    });
  }

  function handleCopy(id) {
    // Abre el formulario precargado con la lista original: la copia se guarda recién
    // si el usuario toca Guardar.
    navigate(`/nueva?copia=${id}`);
  }

  return (
    <div className="page">
      <div className="cat-header">
        <h1 className="page-title">Categorías</h1>
      </div>

      <CategoryTabs value={activeCat} onChange={(cat) => setSearchParams({ cat })} />

      <div className="cat-content">
        {filteredLists.length === 0 ? (
          <div className="empty-state">
            <p>No hay listas en esta categoría.</p>
            <button className="btn-go-new" onClick={() => navigate(`/nueva?cat=${activeCat}`)}>
              Crear lista nueva
            </button>
          </div>
        ) : (
          <div className="cat-lists">
            {filteredLists.map((list) => (
              <div key={list.id} className="cat-list-card">
                <div className="cat-list-info" onClick={() => navigate(`/lista/${list.id}`)}>
                  <ListInfo list={list} meta={`${list.items?.length || 0} items · ${formatFecha(list.updatedAt || list.createdAt)}`} />
                </div>
                <div className="cat-list-actions">
                  <IconButton icon={IconPencil} label="Editar lista" onClick={() => navigate(`/lista/${list.id}/editar`)} />
                  <IconButton icon={IconCopy} label="Duplicar lista" onClick={() => handleCopy(list.id)} />
                  <IconButton icon={IconTrash} label="Eliminar lista" variant="danger" onClick={() => handleDelete(list.id)} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {filteredLists.length > 0 && (
        <button className="btn-fab" onClick={() => navigate(`/nueva?cat=${activeCat}`)}>
          <IconPlus size={22} />
        </button>
      )}

      <PageUI ui={ui} />

      <Footer />
    </div>
  );
}

export default Categories;
