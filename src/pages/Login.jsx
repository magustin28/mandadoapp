import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setError("Completá todos los campos");
      return;
    }
    const result = login(email, password);
    if (result.error) {
      setError(result.error);
      return;
    }
    navigate("/");
  }

  return (
    <div className="auth-page">
      <div className="auth-header">
        <h1 className="auth-title">MandadoApp</h1>
        <p className="auth-subtitle">Tu lista de compras familiar</p>
      </div>

      <div className="auth-form">
        {error && <div className="auth-error">{error}</div>}

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
            placeholder="Tu contraseña"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
          />
        </div>

        <button className="auth-btn-primary" onClick={handleLogin}>
          Ingresar
        </button>

        <div className="auth-divider">
          <span>o</span>
        </div>

        <button className="auth-btn-google" disabled>
          <img src="https://www.google.com/favicon.ico" width={18} height={18} alt="Google" />
          Continuar con Google
          <span className="auth-btn-coming">próximamente</span>
        </button>

        <p className="auth-link-text">
          ¿No tenés cuenta?{" "}
          <Link to="/registro" className="auth-link">
            Registrate
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
