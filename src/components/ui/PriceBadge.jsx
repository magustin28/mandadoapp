// Precio de la última compra de un ítem (sale del historial de precios).
// Lo usa el formulario de lista y "Mis items".
function PriceBadge({ price }) {
  if (!price) return null;
  return <span className="item-price-badge">${Number(price).toLocaleString("es-AR")}</span>;
}

export default PriceBadge;
