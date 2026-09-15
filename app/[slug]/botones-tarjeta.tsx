"use client";

import type { Negocio } from "@/lib/negocios";

type TipoEvento = "click_google" | "click_wa" | "click_menu" | "click_social";

function registrarClick(slug: string, tipo: TipoEvento) {
  fetch("/api/evento", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug, tipo }),
    keepalive: true
  }).catch(() => {});
}

export function BotonesTarjeta({ negocio }: { negocio: Negocio }) {
  return (
    <>
      <a
        href={negocio.googleReviewUrl}
        target="_blank"
        rel="noreferrer"
        className="btn btn-google"
        onClick={() => registrarClick(negocio.slug, "click_google")}
      >
        ⭐ Déjanos tu reseña en Google
      </a>

      {negocio.facebook && (
        <a
          href={negocio.facebook}
          target="_blank"
          rel="noreferrer"
          className="btn btn-facebook"
          onClick={() => registrarClick(negocio.slug, "click_social")}
        >
          📘 Síguenos en Facebook
        </a>
      )}
      {!negocio.facebook && negocio.instagram && (
        <a
          href={negocio.instagram}
          target="_blank"
          rel="noreferrer"
          className="btn btn-instagram"
          onClick={() => registrarClick(negocio.slug, "click_social")}
        >
          📸 Síguenos en Instagram
        </a>
      )}

      {negocio.menuPdfUrl && (
        <a
          href={negocio.menuPdfUrl}
          target="_blank"
          rel="noreferrer"
          className="btn btn-google"
          onClick={() => registrarClick(negocio.slug, "click_menu")}
        >
          📎 Ver menú
        </a>
      )}

      <a
        href={negocio.whatsapp}
        target="_blank"
        rel="noreferrer"
        className="btn btn-wa"
        onClick={() => registrarClick(negocio.slug, "click_wa")}
      >
        💬 Escríbenos por WhatsApp
      </a>
    </>
  );
}
