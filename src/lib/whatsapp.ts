import type { MouseEvent } from "react";

export const WHATSAPP_QUOTE_URL =
  "https://wa.me/393520351738?text=Ciao%2C%20vorrei%20richiedere%20un%20preventivo%20gratuito%20per%20i%20vostri%20pavimenti.";

const WHATSAPP_APP_URL =
  "whatsapp://send?phone=393520351738&text=Ciao%2C%20vorrei%20richiedere%20un%20preventivo%20gratuito%20per%20i%20vostri%20pavimenti.";

export const openWhatsAppQuote = (event: MouseEvent<HTMLAnchorElement>) => {
  event.preventDefault();
  event.stopPropagation();

  const whatsappWindow = window.open(WHATSAPP_APP_URL, "_blank", "noopener,noreferrer");

  window.setTimeout(() => {
    if (whatsappWindow && !whatsappWindow.closed) {
      whatsappWindow.location.href = WHATSAPP_QUOTE_URL;
      return;
    }

    window.open(WHATSAPP_QUOTE_URL, "_blank", "noopener,noreferrer");
  }, 900);
};