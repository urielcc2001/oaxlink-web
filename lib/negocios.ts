// Capa de datos de negocios, conectada a la tabla `negocios` de Supabase.

import { supabase } from "./supabase";

export type Negocio = {
  slug: string;
  nombre: string;
  bio: string;
  logo: string;
  googleReviewUrl: string;
  whatsapp: string;
  facebook?: string;
  instagram?: string;
  menuPdfUrl?: string;
};

type NegocioRow = {
  slug: string;
  nombre: string;
  bio: string | null;
  logo_url: string | null;
  google_review_url: string | null;
  whatsapp: string | null;
  facebook: string | null;
  instagram: string | null;
  menu_pdf_url: string | null;
};

function mapRow(row: NegocioRow): Negocio {
  return {
    slug: row.slug,
    nombre: row.nombre,
    bio: row.bio ?? "",
    logo: row.logo_url ?? "",
    googleReviewUrl: row.google_review_url ?? "",
    whatsapp: row.whatsapp ?? "",
    facebook: row.facebook ?? undefined,
    instagram: row.instagram ?? undefined,
    menuPdfUrl: row.menu_pdf_url ?? undefined
  };
}

export async function getNegocio(slug: string): Promise<Negocio | null> {
  const { data, error } = await supabase
    .from("negocios")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  return mapRow(data as NegocioRow);
}

export async function registrarEvento(
  slug: string,
  tipo: "scan" | "click_google" | "click_wa" | "click_menu" | "click_social"
) {
  await supabase.from("eventos").insert({ negocio_slug: slug, tipo });
}
