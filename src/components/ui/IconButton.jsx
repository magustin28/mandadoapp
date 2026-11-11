// Botón de acción de una fila (editar, copiar, borrar): solo el ícono.
// Categorías y Mis items repetían el mismo <button className="btn-icon">.
function IconButton({ icon: Icon, label, danger = false, size = 18, onClick }) {
  return (
    <button className={danger ? "btn-icon btn-icon--danger" : "btn-icon"} aria-label={label} onClick={onClick}>
      <Icon size={size} />
    </button>
  );
}

export default IconButton;
