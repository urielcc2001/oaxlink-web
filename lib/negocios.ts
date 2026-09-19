// Capa de datos de negocios, conectada a la tabla `negocios` de Supabase.

import { unstable_noStore as noStore } from "next/cache";
import { supabase } from "./supabase";

export const OPCIONES_ETIQUETA_PDF = ["Menú", "Ofertas", "Información", "Productos", "Servicios"];

// Detecta si una URL viene de nuestro bucket de Supabase Storage (subida con
// el input de archivo) o fue pegada a mano (Google Drive, Dropbox, etc.).
function esUrlDeStorage(url: string, bucket: string): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  if (!supabaseUrl || !url) return false;
  return url.startsWith(`${supabaseUrl}/storage/v1/object/public/${bucket}/`);
}

export function esUrlDeStorageMenus(url: string): boolean {
  return esUrlDeStorage(url, "menus");
}

export function esUrlDeStorageLogos(url: string): boolean {
  return esUrlDeStorage(url, "logos");
}

export type Negocio = {
  slug: string;
  nombre: string;
  bio: string;
  logo: string;
  googleReviewUrl: string;
  whatsapp: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  menuPdfUrl?: string;
  menuPdfLabel: string;
  banco?: string;
  titularCuenta?: string;
  clabe?: string;
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
  tiktok: string | null;
  menu_pdf_url: string | null;
  menu_pdf_label: string | null;
  banco: string | null;
  titular_cuenta: string | null;
  clabe: string | null;
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
    tiktok: row.tiktok ?? undefined,
    menuPdfUrl: row.menu_pdf_url ?? undefined,
    menuPdfLabel: row.menu_pdf_label ?? "Menú",
    banco: row.banco ?? undefined,
    titularCuenta: row.titular_cuenta ?? undefined,
    clabe: row.clabe ?? undefined
  };
}

export async function getNegocio(slug: string): Promise<Negocio | null> {
  noStore();

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
