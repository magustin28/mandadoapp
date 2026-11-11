import { IconTrash } from "@tabler/icons-react";

// Botón de "eliminar" con texto: la lista (ListForm y ListDetail) y la cuenta
// (Perfil) repetían la misma estructura de botón rojo con el ícono del tacho.
// `subtle` es la variante sin la caja roja (Perfil).
function DeleteButton({ label = "Eliminar lista", subtle = false, disabled = false, onClick }) {
  return (
    <button className={`btn-delete-list ${subtle ? "btn-delete-list--subtle" : ""}`.trim()} onClick={onClick} disabled={disabled}>
      <IconTrash size={16} />
      {label}
    </button>
  );
}

export default DeleteButton;
