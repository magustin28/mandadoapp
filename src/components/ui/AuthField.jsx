// Campo de los formularios de acceso (etiqueta arriba + input).
// Login y Registro repetían el mismo bloque de cinco líneas por campo.
function AuthField({ label, ...inputProps }) {
  return (
    <div className="auth-field">
      <label className="auth-label">{label}</label>
      <input className="auth-input" {...inputProps} />
    </div>
  );
}

export default AuthField;
