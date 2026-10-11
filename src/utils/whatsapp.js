import { formatearCantidadUnidad } from "./items";

export function buildWhatsAppMessage(list) {
  const itemLines = list.items
    .map((item) => {
      const cantidad = formatearCantidadUnidad(item);
      let line = `• ${item.name}`;
      if (cantidad) line += ` — ${cantidad}`;
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
