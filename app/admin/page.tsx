"use client";

import { ChangeEvent, FormEvent, Fragment, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { IconoFacebook, IconoGoogle, IconoInstagram, IconoTikTok, IconoWhatsApp } from "@/components/iconos";
import { OPCIONES_ETIQUETA_PDF, esUrlDeStorageMenus } from "@/lib/negocios";
import { esEmailAdmin } from "@/lib/admin-emails";
import "./admin.css";

type NegocioForm = {
  slug: string;
  nombre: string;
  bio: string;
  whatsapp: string;
  google_review_url: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  logo_url: string;
  email_dueno: string;
  password: string;
  banco: string;
  titular_cuenta: string;
  clabe: string;
};

const NEGOCIO_VACIO: NegocioForm = {
  slug: "",
  nombre: "",
  bio: "",
  whatsapp: "",
  google_review_url: "",
  facebook: "",
  instagram: "",
  tiktok: "",
  logo_url: "",
  email_dueno: "",
  password: "",
  banco: "",
  titular_cuenta: "",
  clabe: ""
};

type CredencialesCreadas = { slug: string; email: string; password: string };

type NegocioAdmin = {
  slug: string;
  nombre: string;
  bio: string | null;
  whatsapp: string | null;
  google_review_url: string | null;
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  logo_url: string | null;
  email_dueno: string | null;
  menu_pdf_url: string | null;
  menu_pdf_label: string | null;
  banco: string | null;
  titular_cuenta: string | null;
  clabe: string | null;
  plan: string | null;
  estado: string | null;
};

type NegocioEditForm = {
  nombre: string;
  bio: string;
  whatsapp: string;
  google_review_url: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  logo_url: string;
  email_dueno: string;
  menu_pdf_url: string;
  menu_pdf_label: string;
  banco: string;
  titular_cuenta: string;
  clabe: string;
};

const EDICION_VACIA: NegocioEditForm = {
  nombre: "",
  bio: "",
  whatsapp: "",
  google_review_url: "",
  facebook: "",
  instagram: "",
  tiktok: "",
  logo_url: "",
  email_dueno: "",
  menu_pdf_url: "",
  menu_pdf_label: "Menú",
  banco: "",
  titular_cuenta: "",
  clabe: ""
};

type PlacaForm = {
  id_placa: string;
  negocio_slug: string;
  tipo: "individual" | "mesa";
};

const PLACA_VACIA: PlacaForm = {
  id_placa: "",
  negocio_slug: "",
  tipo: "individual"
};

type Seccion = "registrar" | "negocios" | "placa";

export default function AdminPage() {
  const router = useRouter();
  const [verificando, setVerificando] = useState(true);
  const [emailAdmin, setEmailAdmin] = useState("");
  const [seccion, setSeccion] = useState<Seccion>("registrar");
  const [negocios, setNegocios] = useState<NegocioAdmin[]>([]);
  const [eliminando, setEliminando] = useState<string | null>(null);

  const [formNegocio, setFormNegocio] = useState<NegocioForm>(NEGOCIO_VACIO);
  const [guardandoNegocio, setGuardandoNegocio] = useState(false);
  const [errorNegocio, setErrorNegocio] = useState<string | null>(null);
  const [credencialesCreadas, setCredencialesCreadas] = useState<CredencialesCreadas | null>(null);

  const [formPlaca, setFormPlaca] = useState<PlacaForm>(PLACA_VACIA);
  const [guardandoPlaca, setGuardandoPlaca] = useState(false);
  const [errorPlaca, setErrorPlaca] = useState<string | null>(null);

  const [editandoSlug, setEditandoSlug] = useState<string | null>(null);
  const [formEdicion, setFormEdicion] = useState<NegocioEditForm>(EDICION_VACIA);
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);
  const [errorEdicion, setErrorEdicion] = useState<string | null>(null);
  const [subiendoPdfEdicion, setSubiendoPdfEdicion] = useState(false);
  const [errorPdfEdicion, setErrorPdfEdicion] = useState<string | null>(null);
  const [metodoPdfEdicion, setMetodoPdfEdicion] = useState<"archivo" | "link">("archivo");

  const [toast, setToast] = useState<string | null>(null);

  function mostrarToast(texto: string) {
    setToast(texto);
  }

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    let cargado = false;

    async function verificar(session: Session) {
      if (cargado) return;
      cargado = true;

      if (!esEmailAdmin(session.user.email, process.env.NEXT_PUBLIC_ADMIN_EMAIL)) {
        router.replace("/login");
        return;
      }

      setEmailAdmin(session.user.email ?? "");
      setVerificando(false);

      const res = await fetch("/api/admin/negocios", {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      const datos = await res.json().catch(() => null);
      if (res.ok && datos?.negocios) setNegocios(datos.negocios as NegocioAdmin[]);
    }

    // Igual que en /mi-negocio: esperamos a onAuthStateChange en vez de una
    // sola llamada a getSession(), que puede resolver vacía si el navegador
    // todavía no terminó de leer la sesión persistida (condición de carrera).
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/login");
        return;
      }

      verificar(session);
    });

    return () => subscription.unsubscribe();
  }, [router]);

  function handleChangeNegocio(campo: keyof NegocioForm, valor: string) {
    setFormNegocio((prev) => ({ ...prev, [campo]: valor }));
  }

  async function handleSubmitNegocio(e: FormEvent) {
    e.preventDefault();
    setGuardandoNegocio(true);
    setErrorNegocio(null);
    setCredencialesCreadas(null);

    const {
      data: { session }
    } = await supabase.auth.getSession();

    if (!session) {
      setGuardandoNegocio(false);
      router.replace("/login");
      return;
    }

    const res = await fetch("/api/admin/negocios", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`
      },
      body: JSON.stringify(formNegocio)
    });

    const datos = await res.json().catch(() => null);
    setGuardandoNegocio(false);

    if (!res.ok) {
      setErrorNegocio(datos?.error ?? "No se pudo crear el negocio.");
      return;
    }

    setNegocios((prev) => [
      ...prev,
      {
        slug: formNegocio.slug,
        nombre: formNegocio.nombre,
        bio: formNegocio.bio || null,
        whatsapp: formNegocio.whatsapp || null,
        google_review_url: formNegocio.google_review_url || null,
        facebook: formNegocio.facebook || null,
        instagram: formNegocio.instagram || null,
        tiktok: formNegocio.tiktok || null,
        logo_url: formNegocio.logo_url || null,
        email_dueno: formNegocio.email_dueno || null,
        menu_pdf_url: null,
        menu_pdf_label: null,
        banco: formNegocio.banco || null,
        titular_cuenta: formNegocio.titular_cuenta || null,
        clabe: formNegocio.clabe || null,
        plan: "basico",
        estado: "activo"
      }
    ]);
    setCredencialesCreadas({ slug: datos.slug, email: datos.email, password: datos.password });
    setFormNegocio(NEGOCIO_VACIO);
    mostrarToast("Negocio creado correctamente.");
  }

  function handleChangePlaca(campo: keyof PlacaForm, valor: string) {
    setFormPlaca((prev) => ({ ...prev, [campo]: valor } as PlacaForm));
  }

  async function handleSubmitPlaca(e: FormEvent) {
    e.preventDefault();
    setGuardandoPlaca(true);
    setErrorPlaca(null);

    const {
      data: { session }
    } = await supabase.auth.getSession();

    if (!session) {
      setGuardandoPlaca(false);
      router.replace("/login");
      return;
    }

    const res = await fetch("/api/admin/placas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`
      },
      body: JSON.stringify(formPlaca)
    });

    const datos = await res.json().catch(() => null);
    setGuardandoPlaca(false);

    if (!res.ok) {
      setErrorPlaca(datos?.error ?? "No se pudo vincular la placa.");
      return;
    }

    mostrarToast(`Placa ${formPlaca.id_placa} vinculada a ${formPlaca.negocio_slug}.`);
    setFormPlaca(PLACA_VACIA);
  }

  function toggleEditar(n: NegocioAdmin) {
    if (editandoSlug === n.slug) {
      setEditandoSlug(null);
      return;
    }

    setEditandoSlug(n.slug);
    setErrorEdicion(null);
    setErrorPdfEdicion(null);
    setFormEdicion({
      nombre: n.nombre ?? "",
      bio: n.bio ?? "",
      whatsapp: n.whatsapp ?? "",
      google_review_url: n.google_review_url ?? "",
      facebook: n.facebook ?? "",
      instagram: n.instagram ?? "",
      tiktok: n.tiktok ?? "",
      logo_url: n.logo_url ?? "",
      email_dueno: n.email_dueno ?? "",
      menu_pdf_url: n.menu_pdf_url ?? "",
      menu_pdf_label: n.menu_pdf_label ?? "Menú",
      banco: n.banco ?? "",
      titular_cuenta: n.titular_cuenta ?? "",
      clabe: n.clabe ?? ""
    });
    setMetodoPdfEdicion(n.menu_pdf_url && !esUrlDeStorageMenus(n.menu_pdf_url) ? "link" : "archivo");
  }

  function handleChangeEdicion(campo: keyof NegocioEditForm, valor: string) {
    setFormEdicion((prev) => ({ ...prev, [campo]: valor }));
  }

  function handleChangeEtiquetaPdfEdicion(valor: string) {
    if (valor === "personalizado") {
      setFormEdicion((prev) => ({
        ...prev,
        menu_pdf_label: OPCIONES_ETIQUETA_PDF.includes(prev.menu_pdf_label) ? "" : prev.menu_pdf_label
      }));
      return;
    }

    handleChangeEdicion("menu_pdf_label", valor);
  }

  async function handlePdfChangeEdicion(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !editandoSlug) return;

    setErrorPdfEdicion(null);
    setSubiendoPdfEdicion(true);

    const path = `${editandoSlug}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("menus").upload(path, file, {
      upsert: true
    });

    if (uploadError) {
      setSubiendoPdfEdicion(false);
      setErrorPdfEdicion("No se pudo subir el PDF. Intenta de nuevo.");
      return;
    }

    const {
      data: { publicUrl }
    } = supabase.storage.from("menus").getPublicUrl(path);

    setFormEdicion((prev) => ({ ...prev, menu_pdf_url: publicUrl }));
    setSubiendoPdfEdicion(false);
  }

  async function handleGuardarEdicion(e: FormEvent) {
    e.preventDefault();
    if (!editandoSlug) return;

    setGuardandoEdicion(true);
    setErrorEdicion(null);

    const {
      data: { session }
    } = await supabase.auth.getSession();

    if (!session) {
      setGuardandoEdicion(false);
      router.replace("/login");
      return;
    }

    const res = await fetch(`/api/admin/negocios/${editandoSlug}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`
      },
      body: JSON.stringify(formEdicion)
    });

    const datos = await res.json().catch(() => null);
    setGuardandoEdicion(false);

    if (!res.ok) {
      setErrorEdicion(datos?.error ?? "No se pudo guardar.");
      return;
    }

    const slugEditado = editandoSlug;
    setNegocios((prev) =>
      prev.map((n) =>
        n.slug === slugEditado
          ? {
              ...n,
              nombre: formEdicion.nombre,
              bio: formEdicion.bio || null,
              whatsapp: formEdicion.whatsapp || null,
              google_review_url: formEdicion.google_review_url || null,
              facebook: formEdicion.facebook || null,
              instagram: formEdicion.instagram || null,
              tiktok: formEdicion.tiktok || null,
              logo_url: formEdicion.logo_url || null,
              email_dueno: formEdicion.email_dueno || null,
              menu_pdf_url: formEdicion.menu_pdf_url || null,
              menu_pdf_label: formEdicion.menu_pdf_label || null,
              banco: formEdicion.banco || null,
              titular_cuenta: formEdicion.titular_cuenta || null,
              clabe: formEdicion.clabe || null
            }
          : n
      )
    );
    mostrarToast("Cambios guardados.");
  }

  async function handleEliminarNegocio(slug: string, nombre: string) {
    const confirmado = window.confirm(
      `¿Seguro que quieres eliminar a ${nombre}? Esto borra también sus placas y eventos.`
    );
    if (!confirmado) return;

    const {
      data: { session }
    } = await supabase.auth.getSession();

    if (!session) {
      router.replace("/login");
      return;
    }

    setEliminando(slug);

    const res = await fetch(`/api/admin/negocios/${slug}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${session.access_token}` }
    });

    setEliminando(null);

    if (!res.ok) {
      const datos = await res.json().catch(() => null);
      window.alert(datos?.error ?? "No se pudo eliminar el negocio.");
      return;
    }

    if (editandoSlug === slug) setEditandoSlug(null);
    setNegocios((prev) => prev.filter((n) => n.slug !== slug));
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (verificando) {
    return <div className="admin-page admin-centrado">Verificando acceso...</div>;
  }

  return (
    <div className="admin-page admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <span className="admin-logo-mark">OL</span>
          <span>OaxLink · Admin</span>
        </div>

        <nav className="admin-sidebar-nav">
          <button
            className={`admin-sidebar-item ${seccion === "registrar" ? "is-active" : ""}`}
            onClick={() => setSeccion("registrar")}
          >
            <span className="icon">➕</span>
            <span className="label">Registrar negocio</span>
          </button>
          <button
            className={`admin-sidebar-item ${seccion === "negocios" ? "is-active" : ""}`}
            onClick={() => setSeccion("negocios")}
          >
            <span className="icon">📋</span>
            <span className="label">Negocios</span>
          </button>
          <button
            className={`admin-sidebar-item ${seccion === "placa" ? "is-active" : ""}`}
            onClick={() => setSeccion("placa")}
          >
            <span className="icon">🔗</span>
            <span className="label">Vincular placa</span>
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <span className="admin-sidebar-email">{emailAdmin}</span>
          <button className="admin-btn-logout" onClick={handleLogout}>
            🚪 Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-main-content">
          {seccion === "registrar" && (
            <>
              <h1 className="admin-section-title">Registrar negocio</h1>

              <form className="admin-form" onSubmit={handleSubmitNegocio}>
                <div className="admin-form-card">
                  <h3 className="admin-form-card-title">Información básica</h3>
                  <label>
                    Slug
                    <input
                      value={formNegocio.slug}
                      onChange={(e) => handleChangeNegocio("slug", e.target.value)}
                      required
                    />
                  </label>
                  <label>
                    Nombre
                    <input
                      value={formNegocio.nombre}
                      onChange={(e) => handleChangeNegocio("nombre", e.target.value)}
                      required
                    />
                  </label>
                  <label>
                    Bio
                    <input
                      value={formNegocio.bio}
                      onChange={(e) => handleChangeNegocio("bio", e.target.value)}
                    />
                  </label>
                  <label>
                    Logo (URL)
                    <input
                      value={formNegocio.logo_url}
                      onChange={(e) => handleChangeNegocio("logo_url", e.target.value)}
                    />
                  </label>
                  <label>
                    Email del dueño
                    <input
                      type="email"
                      value={formNegocio.email_dueno}
                      onChange={(e) => handleChangeNegocio("email_dueno", e.target.value)}
                    />
                  </label>
                  <label>
                    Contraseña temporal
                    <input
                      value={formNegocio.password}
                      onChange={(e) => handleChangeNegocio("password", e.target.value)}
                    />
                  </label>
                </div>

                <div className="admin-form-card">
                  <h3 className="admin-form-card-title">Redes y contacto</h3>
                  <label>
                    WhatsApp
                    <div className="admin-input-icon">
                      <IconoWhatsApp />
                      <input
                        value={formNegocio.whatsapp}
                        onChange={(e) => handleChangeNegocio("whatsapp", e.target.value)}
                      />
                    </div>
                  </label>
                  <label>
                    Reseña de Google
                    <div className="admin-input-icon">
                      <IconoGoogle />
                      <input
                        value={formNegocio.google_review_url}
                        onChange={(e) => handleChangeNegocio("google_review_url", e.target.value)}
                      />
                    </div>
                  </label>
                  <label>
                    Facebook
                    <div className="admin-input-icon">
                      <IconoFacebook />
                      <input
                        value={formNegocio.facebook}
                        onChange={(e) => handleChangeNegocio("facebook", e.target.value)}
                      />
                    </div>
                  </label>
                  <label>
                    Instagram
                    <div className="admin-input-icon">
                      <IconoInstagram />
                      <input
                        value={formNegocio.instagram}
                        onChange={(e) => handleChangeNegocio("instagram", e.target.value)}
                      />
                    </div>
                  </label>
                  <label>
                    TikTok
                    <div className="admin-input-icon">
                      <IconoTikTok />
                      <input
                        value={formNegocio.tiktok}
                        onChange={(e) => handleChangeNegocio("tiktok", e.target.value)}
                      />
                    </div>
                  </label>
                </div>

                <div className="admin-form-card">
                  <h3 className="admin-form-card-title">Datos de pago (opcional)</h3>
                  <label>
                    Banco
                    <input
                      value={formNegocio.banco}
                      onChange={(e) => handleChangeNegocio("banco", e.target.value)}
                    />
                  </label>
                  <label>
                    Titular de la cuenta
                    <input
                      value={formNegocio.titular_cuenta}
                      onChange={(e) => handleChangeNegocio("titular_cuenta", e.target.value)}
                    />
                  </label>
                  <label>
                    CLABE
                    <input
                      value={formNegocio.clabe}
                      onChange={(e) => handleChangeNegocio("clabe", e.target.value)}
                    />
                  </label>
                  <p className="admin-form-nota">
                    Se muestra a tus clientes solo si llenas los tres campos.
                  </p>
                </div>

                {errorNegocio && <p className="admin-mensaje admin-mensaje-error">{errorNegocio}</p>}

                <button type="submit" className="admin-btn-guardar" disabled={guardandoNegocio}>
                  {guardandoNegocio ? "Creando..." : "Crear negocio"}
                </button>
              </form>

              {credencialesCreadas && (
                <div className="admin-card admin-credenciales">
                  <h2 className="admin-card-title">Negocio creado</h2>
                  <p className="admin-mensaje">
                    Link: oaxlink.com/{credencialesCreadas.slug}
                  </p>
                  <p className="admin-credenciales-aviso">
                    Copia estas credenciales y pásaselas al dueño — no se volverán a mostrar.
                  </p>
                  <div className="admin-credenciales-datos">
                    <span>
                      <strong>Email:</strong> {credencialesCreadas.email}
                    </span>
                    <span>
                      <strong>Contraseña:</strong> {credencialesCreadas.password}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          {seccion === "negocios" && (
            <>
              <h1 className="admin-section-title">Negocios</h1>

              <div className="admin-card">
                <h2 className="admin-card-title">Negocios registrados</h2>
                <div className="admin-tabla-wrap">
                  <table className="admin-tabla">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Slug</th>
                        <th>Plan</th>
                        <th>Estado</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {negocios.map((n) => (
                        <Fragment key={n.slug}>
                          <tr>
                            <td>{n.nombre}</td>
                            <td>{n.slug}</td>
                            <td>{n.plan ?? "—"}</td>
                            <td>{n.estado ?? "—"}</td>
                            <td>
                              <div className="admin-tabla-acciones">
                                <a
                                  className="admin-btn-ver"
                                  href={`https://oaxlink.com/${n.slug}`}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Ver
                                </a>
                                <button className="admin-btn-editar" onClick={() => toggleEditar(n)}>
                                  {editandoSlug === n.slug ? "Cerrar" : "Editar"}
                                </button>
                                <button
                                  className="admin-btn-eliminar"
                                  onClick={() => handleEliminarNegocio(n.slug, n.nombre)}
                                  disabled={eliminando === n.slug}
                                >
                                  {eliminando === n.slug ? "Eliminando..." : "Eliminar"}
                                </button>
                              </div>
                            </td>
                          </tr>
                          {editandoSlug === n.slug && (
                            <tr className="admin-tabla-edicion-row">
                              <td colSpan={5}>
                                <form className="admin-edicion-form" onSubmit={handleGuardarEdicion}>
                                  <div>
                                    <h4 className="admin-edicion-bloque-title">Información básica</h4>
                                    <div className="admin-edicion-grid">
                                      <label>
                                        Nombre
                                        <input
                                          value={formEdicion.nombre}
                                          onChange={(e) => handleChangeEdicion("nombre", e.target.value)}
                                          required
                                        />
                                      </label>
                                      <label>
                                        Email del dueño
                                        <input
                                          type="email"
                                          value={formEdicion.email_dueno}
                                          onChange={(e) =>
                                            handleChangeEdicion("email_dueno", e.target.value)
                                          }
                                        />
                                      </label>
                                      <label className="admin-form-full">
                                        Bio
                                        <input
                                          value={formEdicion.bio}
                                          onChange={(e) => handleChangeEdicion("bio", e.target.value)}
                                        />
                                      </label>
                                      <label>
                                        Logo (URL)
                                        <input
                                          value={formEdicion.logo_url}
                                          onChange={(e) => handleChangeEdicion("logo_url", e.target.value)}
                                        />
                                      </label>
                                      <label className="admin-form-full">
                                        Menú / avisos (PDF)
                                        {formEdicion.menu_pdf_url && (
                                          <a
                                            href={formEdicion.menu_pdf_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="admin-pdf-actual"
                                          >
                                            Ver PDF actual
                                          </a>
                                        )}
                                        <select
                                          value={
                                            OPCIONES_ETIQUETA_PDF.includes(formEdicion.menu_pdf_label)
                                              ? formEdicion.menu_pdf_label
                                              : "personalizado"
                                          }
                                          onChange={(e) => handleChangeEtiquetaPdfEdicion(e.target.value)}
                                        >
                                          {OPCIONES_ETIQUETA_PDF.map((opcion) => (
                                            <option key={opcion} value={opcion}>
                                              {opcion}
                                            </option>
                                          ))}
                                          <option value="personalizado">Personalizado...</option>
                                        </select>
                                        {!OPCIONES_ETIQUETA_PDF.includes(formEdicion.menu_pdf_label) && (
                                          <input
                                            placeholder="Escribe la etiqueta del botón"
                                            value={formEdicion.menu_pdf_label}
                                            onChange={(e) =>
                                              handleChangeEdicion("menu_pdf_label", e.target.value)
                                            }
                                          />
                                        )}
                                        <div className="admin-pdf-tabs">
                                          <button
                                            type="button"
                                            className={`admin-pdf-tab ${
                                              metodoPdfEdicion === "archivo" ? "is-active" : ""
                                            }`}
                                            onClick={() => setMetodoPdfEdicion("archivo")}
                                          >
                                            Subir archivo
                                          </button>
                                          <button
                                            type="button"
                                            className={`admin-pdf-tab ${
                                              metodoPdfEdicion === "link" ? "is-active" : ""
                                            }`}
                                            onClick={() => setMetodoPdfEdicion("link")}
                                          >
                                            Pegar link
                                          </button>
                                        </div>
                                        {metodoPdfEdicion === "archivo" ? (
                                          <div className="admin-pdf-upload">
                                            <input
                                              type="file"
                                              accept="application/pdf"
                                              onChange={handlePdfChangeEdicion}
                                            />
                                            {subiendoPdfEdicion && (
                                              <span className="admin-pdf-subiendo">Subiendo...</span>
                                            )}
                                          </div>
                                        ) : (
                                          <div className="admin-pdf-link">
                                            <input
                                              type="url"
                                              placeholder="https://drive.google.com/..."
                                              value={formEdicion.menu_pdf_url}
                                              onChange={(e) =>
                                                handleChangeEdicion("menu_pdf_url", e.target.value)
                                              }
                                            />
                                            <p className="admin-form-nota">
                                              Asegúrate de que el link sea público (cualquiera con el
                                              enlace puede ver).
                                            </p>
                                          </div>
                                        )}
                                        {errorPdfEdicion && (
                                          <p className="admin-mensaje admin-mensaje-error">
                                            {errorPdfEdicion}
                                          </p>
                                        )}
                                      </label>
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="admin-edicion-bloque-title">Redes y contacto</h4>
                                    <div className="admin-edicion-grid">
                                      <label>
                                        WhatsApp
                                        <div className="admin-input-icon">
                                          <IconoWhatsApp />
                                          <input
                                            value={formEdicion.whatsapp}
                                            onChange={(e) =>
                                              handleChangeEdicion("whatsapp", e.target.value)
                                            }
                                          />
                                        </div>
                                      </label>
                                      <label>
                                        Reseña de Google
                                        <div className="admin-input-icon">
                                          <IconoGoogle />
                                          <input
                                            value={formEdicion.google_review_url}
                                            onChange={(e) =>
                                              handleChangeEdicion("google_review_url", e.target.value)
                                            }
                                          />
                                        </div>
                                      </label>
                                      <label>
                                        Facebook
                                        <div className="admin-input-icon">
                                          <IconoFacebook />
                                          <input
                                            value={formEdicion.facebook}
                                            onChange={(e) =>
                                              handleChangeEdicion("facebook", e.target.value)
                                            }
                                          />
                                        </div>
                                      </label>
                                      <label>
                                        Instagram
                                        <div className="admin-input-icon">
                                          <IconoInstagram />
                                          <input
                                            value={formEdicion.instagram}
                                            onChange={(e) =>
                                              handleChangeEdicion("instagram", e.target.value)
                                            }
                                          />
                                        </div>
                                      </label>
                                      <label>
                                        TikTok
                                        <div className="admin-input-icon">
                                          <IconoTikTok />
                                          <input
                                            value={formEdicion.tiktok}
                                            onChange={(e) => handleChangeEdicion("tiktok", e.target.value)}
                                          />
                                        </div>
                                      </label>
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="admin-edicion-bloque-title">Datos de pago (opcional)</h4>
                                    <div className="admin-edicion-grid">
                                      <label>
                                        Banco
                                        <input
                                          value={formEdicion.banco}
                                          onChange={(e) => handleChangeEdicion("banco", e.target.value)}
                                        />
                                      </label>
                                      <label>
                                        Titular de la cuenta
                                        <input
                                          value={formEdicion.titular_cuenta}
                                          onChange={(e) =>
                                            handleChangeEdicion("titular_cuenta", e.target.value)
                                          }
                                        />
                                      </label>
                                      <label>
                                        CLABE
                                        <input
                                          value={formEdicion.clabe}
                                          onChange={(e) => handleChangeEdicion("clabe", e.target.value)}
                                        />
                                      </label>
                                    </div>
                                    <p className="admin-form-nota">
                                      Se muestra a tus clientes solo si llenas los tres campos.
                                    </p>
                                  </div>

                                  <div className="admin-edicion-acciones">
                                    <button
                                      type="submit"
                                      className="admin-btn-guardar"
                                      disabled={guardandoEdicion || subiendoPdfEdicion}
                                    >
                                      {guardandoEdicion ? "Guardando..." : "Guardar"}
                                    </button>
                                    {errorEdicion && (
                                      <p className="admin-mensaje admin-mensaje-error">{errorEdicion}</p>
                                    )}
                                  </div>
                                </form>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      ))}
                      {negocios.length === 0 && (
                        <tr>
                          <td colSpan={5} className="admin-tabla-vacio">
                            Todavía no hay negocios registrados.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {seccion === "placa" && (
            <>
              <h1 className="admin-section-title">Vincular placa</h1>

              <form className="admin-form" onSubmit={handleSubmitPlaca}>
                <div className="admin-form-card">
                  <label>
                    ID de placa
                    <input
                      value={formPlaca.id_placa}
                      onChange={(e) => handleChangePlaca("id_placa", e.target.value)}
                      placeholder="01"
                      required
                    />
                  </label>
                  <label>
                    Negocio
                    <select
                      value={formPlaca.negocio_slug}
                      onChange={(e) => handleChangePlaca("negocio_slug", e.target.value)}
                      required
                    >
                      <option value="">Selecciona un negocio</option>
                      {negocios.map((n) => (
                        <option key={n.slug} value={n.slug}>
                          {n.nombre} ({n.slug})
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Tipo
                    <select
                      value={formPlaca.tipo}
                      onChange={(e) => handleChangePlaca("tipo", e.target.value)}
                    >
                      <option value="individual">Individual</option>
                      <option value="mesa">Mesa</option>
                    </select>
                  </label>

                  {errorPlaca && <p className="admin-mensaje admin-mensaje-error">{errorPlaca}</p>}

                  <button type="submit" className="admin-btn-guardar" disabled={guardandoPlaca}>
                    {guardandoPlaca ? "Vinculando..." : "Vincular placa"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </main>

      {toast && (
        <div className="admin-toast">
          <span className="admin-toast-icon">✓</span>
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
