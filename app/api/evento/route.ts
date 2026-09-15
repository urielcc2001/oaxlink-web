import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const TIPOS_VALIDOS = ["scan", "click_google", "click_wa", "click_menu", "click_social"];

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const slug = body?.slug;
  const tipo = body?.tipo;

  if (typeof slug !== "string" || !TIPOS_VALIDOS.includes(tipo)) {
    return NextResponse.json({ error: "slug o tipo inválido" }, { status: 400 });
  }

  const { error } = await supabase.from("eventos").insert({ negocio_slug: slug, tipo });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
