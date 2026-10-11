import { useNavigate } from "react-router-dom";
import { IconPlus, IconChevronRight, IconUsers } from "@tabler/icons-react";
import Footer from "../components/layout/Footer";
import { useLists } from "../hooks/useLists";
import { useAuth } from "../hooks/useAuth";
import { CATEGORIAS, getCategoria } from "../utils/categories";
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  const { lists, getByCategory } = useLists();
  const { getInitials } = useAuth();

  const recientes = [...lists].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 3);

  return (
    <div className="page">
      <div className="home-header">
        <div>
          <p className="home-greeting">Buen día 👋</p>
          <h1 className="home-title">MandadoApp</h1>
        </div>
        <div className="home-avatar" onClick={() => navigate("/perfil")}>
          {getInitials()}
        </div>
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
          {CATEGORIAS.map(({ key, label, color, Icon }) => (
            <button key={key} className="cat-card" onClick={() => navigate(`/categorias?cat=${key}`)}>
              <span className="cat-icon" style={{ background: color }}>
                <Icon size={20} color="#fff" />
              </span>
              <span className="cat-info">
                <span className="cat-name">{label}</span>
                <span className="cat-count">{getByCategory(key).length} listas</span>
              </span>
            </button>
          ))}
        </div>

        {recientes.length > 0 && (
          <>
            <p className="section-label">Recientes</p>
            <div className="recent-lists">
              {recientes.map((list) => (
                <button key={list.id} className="list-item" onClick={() => navigate(`/lista/${list.id}`)}>
                  <span className="list-dot" style={{ background: getCategoria(list.category)?.color }}></span>
                  <div className="list-info">
                    <p className="list-name">
                      {list.name}
                      {list.isShared && <IconUsers size={13} color="#4A6741" style={{ marginLeft: 6, verticalAlign: "middle" }} />}
                    </p>
                    <p className="list-meta">
                      {getCategoria(list.category)?.label} · {list.items?.length || 0} items
                    </p>
                  </div>
                  <IconChevronRight size={18} color="#C4BCB0" />
                </button>
              ))}{" "}
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
