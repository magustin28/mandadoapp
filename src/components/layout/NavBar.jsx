import { useNavigate } from "react-router-dom";
import { IconChevronLeft } from "@tabler/icons-react";
import { goBack } from "../../utils/navigation";

// Barra superior de las páginas internas: botón de volver + título (y subtítulo opcional).
// Lo que va a la derecha (un botón de acción) se pasa como children.
// Perfil, ListDetail y ListForm repetían el mismo bloque de cuatro líneas.
function NavBar({ title, subtitle, children }) {
  const navigate = useNavigate();

  return (
    <div className="nav-bar">
      <button className="nav-back" onClick={() => goBack(navigate)} aria-label="Volver">
        <IconChevronLeft size={20} />
      </button>
      <div className="nav-info">
        <span className="nav-title">{title}</span>
        {subtitle && <span className="nav-subtitle">{subtitle}</span>}
      </div>
      {children}
    </div>
  );
}

export default NavBar;
