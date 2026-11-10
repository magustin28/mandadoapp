import { Link } from "react-router-dom";

// Pie de los formularios de acceso: "¿No tenés cuenta? Registrate".
function AuthSwitch({ question, linkLabel, to }) {
  return (
    <p className="auth-link-text">
      {question}{" "}
      <Link to={to} className="auth-link">
        {linkLabel}
      </Link>
    </p>
  );
}

export default AuthSwitch;
