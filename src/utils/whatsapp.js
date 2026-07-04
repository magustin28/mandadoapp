const CATEGORY_LABELS = {
  supermercado: "Supermercado",
  verduleria: "Verdulería",
  otros: "Otros",
};

export function buildWhatsAppMessage(list) {
  const categoryLabel = CATEGORY_LABELS[list.category] || list.category;

  const itemLines = list.items
    .map((item) => {
      let line = `• ${item.name}`;
      if (item.quantity) line += ` — ${item.quantity}${item.unit ? " " + item.unit : ""}`;
      if (item.price) line += ` — $${Number(item.price).toLocaleString("es-AR")}`;
      if (item.ver) line += ` — VER`;
      return line;
    })
    .join("\n");

  const message = `*${list.name}*\n${itemLines}\n\n_Enviado desde Mandado_`;

  return message;
}

export function sendWhatsApp(list) {
  const message = buildWhatsAppMessage(list);
  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/?text=${encoded}`, "_blank");
}
