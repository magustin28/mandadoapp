// Pantalla de carga mientras se restaura la sesión.
// Antes vivía dentro de App.jsx con los estilos en style={{}}; ahora usa las
// clases .loader* de styles/components.css.
function LoadingScreen() {
  return (
    <div className="loader">
      <div className="loader-logo">MA</div>
      <p className="loader-text">Cargando...</p>
    </div>
  );
}

export default LoadingScreen;
