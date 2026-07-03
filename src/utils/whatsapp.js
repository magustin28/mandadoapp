const CATEGORY_LABELS = {
  supermercado: "Supermercado",
  verduleria: "Verduleria",
  otros: "Otros",
};

export function buildWhatsAppMessage(list) {
  const categoryLabel = CATEGORY_LABELS[list.category] || list.category;

  const itemLines = list.items.map((item) => `• ${item.name} — ${item.quantity} ${item.unit}`).join("\n");

  const message = `*${list.name}*\n_${categoryLabel}_\n\n${itemLines}\n\n_Enviado desde MandadoApp_`;

  return message;
}

export function sendWhatsApp(list) {
  const message = buildWhatsAppMessage(list);
  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/?text=${encoded}`, "_blank");
}
