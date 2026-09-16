import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verificarAdmin } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const verificacion = await verificarAdmin(request);
  if (!verificacion.ok) {
    return NextResponse.json({ error: verificacion.error }, { status: verificacion.status });
  }

  const body = await request.json().catch(() => null);
  const idPlaca = typeof body?.id_placa === "string" ? body.id_placa.trim() : "";
  const negocioSlug = typeof body?.negocio_slug === "string" ? body.negocio_slug.trim() : "";
  const tipo = body?.tipo === "mesa" ? "mesa" : "individual";

  if (!idPlaca || !negocioSlug) {
    return NextResponse.json({ error: "id_placa y negocio_slug son obligatorios" }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("placas").upsert({
    id_placa: idPlaca,
    negocio_slug: negocioSlug,
    tipo,
    estado: "vendida"
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
