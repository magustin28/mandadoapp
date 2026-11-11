import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import AuthField from "../components/ui/AuthField";
import AuthSwitch from "../components/ui/AuthSwitch";
import GoogleButton from "../components/ui/GoogleButton";
import { useAuth } from "../hooks/authContext";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();
  const { user, login, loginWithGoogle } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Si ya hay sesión, no mostramos el login.
  if (user) return <Navigate to="/" replace />;

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setError("Completá todos los campos");
      return;
    }
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    navigate("/", { replace: true });
  }

  async function handleGoogleLogin() {
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
        <p className="auth-subtitle">Tu lista de compras familiar</p>
      </div>

      <div className="auth-form">
        {error && <div className="auth-error">{error}</div>}

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
          placeholder="Tu contraseña"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
        />

        <button className="auth-btn-primary" onClick={handleLogin} disabled={loading}>
          {loading ? "Ingresando..." : "Ingresar"}
        </button>

        <GoogleButton label="Continuar con Google" onClick={handleGoogleLogin} />

        <AuthSwitch question="¿No tenés cuenta?" linkLabel="Registrate" to="/registro" />
      </div>
    </div>
  );
}

export default Login;
