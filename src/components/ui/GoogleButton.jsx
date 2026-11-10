// Separador "o" + botón de Google: idénticos en Login y Registro.
function GoogleButton({ label, onClick }) {
  return (
    <>
      <div className="auth-divider">
        <span>o</span>
      </div>
      <button className="auth-btn-google" onClick={onClick}>
        <img src="https://www.google.com/favicon.ico" width={18} height={18} alt="Google" />
        {label}
      </button>
    </>
  );
}

export default GoogleButton;
