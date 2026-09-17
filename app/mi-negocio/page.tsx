"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { PuntoSerie } from "@/lib/eventos";
import { GraficaSerie } from "./grafica-serie";
import { IconoFacebook, IconoGoogle, IconoInstagram, IconoTikTok, IconoWhatsApp } from "@/components/iconos";
import { OPCIONES_ETIQUETA_PDF, esUrlDeStorageMenus, esUrlDeStorageLogos } from "@/lib/negocios";
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
  logo_url: string | null;
  menu_pdf_url: string | null;
  menu_pdf_label: string | null;
  banco: string | null;
  titular_cuenta: string | null;
  clabe: string | null;
};

type FormNegocio = {
  nombre: string;
  bio: string;
  whatsapp: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  google_review_url: string;
  logo_url: string;
  menu_pdf_url: string;
  menu_pdf_label: string;
  banco: string;
  titular_cuenta: string;
  clabe: string;
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
  logo_url: "",
  menu_pdf_url: "",
  menu_pdf_label: "Menú",
  banco: "",
  titular_cuenta: "",
  clabe: ""
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
  const [subiendoPdf, setSubiendoPdf] = useState(false);
  const [errorPdf, setErrorPdf] = useState<string | null>(null);
  const [metodoPdf, setMetodoPdf] = useState<"archivo" | "link">("archivo");
  const [subiendoLogo, setSubiendoLogo] = useState(false);
  const [errorLogo, setErrorLogo] = useState<string | null>(null);
  const [metodoLogo, setMetodoLogo] = useState<"archivo" | "link">("archivo");

  useEffect(() => {
    let cargado = false;

    async function cargar(session: Session) {
      if (cargado) return;
      cargado = true;

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
        logo_url: row.logo_url ?? "",
        menu_pdf_url: row.menu_pdf_url ?? "",
        menu_pdf_label: row.menu_pdf_label ?? "Menú",
        banco: row.banco ?? "",
        titular_cuenta: row.titular_cuenta ?? "",
        clabe: row.clabe ?? ""
      });
      setMetodoPdf(row.menu_pdf_url && !esUrlDeStorageMenus(row.menu_pdf_url) ? "link" : "archivo");
      setMetodoLogo(row.logo_url && !esUrlDeStorageLogos(row.logo_url) ? "link" : "archivo");
      setCargando(false);

      fetch("/api/mi-negocio/metricas", {
        headers: { Authorization: `Bearer ${session.access_token}` }
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((datos) => datos && setMetricas(datos));
    }

    // No decidimos "no hay sesión" con una sola lectura de getSession(): si el
    // navegador todavía no terminó de leer la sesión persistida en localStorage,
    // esa lectura puede llegar vacía aunque sí haya sesión (condición de carrera).
    // onAuthStateChange espera esa resolución inicial (evento INITIAL_SESSION)
    // antes de avisar, y además sigue escuchando cambios reales (logout, etc.).
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/login");
        return;
      }

      cargar(session);
    });

    return () => subscription.unsubscribe();
  }, [router]);

  function handleChange(campo: keyof FormNegocio, valor: string) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function handleChangeEtiquetaPdf(valor: string) {
    if (valor === "personalizado") {
      setForm((prev) => ({
        ...prev,
        menu_pdf_label: OPCIONES_ETIQUETA_PDF.includes(prev.menu_pdf_label) ? "" : prev.menu_pdf_label
      }));
      return;
    }

    handleChange("menu_pdf_label", valor);
  }

  async function handlePdfChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !negocio) return;

    setErrorPdf(null);
    setSubiendoPdf(true);

    const path = `${negocio.slug}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("menus")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setSubiendoPdf(false);
      setErrorPdf("No se pudo subir el PDF. Intenta de nuevo.");
      return;
    }

    const {
      data: { publicUrl }
    } = supabase.storage.from("menus").getPublicUrl(path);

    setForm((prev) => ({ ...prev, menu_pdf_url: publicUrl }));
    setSubiendoPdf(false);
  }

  async function handleLogoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !negocio) return;

    setErrorLogo(null);
    setSubiendoLogo(true);

    const path = `${negocio.slug}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("logos")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setSubiendoLogo(false);
      setErrorLogo("No se pudo subir el logo. Intenta de nuevo.");
      return;
    }

    const {
      data: { publicUrl }
    } = supabase.storage.from("logos").getPublicUrl(path);

    setForm((prev) => ({ ...prev, logo_url: publicUrl }));
    setSubiendoLogo(false);
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
                    Logo
                    {form.logo_url && (
                      <img src={form.logo_url} alt="Logo actual" className="mn-logo-preview" />
                    )}
                    <div className="mn-toggle-tabs">
                      <button
                        type="button"
                        className={`mn-toggle-tab ${metodoLogo === "archivo" ? "is-active" : ""}`}
                        onClick={() => setMetodoLogo("archivo")}
                      >
                        Subir archivo
                      </button>
                      <button
                        type="button"
                        className={`mn-toggle-tab ${metodoLogo === "link" ? "is-active" : ""}`}
                        onClick={() => setMetodoLogo("link")}
                      >
                        Pegar link
                      </button>
                    </div>
                    {metodoLogo === "archivo" ? (
                      <div className="mn-file-upload">
                        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleLogoChange} />
                        {subiendoLogo && <span className="mn-file-subiendo">Subiendo...</span>}
                      </div>
                    ) : (
                      <div className="mn-link-field">
                        <input
                          type="url"
                          placeholder="https://..."
                          value={form.logo_url}
                          onChange={(e) => handleChange("logo_url", e.target.value)}
                        />
                        <p className="mn-form-nota">
                          Debe ser una URL pública y permanente. Los links de Facebook o Google Maps
                          caducan y no sirven aquí.
                        </p>
                      </div>
                    )}
                    {errorLogo && <p className="mn-mensaje mn-mensaje-error">{errorLogo}</p>}
                  </label>
                  <label>
                    Menú / avisos (PDF)
                    {form.menu_pdf_url && (
                      <a
                        href={form.menu_pdf_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mn-pdf-actual"
                      >
                        Ver PDF actual
                      </a>
                    )}
                    <select
                      value={
                        OPCIONES_ETIQUETA_PDF.includes(form.menu_pdf_label)
                          ? form.menu_pdf_label
                          : "personalizado"
                      }
                      onChange={(e) => handleChangeEtiquetaPdf(e.target.value)}
                    >
                      {OPCIONES_ETIQUETA_PDF.map((opcion) => (
                        <option key={opcion} value={opcion}>
                          {opcion}
                        </option>
                      ))}
                      <option value="personalizado">Personalizado...</option>
                    </select>
                    {!OPCIONES_ETIQUETA_PDF.includes(form.menu_pdf_label) && (
                      <input
                        placeholder="Escribe la etiqueta del botón"
                        value={form.menu_pdf_label}
                        onChange={(e) => handleChange("menu_pdf_label", e.target.value)}
                      />
                    )}
                    <div className="mn-toggle-tabs">
                      <button
                        type="button"
                        className={`mn-toggle-tab ${metodoPdf === "archivo" ? "is-active" : ""}`}
                        onClick={() => setMetodoPdf("archivo")}
                      >
                        Subir archivo
                      </button>
                      <button
                        type="button"
                        className={`mn-toggle-tab ${metodoPdf === "link" ? "is-active" : ""}`}
                        onClick={() => setMetodoPdf("link")}
                      >
                        Pegar link
                      </button>
                    </div>
                    {metodoPdf === "archivo" ? (
                      <div className="mn-file-upload">
                        <input type="file" accept="application/pdf" onChange={handlePdfChange} />
                        {subiendoPdf && <span className="mn-file-subiendo">Subiendo...</span>}
                      </div>
                    ) : (
                      <div className="mn-link-field">
                        <input
                          type="url"
                          placeholder="https://drive.google.com/..."
                          value={form.menu_pdf_url}
                          onChange={(e) => handleChange("menu_pdf_url", e.target.value)}
                        />
                        <p className="mn-form-nota">
                          Asegúrate de que el link sea público (cualquiera con el enlace puede ver).
                        </p>
                      </div>
                    )}
                    {errorPdf && <p className="mn-mensaje mn-mensaje-error">{errorPdf}</p>}
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

                <div className="mn-form-card">
                  <h3 className="mn-form-card-title">Datos de pago (opcional)</h3>
                  <label>
                    Banco
                    <input value={form.banco} onChange={(e) => handleChange("banco", e.target.value)} />
                  </label>
                  <label>
                    Titular de la cuenta
                    <input
                      value={form.titular_cuenta}
                      onChange={(e) => handleChange("titular_cuenta", e.target.value)}
                    />
                  </label>
                  <label>
                    CLABE
                    <input value={form.clabe} onChange={(e) => handleChange("clabe", e.target.value)} />
                  </label>
                  <p className="mn-form-nota">Se muestra a tus clientes solo si llenas los tres campos.</p>
                </div>

                {mensaje && <p className="mn-mensaje">{mensaje}</p>}

                <button
                  type="submit"
                  className="mn-btn-guardar"
                  disabled={guardando || subiendoPdf || subiendoLogo}
                >
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
