import { NavLink } from "react-router-dom";
import { IconHome2, IconLayoutGrid, IconStar } from "@tabler/icons-react";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <NavLink to="/" end className={({ isActive }) => (isActive ? "footer-btn active" : "footer-btn")}>
        <IconHome2 size={24} />
        <span className="footer-label">Inicio</span>
      </NavLink>
      <NavLink to="/categorias" className={({ isActive }) => (isActive ? "footer-btn active" : "footer-btn")}>
        <IconLayoutGrid size={24} />
        <span className="footer-label">Categorías</span>
      </NavLink>
      <NavLink to="/mis-items" className={({ isActive }) => (isActive ? "footer-btn active" : "footer-btn")}>
        <IconStar size={24} />
        <span className="footer-label">Mis items</span>
      </NavLink>
    </footer>
  );
}

export default Footer;
