import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IconChevronLeft, IconPencil, IconBrandWhatsapp, IconUsers } from "@tabler/icons-react";
import Footer from "../components/layout/Footer";
import { useLists } from "../hooks/useLists";
import { sendWhatsApp } from "../utils/whatsapp";
import { isOwner, isCollaborator, getCollaboratorsByList, getUsers, getCurrentUser } from "../services/storage";
import "./ListDetail.css";

const CATEGORY_LABELS = {
  supermercado: "Supermercado",
  verduleria: "Verdulería",
  otros: "Otros",
};

function ListDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getById } = useLists();

  const [list, setList] = useState(null);

  const owner = isOwner(id);
  const collab = isCollaborator(id);
  const canEdit = owner || collab;

  const currentUser = getCurrentUser();
  const collaborators = getCollaboratorsByList(id);
  const users = getUsers();

  const ownerUser = users.find((u) => u.id === list?.owner_id);
  const isShared = collab || collaborators.length > 0;

  const collabNames = collaborators.map((c) => users.find((u) => u.id === c.user_id)?.name).filter(Boolean);

  useEffect(() => {
    const found = getById(id);
    if (!found) {
      navigate("/");
      return;
    }
    setList(found);
  }, [id]);

  if (!list) return null;

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
          {collab && ownerUser && (
            <span>
              Compartida por <strong>{ownerUser.name}</strong>
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
