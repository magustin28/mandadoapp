import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./Auth.css";

function Registro() {
  const navigate = useNavigate();
  const { register, loginWithGoogle } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Completá todos los campos");
      return;
    }
    if (password !== password2) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (password.length < 4) {
      setError("La contraseña debe tener al menos 4 caracteres");
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

    navigate("/");
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
        <h1 className="auth-title">MandadoApp</h1>
        <p className="auth-subtitle">Creá tu cuenta</p>
      </div>

      <div className="auth-form">
        {error && <div className="auth-error">{error}</div>}
        {info && <div className="auth-info">{info}</div>}

        <div className="auth-field">
          <label className="auth-label">Nombre</label>
          <input
            className="auth-input"
            type="text"
            placeholder="Tu nombre"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
          />
        </div>

        <div className="auth-field">
          <label className="auth-label">Email</label>
          <input
            className="auth-input"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
          />
        </div>

        <div className="auth-field">
          <label className="auth-label">Contraseña</label>
          <input
            className="auth-input"
            type="password"
            placeholder="Mínimo 4 caracteres"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
          />
        </div>

        <div className="auth-field">
          <label className="auth-label">Repetir contraseña</label>
          <input
            className="auth-input"
            type="password"
            placeholder="Repetí tu contraseña"
            value={password2}
            onChange={(e) => {
              setPassword2(e.target.value);
              setError("");
            }}
          />
        </div>

        <button className="auth-btn-primary" onClick={handleRegister} disabled={loading}>
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </button>

        <div className="auth-divider">
          <span>o</span>
        </div>

        <button className="auth-btn-google" onClick={handleGoogleRegister}>
          <img src="https://www.google.com/favicon.ico" width={18} height={18} alt="Google" />
          Registrarse con Google
        </button>

        <p className="auth-link-text">
          ¿Ya tenés cuenta?{" "}
          <Link to="/login" className="auth-link">
            Ingresá
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Registro;
