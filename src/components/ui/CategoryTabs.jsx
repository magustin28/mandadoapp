import { CATEGORIAS } from "../../utils/categories";

// Pestañas para elegir categoría: el mismo bloque estaba copiado en Categorías y en Mis items,
// que solo cambiaban la forma de guardar la categoría activa.
function CategoryTabs({ value, onChange }) {
  return (
    <div className="cat-tabs">
      {CATEGORIAS.map(({ key, label, Icon }) => (
        <button key={key} className={`cat-tab ${value === key ? "cat-tab--active" : ""}`} onClick={() => onChange(key)}>
          <span>
            <Icon size={18} />
          </span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

export default CategoryTabs;
