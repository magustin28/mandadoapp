// Botón de acción de una fila (editar, copiar, borrar, quitar): solo el ícono.
// Categorías, Mis items y la fila de ítems de ListForm repetían el mismo
// <button className="btn-icon">.
// variantes: "default" (gris), "soft" (gris claro), "danger" (rojo).
const VARIANTES = { default: "", soft: "btn-icon--soft", danger: "btn-icon--danger" };

function IconButton({ icon: Icon, label, variant = "default", size = 18, onClick }) {
  return (
    <button className={`btn-icon ${VARIANTES[variant] || ""}`.trim()} aria-label={label} onClick={onClick}>
      <Icon size={size} />
    </button>
  );
}

export default IconButton;
