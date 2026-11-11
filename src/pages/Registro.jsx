import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import AuthField from "../components/ui/AuthField";
import AuthSwitch from "../components/ui/AuthSwitch";
import GoogleButton from "../components/ui/GoogleButton";
import { useAuth } from "../hooks/authContext";
import "./Auth.css";

function Registro() {
  const navigate = useNavigate();
  const { user, register, loginWithGoogle } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  // Si ya hay sesión, no mostramos el registro.
  if (user) return <Navigate to="/" replace />;

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Completá todos los campos");
      return;
    }
    if (password !== password2) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    const result = await register(name, email, password);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.needsEmailConfirmation) {
      setInfo("Te enviamos un mail para confirmar tu cuenta. Revisá tu correo para poder ingresar.");
      return;
    }

    navigate("/", { replace: true });
  }

  async function handleGoogleRegister() {
    setError("");
    const result = await loginWithGoogle();
    if (result.error) {
      setError(result.error);
    }
    // Si no hay error, Supabase redirige a Google. No hace falta navigate() acá.
  }

  return (
    <div className="auth-page">
      <div className="auth-header">
        <h1 className="auth-title">Mandado App</h1>
        <p className="auth-subtitle">Creá tu cuenta</p>
      </div>

      <div className="auth-form">
        {error && <div className="auth-error">{error}</div>}
        {info && <div className="auth-info">{info}</div>}

        <AuthField
          label="Nombre"
          type="text"
          placeholder="Tu nombre"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
        />

        <AuthField
          label="Email"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
        />

        <AuthField
          label="Contraseña"
          type="password"
          placeholder="Mínimo 6 caracteres"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
        />

        <AuthField
          label="Repetir contraseña"
          type="password"
          placeholder="Repetí tu contraseña"
          value={password2}
          onChange={(e) => {
            setPassword2(e.target.value);
            setError("");
          }}
        />

        <button className="auth-btn-primary" onClick={handleRegister} disabled={loading}>
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </button>

        <GoogleButton label="Registrarse con Google" onClick={handleGoogleRegister} />

        <AuthSwitch question="¿Ya tenés cuenta?" linkLabel="Ingresá" to="/login" />
      </div>
    </div>
  );
}

export default Registro;
