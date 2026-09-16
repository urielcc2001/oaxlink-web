"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
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

type NegocioOpcion = { slug: string; nombre: string };

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

export default function AdminPage() {
  const router = useRouter();
  const [verificando, setVerificando] = useState(true);
  const [negocios, setNegocios] = useState<NegocioOpcion[]>([]);

  const [formNegocio, setFormNegocio] = useState<NegocioForm>(NEGOCIO_VACIO);
  const [guardandoNegocio, setGuardandoNegocio] = useState(false);
  const [mensajeNegocio, setMensajeNegocio] = useState<Mensaje | null>(null);

  const [formPlaca, setFormPlaca] = useState<PlacaForm>(PLACA_VACIA);
  const [guardandoPlaca, setGuardandoPlaca] = useState(false);
  const [mensajePlaca, setMensajePlaca] = useState<Mensaje | null>(null);

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

      setVerificando(false);

      const { data } = await supabase.from("negocios").select("slug, nombre").order("nombre");
      if (data) setNegocios(data as NegocioOpcion[]);
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

    setNegocios((prev) => [...prev, { slug: formNegocio.slug, nombre: formNegocio.nombre }]);
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

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (verificando) {
    return <div className="ad-page ad-centrado">Verificando acceso...</div>;
  }

  return (
    <div className="ad-page">
      <nav className="ad-nav">
        <div className="ad-logo">
          <span className="ad-logo-mark">OL</span>OaxLink · Admin
        </div>
        <button className="ad-btn-logout" onClick={handleLogout}>
          🚪 Cerrar sesión
        </button>
      </nav>

      <div className="ad-content">
        <div className="ad-card">
          <h2 className="ad-card-title">Nuevo negocio</h2>
          <form className="ad-form" onSubmit={handleSubmitNegocio}>
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
              <input value={formNegocio.bio} onChange={(e) => handleChangeNegocio("bio", e.target.value)} />
            </label>
            <label>
              WhatsApp
              <input
                value={formNegocio.whatsapp}
                onChange={(e) => handleChangeNegocio("whatsapp", e.target.value)}
              />
            </label>
            <label>
              Reseña de Google
              <input
                value={formNegocio.google_review_url}
                onChange={(e) => handleChangeNegocio("google_review_url", e.target.value)}
              />
            </label>
            <label>
              Facebook
              <input
                value={formNegocio.facebook}
                onChange={(e) => handleChangeNegocio("facebook", e.target.value)}
              />
            </label>
            <label>
              Instagram
              <input
                value={formNegocio.instagram}
                onChange={(e) => handleChangeNegocio("instagram", e.target.value)}
              />
            </label>
            <label>
              TikTok
              <input
                value={formNegocio.tiktok}
                onChange={(e) => handleChangeNegocio("tiktok", e.target.value)}
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

            {mensajeNegocio && (
              <p className={`ad-mensaje ${mensajeNegocio.tipo === "error" ? "ad-mensaje-error" : ""}`}>
                {mensajeNegocio.texto}
              </p>
            )}

            <button type="submit" className="ad-btn-guardar" disabled={guardandoNegocio}>
              {guardandoNegocio ? "Creando..." : "Crear negocio"}
            </button>
          </form>
        </div>

        <div className="ad-card">
          <h2 className="ad-card-title">Vincular placa</h2>
          <form className="ad-form" onSubmit={handleSubmitPlaca}>
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
          </form>
        </div>
      </div>
    </div>
  );
}
