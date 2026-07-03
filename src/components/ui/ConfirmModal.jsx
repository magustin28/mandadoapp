import "./ConfirmModal.css";

function ConfirmModal({ message, onConfirm, onCancel, confirmLabel = "Eliminar" }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <p className="modal-message">{message}</p>
        <div className="modal-actions">
          <button className="modal-btn-cancel" onClick={onCancel}>
            Cancelar
          </button>
          <button className="modal-btn-confirm" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
