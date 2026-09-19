"use client";

import { useState } from "react";
import type { Negocio } from "@/lib/negocios";
import { IconoTikTok } from "@/components/iconos";

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
  const [mostrarPago, setMostrarPago] = useState(false);
  const [copiado, setCopiado] = useState(false);

  async function handleCopiarClabe() {
    try {
      await navigator.clipboard.writeText(negocio.clabe ?? "");
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // portapapeles no disponible; no hacemos nada más.
    }
  }

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
      {negocio.instagram && (
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
      {negocio.tiktok && (
        <a
          href={negocio.tiktok}
          target="_blank"
          rel="noreferrer"
          className="btn btn-tiktok"
          onClick={() => registrarClick(negocio.slug, "click_social")}
        >
          <IconoTikTok /> Síguenos en TikTok
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
          📎 Ver {negocio.menuPdfLabel}
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

      {negocio.banco && negocio.titularCuenta && negocio.clabe && (
        <div className="pago-wrap">
          <button
            type="button"
            className="btn btn-pago"
            onClick={() => setMostrarPago((prev) => !prev)}
          >
            💳 Datos de pago
          </button>
          <div className={`pago-panel ${mostrarPago ? "pago-panel-abierto" : ""}`}>
            <div className="pago-panel-inner">
              <p>
                <strong>Banco:</strong> {negocio.banco}
              </p>
              <p>
                <strong>Titular:</strong> {negocio.titularCuenta}
              </p>
              <p className="pago-clabe">
                <span>
                  <strong>CLABE:</strong> {negocio.clabe}
                </span>
                <button type="button" className="btn-copiar" onClick={handleCopiarClabe}>
                  {copiado ? "¡Copiado!" : "Copiar"}
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
