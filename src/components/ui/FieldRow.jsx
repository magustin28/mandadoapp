// Fila de campo de formulario con ícono (Perfil): ícono + input.
// Las cuatro filas del Perfil repetían esta misma estructura.
function FieldRow({ icon: Icon, ...inputProps }) {
  return (
    <div className="perfil-field">
      <Icon size={18} className="field-icon" />
      <input className="perfil-input" {...inputProps} />
    </div>
  );
}

export default FieldRow;
