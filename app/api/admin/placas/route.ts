import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (userData.user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Prohibido" }, { status: 403 });
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
