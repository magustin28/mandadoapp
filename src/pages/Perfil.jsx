import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IconUser, IconMail, IconLock, IconTrash } from "@tabler/icons-react";
import FieldRow from "../components/ui/FieldRow";
import Footer from "../components/layout/Footer";
import NavBar from "../components/layout/NavBar";
import PageUI from "../components/ui/PageUI";
import { useAuth } from "../hooks/authContext";
import { usePageUI } from "../hooks/usePageUI";
import { deleteMyAccount } from "../services/storage";
import "./Perfil.css";
import "./Auth.css";

function Perfil() {
  const navigate = useNavigate();
  const { user, logout, updateProfile, getInitials } = useAuth();
  const ui = usePageUI();
  // Los avisos se usan en varios handlers de esta pantalla.
  const { success, error } = ui;

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
    setDeleting(true);
    const borrada = await ui.confirmarYHacer({
      mensaje: "Se van a borrar tus listas, colaboradores e historial. Esta acción no se puede deshacer.",
      confirmLabel: "Eliminar mi cuenta",
      accion: deleteMyAccount,
      contextoError: "Error eliminando la cuenta:",
      mensajeError: "No se pudo eliminar la cuenta. Intentá de nuevo.",
    });
    setDeleting(false);
    if (!borrada) return;

    await logout();
    navigate("/login");
  }

  return (
    <div className="page">
      <NavBar title="Mi perfil" />

      <div className="perfil-content">
        <div className="perfil-avatar-wrap">
          <div className="perfil-avatar">{getInitials()}</div>
          <p className="perfil-name">{user?.name}</p>
          <p className="perfil-email">{user?.email}</p>
        </div>

        <p className="section-label">Datos personales</p>

        <div className="perfil-form">
          <FieldRow icon={IconUser} type="text" placeholder="Tu nombre" value={name} onChange={(e) => setName(e.target.value)} />
          <FieldRow icon={IconMail} type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <p className="section-label">Cambiar contraseña</p>

        <div className="perfil-form">
          <FieldRow icon={IconLock} type="password" placeholder="Nueva contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
          <FieldRow
            icon={IconLock}
            type="password"
            placeholder="Repetir contraseña"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
          />
        </div>

        <button className="auth-btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>

        <button className="perfil-btn-danger" onClick={handleDeleteAccount} disabled={deleting}>
          <IconTrash size={16} />
          {deleting ? "Eliminando cuenta..." : "Eliminar mi cuenta"}
        </button>
      </div>

      <PageUI ui={ui} />
      <Footer />
    </div>
  );
}

export default Perfil;
