import { IconTrash } from "@tabler/icons-react";

// Botón "Eliminar lista" del pie de las pantallas de lista (ListForm y ListDetail
// tenían el mismo bloque copiado).
function DeleteListButton({ onClick, label = "Eliminar lista" }) {
  return (
    <button className="btn-delete-list" onClick={onClick}>
      <IconTrash size={16} />
      {label}
    </button>
  );
}

export default DeleteListButton;
