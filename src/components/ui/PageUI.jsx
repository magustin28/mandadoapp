import Toast from "./Toast";
import ConfirmModal from "./ConfirmModal";

// Toast + modal de confirmación, listos para lo que devuelve usePageUI().
// Las seis páginas montaban exactamente este par al final del JSX.
function PageUI({ ui }) {
  return (
    <>
      <Toast toasts={ui.toasts} />
      {ui.confirm && (
        <ConfirmModal message={ui.confirm.message} confirmLabel={ui.confirm.confirmLabel} onConfirm={ui.handleConfirm} onCancel={ui.handleCancel} />
      )}
    </>
  );
}

export default PageUI;
