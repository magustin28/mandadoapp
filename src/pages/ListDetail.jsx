import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IconPencil, IconBrandWhatsapp, IconUsers, IconTrash } from "@tabler/icons-react";
import Footer from "../components/layout/Footer";
import NavBar from "../components/layout/NavBar";
import PageUI from "../components/ui/PageUI";
import { useLists, useCollaborators } from "../hooks/useLists";
import { useAuth } from "../hooks/useAuth";
import { usePageUI } from "../hooks/usePageUI";
import { sendWhatsApp } from "../utils/whatsapp";
import { formatFecha } from "../utils/date";
import { formatearCantidadUnidad } from "../utils/items";
import { CATEGORY_LABELS } from "../utils/categories";
import "./ListDetail.css";

function ListDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getById, fetchById, removeList } = useLists();
  const { user } = useAuth();
  const { collaborators } = useCollaborators(id);
  const ui = usePageUI();

  const [list, setList] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // Primero busca en el estado ya cargado (rápido, sin ir a la red)
      const cached = getById(id);
      if (cached) {
        setList(cached);
        return;
      }
      // Si no está (ej: entraste directo por URL antes de que cargue la lista completa),
      // lo trae puntual desde Supabase
      try {
        const found = await fetchById(id);
        if (!cancelled) setList(found);
      } catch {
        if (!cancelled) navigate("/");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleDelete() {
    const borrada = await ui.confirmarYHacer({
      mensaje: "¿Eliminar esta lista?",
      accion: () => removeList(id),
      contextoError: "Error eliminando la lista:",
      mensajeError: "No se pudo eliminar la lista. Intentá de nuevo.",
    });
    if (borrada) navigate("/categorias");
  }

  if (!list || !user) return null;

  const owner = list.owner_id === user.id;
  const collab = collaborators.some((c) => c.user_id === user.id);
  const canEdit = owner || collab;
  const isEdited = Boolean(list.updatedAt && list.createdAt && new Date(list.updatedAt) > new Date(list.createdAt));
  const isShared = collaborators.length > 0;
  const collabNames = collaborators.map((c) => c.name).filter(Boolean);

  return (
    <div className="page">
      <NavBar
        title={list.name}
        subtitle={`${CATEGORY_LABELS[list.category]} · ${isEdited ? "Actualizada" : "Creada"} ${formatFecha(isEdited ? list.updatedAt : list.createdAt)}`}
      >
        {canEdit && (
          <button className="btn-nav-edit" onClick={() => navigate(`/lista/${id}/editar`)}>
            <IconPencil size={18} color="#4A6741" />
          </button>
        )}
      </NavBar>

      {isShared && (
        <div className="detail-shared-info">
          <IconUsers size={14} color="#4A6741" />
          {collab && list.ownerName && (
            <span>
              Compartida por <strong>{list.ownerName}</strong>
            </span>
          )}
          {owner && collabNames.length > 0 && (
            <span>
              Compartida con <strong>{collabNames.join(", ")}</strong>
            </span>
          )}
        </div>
      )}

      <div className="detail-content">
        <div className="detail-items">
          {list.items?.map((item) => {
            const cantidad = formatearCantidadUnidad(item);
            return (
              <div key={item.id} className="detail-item-row">
                <div className="detail-item-main">
                  <span className="detail-item-name">{item.name}</span>
                  {cantidad && <span className="detail-item-qty">· {cantidad}</span>}
                </div>
                <div className="detail-item-right">
                  {item.price && <span className="detail-item-price">${Number(item.price).toLocaleString("es-AR")}</span>}
                  {item.ver && <span className="detail-item-ver">VER</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bottom-actions">
        <button className="btn-wap" onClick={() => sendWhatsApp(list)}>
          <IconBrandWhatsapp size={18} color="#128C4F" />
          <span>Enviar por WhatsApp</span>
        </button>
        {owner && (
          <button className="btn-delete-list" onClick={handleDelete}>
            <IconTrash size={16} color="#C0392B" />
            Eliminar lista
          </button>
        )}
      </div>

      <PageUI ui={ui} />

      <Footer />
    </div>
  );
}

export default ListDetail;
