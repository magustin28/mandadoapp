import { useSearchParams, useNavigate } from "react-router-dom";
import Footer from "../components/layout/Footer";
import { useLists } from "../hooks/useLists";
import { IconBuildingStore, IconLeaf, IconBasket, IconPencil, IconTrash, IconChevronRight } from "@tabler/icons-react";
import "./Categories.css";

const CATEGORIES = [
  { key: "supermercado", label: "Supermercado", icon: <IconBuildingStore size={18} /> },
  { key: "verduleria", label: "Verdulería", icon: <IconLeaf size={18} /> },
  { key: "otros", label: "Otros", icon: <IconBasket size={18} /> },
];

function Categories() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { lists, getByCategory, removeList } = useLists();

  const activeCat = searchParams.get("cat") || "supermercado";
  const filteredLists = getByCategory(activeCat);

  function handleDelete(id) {
    if (confirm("¿Eliminar esta lista?")) removeList(id);
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
                  <p className="list-name">{list.name}</p>
                  <p className="list-meta">
                    {list.items?.length || 0} items · {new Date(list.createdAt).toLocaleDateString("es-AR")}
                  </p>
                </div>
                <div className="cat-list-actions">
                  <button className="btn-edit" onClick={() => navigate(`/lista/${list.id}`)}>
                    <IconPencil size={18} color="#8C7E6E" />
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

      <Footer />
    </div>
  );
}

export default Categories;
