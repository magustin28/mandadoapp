import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { IconPlus, IconChevronRight, IconUsers, IconUser, IconLogout } from "@tabler/icons-react";
import Footer from "../components/layout/Footer";
import Toast from "../components/ui/Toast";
import ConfirmModal from "../components/ui/ConfirmModal";
import { useLists } from "../hooks/useLists";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { useConfirm } from "../hooks/useConfirm";
import { useBackClose } from "../hooks/useBackClose";
import { CATEGORIAS, getCategoria } from "../utils/categories";
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  const { lists, getByCategory } = useLists();
  const { user, logout, getInitials } = useAuth();
  const { toasts } = useToast();
  const { confirm, ask, handleConfirm, handleCancel } = useConfirm();

  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef(null);
  const menuBtnRef = useRef(null);

  const nombreUsuario = user?.name?.split(" ")[0] || "";

  const recientes = [...lists].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 3);

  // Cerrar el menú del avatar al tocar afuera.
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuAbierto && menuRef.current && !menuRef.current.contains(e.target) && !menuBtnRef.current?.contains(e.target)) {
        setMenuAbierto(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuAbierto]);

  // El gesto atrás del celular cierra el menú.
  useBackClose(menuAbierto, () => setMenuAbierto(false));

  function irAPerfil() {
    setMenuAbierto(false);
    navigate("/perfil");
  }

  async function handleLogout() {
    const confirmed = await ask("Vas a salir de tu cuenta en este dispositivo.", "Cerrar sesión");
    setMenuAbierto(false);
    if (!confirmed) return;
    await logout();
    navigate("/login");
  }

  return (
    <div className="page">
      <div className="home-header">
        <div>
          <h1 className="home-title">Hola{nombreUsuario ? ", " + nombreUsuario : ""} 👋</h1>
          <p className="home-subtitle">MandadoApp</p>
        </div>
        <div className="home-user">
          <button ref={menuBtnRef} className="home-avatar" onClick={() => setMenuAbierto((v) => !v)} aria-label="Cuenta">
            {getInitials()}
          </button>
          {menuAbierto && (
            <div ref={menuRef} className="home-menu">
              <button className="home-menu-item" onClick={irAPerfil}>
                <IconUser size={18} color="#8C7E6E" />
                Mi Perfil
              </button>
              <button className="home-menu-item" onClick={handleLogout}>
                <IconLogout size={18} color="#C0392B" />
                Cerrar sesión
              </button>
            </div>
          )}
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

      <Toast toasts={toasts} />
      {confirm && <ConfirmModal message={confirm.message} confirmLabel={confirm.confirmLabel} onConfirm={handleConfirm} onCancel={handleCancel} />}

      <Footer />
    </div>
  );
}

export default Home;
