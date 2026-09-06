import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IconChevronLeft, IconPencil, IconBrandWhatsapp, IconUsers } from "@tabler/icons-react";
import Footer from "../components/layout/Footer";
import { useLists, useCollaborators } from "../hooks/useLists";
import { useAuth } from "../hooks/useAuth";
import { sendWhatsApp } from "../utils/whatsapp";
import "./ListDetail.css";

const CATEGORY_LABELS = {
  supermercado: "Supermercado",
  verduleria: "Verdulería",
  otros: "Otros",
};

function ListDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getById, fetchById } = useLists();
  const { user } = useAuth();
  const { collaborators } = useCollaborators(id);

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

  if (!list || !user) return null;

  const owner = list.owner_id === user.id;
  const collab = collaborators.some((c) => c.user_id === user.id);
  const canEdit = owner || collab;
  const isShared = collaborators.length > 0;
  const collabNames = collaborators.map((c) => c.name).filter(Boolean);

  return (
    <div className="page">
      <div className="nav-bar">
        <button className="nav-back" onClick={() => navigate(-1)}>
          <IconChevronLeft size={20} />
        </button>
        <div className="nav-info">
          <span className="nav-title">{list.name}</span>
          <span className="nav-subtitle">
            {CATEGORY_LABELS[list.category]} · {new Date(list.createdAt).toLocaleDateString("es-AR")}
          </span>
        </div>
        {canEdit && (
          <button className="btn-nav-edit" onClick={() => navigate(`/lista/${id}/editar`)}>
            <IconPencil size={18} color="#4A6741" />
          </button>
        )}
      </div>

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
          {list.items?.map((item) => (
            <div key={item.id} className="detail-item-row">
              <span className="detail-item-name">{item.name}</span>
              <div className="detail-item-right">
                {item.price && <span className="detail-item-price">${Number(item.price).toLocaleString("es-AR")}</span>}
                {item.ver && <span className="detail-item-ver">VER</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bottom-actions">
        <button className="btn-wap" onClick={() => sendWhatsApp(list)}>
          <IconBrandWhatsapp size={18} color="#128C4F" />
          <span>Enviar por WhatsApp</span>
        </button>
      </div>

      <Footer />
    </div>
  );
}

export default ListDetail;
