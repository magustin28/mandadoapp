import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IconUser, IconMail, IconLock, IconChevronLeft, IconTrash } from "@tabler/icons-react";
import { useAuth } from "../hooks/useAuth";
import { goBack } from "../utils/navigation";
import { deleteMyAccount } from "../services/storage";
import { useToast } from "../hooks/useToast";
import { useConfirm } from "../hooks/useConfirm";
import Toast from "../components/ui/Toast";
import ConfirmModal from "../components/ui/ConfirmModal";
import Footer from "../components/layout/Footer";
import "./Perfil.css";
import "./Auth.css";

function Perfil() {
  const navigate = useNavigate();
  const { user, logout, updateProfile, getInitials } = useAuth();
  const { toasts, success, error } = useToast();
  const { confirm, ask, handleConfirm, handleCancel } = useConfirm();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  async function handleSave() {
    if (!name.trim()) {
      error("El nombre no puede estar vacío");
      return;
    }
    if (password && password !== password2) {
      error("Las contraseñas no coinciden");
      return;
    }
    if (password && password.length < 6) {
      error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setSaving(true);
    const result = await updateProfile({ name, email, password: password || undefined });
    setSaving(false);

    if (result.error) {
      error(result.error);
      return;
    }

    setPassword("");
    setPassword2("");

    if (result.emailChangePending) {
      success("Te enviamos un mail a la nueva dirección para confirmar el cambio");
    } else {
      success("Datos actualizados correctamente");
    }
  }

  async function handleDeleteAccount() {
    const confirmed = await ask("Se van a borrar tus listas, colaboradores e historial. Esta acción no se puede deshacer.", "Eliminar mi cuenta");
    if (!confirmed) return;

    setDeleting(true);
    try {
      await deleteMyAccount();
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Error eliminando la cuenta:", err);
      error("No se pudo eliminar la cuenta. Intentá de nuevo.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="page">
      <div className="nav-bar">
        <button className="nav-back" onClick={() => goBack(navigate)}>
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

        <button className="auth-btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>

        <button className="perfil-btn-danger" onClick={handleDeleteAccount} disabled={deleting}>
          <IconTrash size={16} color="#C0392B" />
          {deleting ? "Eliminando cuenta..." : "Eliminar mi cuenta"}
        </button>
      </div>

      <Toast toasts={toasts} />
      {confirm && <ConfirmModal message={confirm.message} confirmLabel={confirm.confirmLabel} onConfirm={handleConfirm} onCancel={handleCancel} />}
      <Footer />
    </div>
  );
}

export default Perfil;
