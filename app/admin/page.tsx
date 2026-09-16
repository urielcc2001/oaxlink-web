"use client";

import { FormEvent, Fragment, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { IconoFacebook, IconoGoogle, IconoInstagram, IconoTikTok, IconoWhatsApp } from "@/components/iconos";
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
  email_dueno: ""
};

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
  email_dueno: ""
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

type Mensaje = { tipo: "ok" | "error"; texto: string };
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
  const [mensajeNegocio, setMensajeNegocio] = useState<Mensaje | null>(null);

  const [formPlaca, setFormPlaca] = useState<PlacaForm>(PLACA_VACIA);
  const [guardandoPlaca, setGuardandoPlaca] = useState(false);
  const [mensajePlaca, setMensajePlaca] = useState<Mensaje | null>(null);

  const [editandoSlug, setEditandoSlug] = useState<string | null>(null);
  const [formEdicion, setFormEdicion] = useState<NegocioEditForm>(EDICION_VACIA);
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);
  const [mensajeEdicion, setMensajeEdicion] = useState<Mensaje | null>(null);

  useEffect(() => {
    async function verificar() {
      const {
        data: { session }
      } = await supabase.auth.getSession();

      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

      if (!session || !adminEmail || session.user.email !== adminEmail) {
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

    verificar();
  }, [router]);

  function handleChangeNegocio(campo: keyof NegocioForm, valor: string) {
    setFormNegocio((prev) => ({ ...prev, [campo]: valor }));
  }

  async function handleSubmitNegocio(e: FormEvent) {
    e.preventDefault();
    setGuardandoNegocio(true);
    setMensajeNegocio(null);

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
      setMensajeNegocio({ tipo: "error", texto: datos?.error ?? "No se pudo crear el negocio." });
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
        plan: "basico",
        estado: "activo"
      }
    ]);
    setMensajeNegocio({ tipo: "ok", texto: `Negocio creado: oaxlink.com/${formNegocio.slug}` });
    setFormNegocio(NEGOCIO_VACIO);
  }

  function handleChangePlaca(campo: keyof PlacaForm, valor: string) {
    setFormPlaca((prev) => ({ ...prev, [campo]: valor } as PlacaForm));
  }

  async function handleSubmitPlaca(e: FormEvent) {
    e.preventDefault();
    setGuardandoPlaca(true);
    setMensajePlaca(null);

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
      setMensajePlaca({ tipo: "error", texto: datos?.error ?? "No se pudo vincular la placa." });
      return;
    }

    setMensajePlaca({
      tipo: "ok",
      texto: `Placa ${formPlaca.id_placa} vinculada a ${formPlaca.negocio_slug}.`
    });
    setFormPlaca(PLACA_VACIA);
  }

  function toggleEditar(n: NegocioAdmin) {
    if (editandoSlug === n.slug) {
      setEditandoSlug(null);
      return;
    }

    setEditandoSlug(n.slug);
    setMensajeEdicion(null);
    setFormEdicion({
      nombre: n.nombre ?? "",
      bio: n.bio ?? "",
      whatsapp: n.whatsapp ?? "",
      google_review_url: n.google_review_url ?? "",
      facebook: n.facebook ?? "",
      instagram: n.instagram ?? "",
      tiktok: n.tiktok ?? "",
      logo_url: n.logo_url ?? "",
      email_dueno: n.email_dueno ?? ""
    });
  }

  function handleChangeEdicion(campo: keyof NegocioEditForm, valor: string) {
    setFormEdicion((prev) => ({ ...prev, [campo]: valor }));
  }

  async function handleGuardarEdicion(e: FormEvent) {
    e.preventDefault();
    if (!editandoSlug) return;

    setGuardandoEdicion(true);
    setMensajeEdicion(null);

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
      setMensajeEdicion({ tipo: "error", texto: datos?.error ?? "No se pudo guardar." });
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
              email_dueno: formEdicion.email_dueno || null
            }
          : n
      )
    );
    setMensajeEdicion({ tipo: "ok", texto: "Cambios guardados." });
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
    return <div className="ad-page ad-centrado">Verificando acceso...</div>;
  }

  return (
    <div className="ad-page ad-shell">
      <aside className="ad-sidebar">
        <div className="ad-sidebar-logo">
          <span className="ad-logo-mark">OL</span>
          <span>OaxLink · Admin</span>
        </div>

        <nav className="ad-sidebar-nav">
          <button
            className={`ad-sidebar-item ${seccion === "registrar" ? "is-active" : ""}`}
            onClick={() => setSeccion("registrar")}
          >
            <span className="icon">➕</span>
            <span className="label">Registrar negocio</span>
          </button>
          <button
            className={`ad-sidebar-item ${seccion === "negocios" ? "is-active" : ""}`}
            onClick={() => setSeccion("negocios")}
          >
            <span className="icon">📋</span>
            <span className="label">Negocios</span>
          </button>
          <button
            className={`ad-sidebar-item ${seccion === "placa" ? "is-active" : ""}`}
            onClick={() => setSeccion("placa")}
          >
            <span className="icon">🔗</span>
            <span className="label">Vincular placa</span>
          </button>
        </nav>

        <div className="ad-sidebar-footer">
          <span className="ad-sidebar-email">{emailAdmin}</span>
          <button className="ad-btn-logout" onClick={handleLogout}>
            🚪 Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="ad-main">
        <div className="ad-main-content">
          {seccion === "registrar" && (
            <>
              <h1 className="ad-section-title">Registrar negocio</h1>

              <form className="ad-form" onSubmit={handleSubmitNegocio}>
                <div className="ad-form-card">
                  <h3 className="ad-form-card-title">Información básica</h3>
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
                </div>

                <div className="ad-form-card">
                  <h3 className="ad-form-card-title">Redes y contacto</h3>
                  <label>
                    WhatsApp
                    <div className="ad-input-icon">
                      <IconoWhatsApp />
                      <input
                        value={formNegocio.whatsapp}
                        onChange={(e) => handleChangeNegocio("whatsapp", e.target.value)}
                      />
                    </div>
                  </label>
                  <label>
                    Reseña de Google
                    <div className="ad-input-icon">
                      <IconoGoogle />
                      <input
                        value={formNegocio.google_review_url}
                        onChange={(e) => handleChangeNegocio("google_review_url", e.target.value)}
                      />
                    </div>
                  </label>
                  <label>
                    Facebook
                    <div className="ad-input-icon">
                      <IconoFacebook />
                      <input
                        value={formNegocio.facebook}
                        onChange={(e) => handleChangeNegocio("facebook", e.target.value)}
                      />
                    </div>
                  </label>
                  <label>
                    Instagram
                    <div className="ad-input-icon">
                      <IconoInstagram />
                      <input
                        value={formNegocio.instagram}
                        onChange={(e) => handleChangeNegocio("instagram", e.target.value)}
                      />
                    </div>
                  </label>
                  <label>
                    TikTok
                    <div className="ad-input-icon">
                      <IconoTikTok />
                      <input
                        value={formNegocio.tiktok}
                        onChange={(e) => handleChangeNegocio("tiktok", e.target.value)}
                      />
                    </div>
                  </label>
                </div>

                {mensajeNegocio && (
                  <p className={`ad-mensaje ${mensajeNegocio.tipo === "error" ? "ad-mensaje-error" : ""}`}>
                    {mensajeNegocio.texto}
                  </p>
                )}

                <button type="submit" className="ad-btn-guardar" disabled={guardandoNegocio}>
                  {guardandoNegocio ? "Creando..." : "Crear negocio"}
                </button>
              </form>
            </>
          )}

          {seccion === "negocios" && (
            <>
              <h1 className="ad-section-title">Negocios</h1>

              <div className="ad-card">
                <h2 className="ad-card-title">Negocios registrados</h2>
                <div className="ad-tabla-wrap">
                  <table className="ad-tabla">
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
                              <div className="ad-tabla-acciones">
                                <button className="ad-btn-editar" onClick={() => toggleEditar(n)}>
                                  {editandoSlug === n.slug ? "Cerrar" : "Editar"}
                                </button>
                                <button
                                  className="ad-btn-eliminar"
                                  onClick={() => handleEliminarNegocio(n.slug, n.nombre)}
                                  disabled={eliminando === n.slug}
                                >
                                  {eliminando === n.slug ? "Eliminando..." : "Eliminar"}
                                </button>
                              </div>
                            </td>
                          </tr>
                          {editandoSlug === n.slug && (
                            <tr className="ad-tabla-edicion-row">
                              <td colSpan={5}>
                                <form className="ad-edicion-form" onSubmit={handleGuardarEdicion}>
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
                                      onChange={(e) => handleChangeEdicion("email_dueno", e.target.value)}
                                    />
                                  </label>
                                  <label className="ad-form-full">
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
                                  <label>
                                    WhatsApp
                                    <input
                                      value={formEdicion.whatsapp}
                                      onChange={(e) => handleChangeEdicion("whatsapp", e.target.value)}
                                    />
                                  </label>
                                  <label>
                                    Reseña de Google
                                    <input
                                      value={formEdicion.google_review_url}
                                      onChange={(e) =>
                                        handleChangeEdicion("google_review_url", e.target.value)
                                      }
                                    />
                                  </label>
                                  <label>
                                    Facebook
                                    <input
                                      value={formEdicion.facebook}
                                      onChange={(e) => handleChangeEdicion("facebook", e.target.value)}
                                    />
                                  </label>
                                  <label>
                                    Instagram
                                    <input
                                      value={formEdicion.instagram}
                                      onChange={(e) => handleChangeEdicion("instagram", e.target.value)}
                                    />
                                  </label>
                                  <label>
                                    TikTok
                                    <input
                                      value={formEdicion.tiktok}
                                      onChange={(e) => handleChangeEdicion("tiktok", e.target.value)}
                                    />
                                  </label>

                                  <div className="ad-edicion-acciones">
                                    <button
                                      type="submit"
                                      className="ad-btn-guardar"
                                      disabled={guardandoEdicion}
                                    >
                                      {guardandoEdicion ? "Guardando..." : "Guardar"}
                                    </button>
                                    {mensajeEdicion && (
                                      <p
                                        className={`ad-mensaje ${
                                          mensajeEdicion.tipo === "error" ? "ad-mensaje-error" : ""
                                        }`}
                                      >
                                        {mensajeEdicion.texto}
                                      </p>
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
                          <td colSpan={5} className="ad-tabla-vacio">
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
              <h1 className="ad-section-title">Vincular placa</h1>

              <form className="ad-form" onSubmit={handleSubmitPlaca}>
                <div className="ad-form-card">
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

                  {mensajePlaca && (
                    <p className={`ad-mensaje ${mensajePlaca.tipo === "error" ? "ad-mensaje-error" : ""}`}>
                      {mensajePlaca.texto}
                    </p>
                  )}

                  <button type="submit" className="ad-btn-guardar" disabled={guardandoPlaca}>
                    {guardandoPlaca ? "Vinculando..." : "Vincular placa"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
