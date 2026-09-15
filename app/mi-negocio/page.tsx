"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { PuntoSerie } from "@/lib/eventos";
import { GraficaSerie } from "./grafica-serie";
import { IconoFacebook, IconoGoogle, IconoInstagram, IconoTikTok, IconoWhatsApp } from "./iconos";
import "./mi-negocio.css";

type NegocioRow = {
  slug: string;
  nombre: string;
  bio: string | null;
  whatsapp: string | null;
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  google_review_url: string | null;
  menu_pdf_url: string | null;
};

type FormNegocio = {
  nombre: string;
  bio: string;
  whatsapp: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  google_review_url: string;
  menu_pdf_url: string;
};

type Metricas = {
  scans: number;
  clicksGoogle: number;
  clicksWhatsapp: number;
  serie: PuntoSerie[];
};

type Seccion = "metricas" | "perfil";

const FORM_VACIO: FormNegocio = {
  nombre: "",
  bio: "",
  whatsapp: "",
  facebook: "",
  instagram: "",
  tiktok: "",
  google_review_url: "",
  menu_pdf_url: ""
};

export default function MiNegocioPage() {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [negocio, setNegocio] = useState<NegocioRow | null>(null);
  const [form, setForm] = useState<FormNegocio>(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [seccion, setSeccion] = useState<Seccion>("metricas");

  useEffect(() => {
    async function cargar() {
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("negocios")
        .select("*")
        .eq("email_dueno", session.user.email)
        .single();

      if (error || !data) {
        setMensaje("No encontramos un negocio asociado a tu cuenta.");
        setCargando(false);
        return;
      }

      const row = data as NegocioRow;
      setNegocio(row);
      setForm({
        nombre: row.nombre ?? "",
        bio: row.bio ?? "",
        whatsapp: row.whatsapp ?? "",
        facebook: row.facebook ?? "",
        instagram: row.instagram ?? "",
        tiktok: row.tiktok ?? "",
        google_review_url: row.google_review_url ?? "",
        menu_pdf_url: row.menu_pdf_url ?? ""
      });
      setCargando(false);

      fetch("/api/mi-negocio/metricas", {
        headers: { Authorization: `Bearer ${session.access_token}` }
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((datos) => datos && setMetricas(datos));
    }

    cargar();
  }, [router]);

  function handleChange(campo: keyof FormNegocio, valor: string) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!negocio) return;

    setGuardando(true);
    setMensaje(null);

    const { error } = await supabase.from("negocios").update(form).eq("slug", negocio.slug);

    setGuardando(false);
    setMensaje(error ? "No se pudo guardar. Intenta de nuevo." : "Cambios guardados.");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (cargando) {
    return <div className="mn-page mn-centrado">Cargando...</div>;
  }

  if (!negocio) {
    return (
      <div className="mn-page mn-centrado">
        <p>{mensaje}</p>
        <button className="mn-btn-logout" onClick={handleLogout}>
          🚪 Cerrar sesión
        </button>
      </div>
    );
  }

  return (
    <div className="mn-page mn-shell">
      <aside className="mn-sidebar">
        <div className="mn-sidebar-logo">
          <span className="mn-logo-mark">OL</span>
          <span>OaxLink</span>
        </div>

        <nav className="mn-sidebar-nav">
          <button
            className={`mn-sidebar-item ${seccion === "metricas" ? "is-active" : ""}`}
            onClick={() => setSeccion("metricas")}
          >
            <span className="icon">📊</span>
            <span className="label">Métricas</span>
          </button>
          <button
            className={`mn-sidebar-item ${seccion === "perfil" ? "is-active" : ""}`}
            onClick={() => setSeccion("perfil")}
          >
            <span className="icon">✏️</span>
            <span className="label">Perfil y redes</span>
          </button>
        </nav>

        <div className="mn-sidebar-footer">
          <span className="mn-sidebar-negocio">{negocio.nombre}</span>
          <button className="mn-btn-logout" onClick={handleLogout}>
            🚪 Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="mn-main">
        <div className="mn-main-content">
          {seccion === "metricas" && (
            <>
              <h1 className="mn-section-title">Métricas</h1>

              <div className="mn-cards">
                <div className="mn-counter-card">
                  <span className="mn-counter-icon">⭐</span>
                  <span className="mn-card-label">Escaneos</span>
                  <span className="mn-card-value">{metricas?.scans ?? "—"}</span>
                </div>
                <div className="mn-counter-card">
                  <span className="mn-counter-icon">✅</span>
                  <span className="mn-card-label">Reseñas de Google</span>
                  <span className="mn-card-value">{metricas?.clicksGoogle ?? "—"}</span>
                </div>
                <div className="mn-counter-card">
                  <span className="mn-counter-icon">💬</span>
                  <span className="mn-card-label">WhatsApp</span>
                  <span className="mn-card-value">{metricas?.clicksWhatsapp ?? "—"}</span>
                </div>
              </div>

              <div className="mn-metrics-card">
                <div className="mn-chart-head">
                  <h2 className="mn-chart-title">Actividad diaria</h2>
                  <p className="mn-chart-sub">Últimos 14 días</p>
                </div>
                {metricas ? (
                  <GraficaSerie datos={metricas.serie} />
                ) : (
                  <p className="mn-mensaje">Cargando métricas...</p>
                )}
              </div>
            </>
          )}

          {seccion === "perfil" && (
            <>
              <h1 className="mn-section-title">Perfil y redes</h1>

              <form className="mn-form" onSubmit={handleSubmit}>
                <div className="mn-form-card">
                  <h3 className="mn-form-card-title">Información básica</h3>
                  <label>
                    Nombre
                    <input
                      value={form.nombre}
                      onChange={(e) => handleChange("nombre", e.target.value)}
                    />
                  </label>
                  <label>
                    Bio
                    <textarea value={form.bio} onChange={(e) => handleChange("bio", e.target.value)} />
                  </label>
                  <label>
                    Menú (PDF)
                    <input
                      value={form.menu_pdf_url}
                      onChange={(e) => handleChange("menu_pdf_url", e.target.value)}
                    />
                  </label>
                </div>

                <div className="mn-form-card">
                  <h3 className="mn-form-card-title">Redes y contacto</h3>
                  <label>
                    WhatsApp
                    <div className="mn-input-icon">
                      <IconoWhatsApp />
                      <input
                        value={form.whatsapp}
                        onChange={(e) => handleChange("whatsapp", e.target.value)}
                      />
                    </div>
                  </label>
                  <label>
                    Reseña de Google
                    <div className="mn-input-icon">
                      <IconoGoogle />
                      <input
                        value={form.google_review_url}
                        onChange={(e) => handleChange("google_review_url", e.target.value)}
                      />
                    </div>
                  </label>
                  <label>
                    Facebook
                    <div className="mn-input-icon">
                      <IconoFacebook />
                      <input
                        value={form.facebook}
                        onChange={(e) => handleChange("facebook", e.target.value)}
                      />
                    </div>
                  </label>
                  <label>
                    Instagram
                    <div className="mn-input-icon">
                      <IconoInstagram />
                      <input
                        value={form.instagram}
                        onChange={(e) => handleChange("instagram", e.target.value)}
                      />
                    </div>
                  </label>
                  <label>
                    TikTok
                    <div className="mn-input-icon">
                      <IconoTikTok />
                      <input
                        value={form.tiktok}
                        onChange={(e) => handleChange("tiktok", e.target.value)}
                      />
                    </div>
                  </label>
                </div>

                {mensaje && <p className="mn-mensaje">{mensaje}</p>}

                <button type="submit" className="mn-btn-guardar" disabled={guardando}>
                  {guardando ? "Guardando..." : "Guardar cambios"}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
