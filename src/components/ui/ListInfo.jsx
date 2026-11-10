import { IconUsers } from "@tabler/icons-react";

// Título de una lista en un listado: nombre + marca de compartida + la línea de detalle.
// El Home y Categorías escribían el mismo par de párrafos con el ícono "compartida".
// `meta` se recibe armado porque cada pantalla muestra datos distintos.
function ListInfo({ list, meta }) {
  return (
    <>
      <p className="list-name">
        {list.name}
        {list.isShared && <IconUsers size={14} className="icon-shared" />}
      </p>
      <p className="list-meta">{meta}</p>
    </>
  );
}

export default ListInfo;
