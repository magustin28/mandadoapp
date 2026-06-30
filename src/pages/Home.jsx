import { useNavigate } from "react-router-dom";
import { IconPlus, IconBuildingStore, IconLeaf, IconBasket, IconChevronRight } from "@tabler/icons-react";
import Footer from "../components/layout/Footer";
import { useLists } from "../hooks/useLists";
import "./Home.css";

const CATEGORIES = {
  supermercado: { label: "Supermercado", icon: <IconBuildingStore size={22} color="#4A6741" /> },
  verduleria: { label: "Verdulería", icon: <IconLeaf size={22} color="#3B7A47" /> },
  otros: { label: "Otros", icon: <IconBasket size={22} color="#B87333" /> },
};

function Home() {
  const navigate = useNavigate();
  const { lists, getByCategory } = useLists();

  const recientes = lists.slice(-3).reverse();

  return (
    <div className="page">
      <div className="home-header">
        <div>
          <p className="home-greeting">Buen día 👋</p>
          <h1 className="home-title">Mis listas</h1>
        </div>
        <div className="home-avatar">MD</div>
      </div>

      <div className="home-content">
        <p className="section-label">Nueva lista</p>
        <button className="btn-new-list" onClick={() => navigate("/nueva")}>
          <div className="btn-new-icon">
            <IconPlus size={22} color="#fff" />
          </div>
          <div>
            <p className="btn-new-main">Crear lista nueva</p>
            <p className="btn-new-sub">Supermercado, verdulería u otro</p>
          </div>
          <span className="btn-new-arrow">
            <IconChevronRight size={20} color="#B0A89E" />
          </span>
        </button>

        <p className="section-label">Categorías</p>
        <div className="categories-grid">
          {Object.entries(CATEGORIES).map(([key, { label, icon }]) => (
            <button key={key} className="cat-card" onClick={() => navigate(`/categorias?cat=${key}`)}>
              <span className="cat-icon">{icon}</span>
              <span className="cat-name">{label}</span>
              <span className="cat-count">{getByCategory(key).length} listas</span>
            </button>
          ))}
        </div>

        {recientes.length > 0 && (
          <>
            <p className="section-label">Recientes</p>
            <div className="recent-lists">
              {recientes.map((list) => (
                <button key={list.id} className="list-item" onClick={() => navigate(`/lista/${list.id}`)}>
                  <span className={`list-dot dot-${list.category}`}></span>
                  <div className="list-info">
                    <p className="list-name">{list.name}</p>
                    <p className="list-meta">
                      {CATEGORIES[list.category]?.label} · {list.items?.length || 0} items
                    </p>
                  </div>
                  <IconChevronRight size={18} color="#C4BCB0" />
                </button>
              ))}
            </div>
          </>
        )}

        {lists.length === 0 && (
          <div className="empty-state">
            <p>Todavía no tenés listas.</p>
            <p>Creá una para empezar.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default Home;
