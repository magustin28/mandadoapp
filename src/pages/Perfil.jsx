import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconUser, IconMail, IconLock, IconLogout, IconChevronLeft } from "@tabler/icons-react";
import { useAuth } from "../hooks/useAuth";
import { updateUser } from "../services/storage";
import { useToast } from "../hooks/useToast";
import { useConfirm } from "../hooks/useConfirm";
import Toast from "../components/ui/Toast";
import ConfirmModal from "../components/ui/ConfirmModal";
import Footer from "../components/layout/Footer";
import "./Perfil.css";
import "./Auth.css";

function Perfil() {
  const navigate = useNavigate();
  const { user, logout, getInitials } = useAuth();
  const { toasts, success, error } = useToast();
  const { confirm, ask, handleConfirm, handleCancel } = useConfirm();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  function handleSave() {
    if (!name.trim()) {
      error("El nombre no puede estar vacío");
      return;
    }
    if (password && password !== password2) {
      error("Las contraseñas no coinciden");
      return;
    }
    if (password && password.length < 4) {
      error("La contraseña debe tener al menos 4 caracteres");
      return;
    }
    const data = { name, email };
    if (password) data.password = password;
    updateUser(user.id, data);
    success("Datos actualizados correctamente");
  }

  async function handleLogout() {
    const confirmed = await ask("¿Cerrar sesión?");
    if (confirmed) {
      logout();
      navigate("/login");
    }
  }

  return (
    <div className="page">
      <div className="nav-bar">
        <button className="nav-back" onClick={() => navigate(-1)}>
          <IconChevronLeft size={20} />
        </button>
        <span className="nav-title">Mi perfil</span>
      </div>

      <div className="perfil-content">
        <div className="perfil-avatar-wrap">
          <div className="perfil-avatar">{getInitials()}</div>
          <p className="perfil-name">{user?.name}</p>
          <p className="perfil-email">{user?.email}</p>
        </div>

        <p className="section-label">Datos personales</p>

        <div className="perfil-form">
          <div className="perfil-field">
            <IconUser size={18} color="#8C7E6E" />
            <input className="perfil-input" type="text" placeholder="Tu nombre" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="perfil-field">
            <IconMail size={18} color="#8C7E6E" />
            <input className="perfil-input" type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>

        <p className="section-label">Cambiar contraseña</p>

        <div className="perfil-form">
          <div className="perfil-field">
            <IconLock size={18} color="#8C7E6E" />
            <input
              className="perfil-input"
              type="password"
              placeholder="Nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="perfil-field">
            <IconLock size={18} color="#8C7E6E" />
            <input
              className="perfil-input"
              type="password"
              placeholder="Repetir contraseña"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
            />
          </div>
        </div>

        <button className="auth-btn-primary" onClick={handleSave}>
          Guardar cambios
        </button>

        <button className="perfil-btn-logout" onClick={handleLogout}>
          <IconLogout size={18} color="#C0392B" />
          Cerrar sesión
        </button>
      </div>

      <Toast toasts={toasts} />
      {confirm && <ConfirmModal message={confirm.message} onConfirm={handleConfirm} onCancel={handleCancel} confirmLabel="Cerrar sesión" />}
      <Footer />
    </div>
  );
}

export default Perfil;
