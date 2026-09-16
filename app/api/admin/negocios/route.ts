import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verificarAdmin } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const verificacion = await verificarAdmin(request);
  if (!verificacion.ok) {
    return NextResponse.json({ error: verificacion.error }, { status: verificacion.status });
  }

  const { data, error } = await supabaseAdmin
    .from("negocios")
    .select("slug, nombre, plan, estado")
    .order("nombre");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ negocios: data });
}

export async function POST(request: Request) {
  const verificacion = await verificarAdmin(request);
  if (!verificacion.ok) {
    return NextResponse.json({ error: verificacion.error }, { status: verificacion.status });
  }

  const body = await request.json().catch(() => null);
  const slug = typeof body?.slug === "string" ? body.slug.trim() : "";
  const nombre = typeof body?.nombre === "string" ? body.nombre.trim() : "";

  if (!slug || !nombre) {
    return NextResponse.json({ error: "slug y nombre son obligatorios" }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("negocios").insert({
    slug,
    nombre,
    bio: body?.bio || null,
    whatsapp: body?.whatsapp || null,
    google_review_url: body?.google_review_url || null,
    facebook: body?.facebook || null,
    instagram: body?.instagram || null,
    tiktok: body?.tiktok || null,
    logo_url: body?.logo_url || null,
    email_dueno: body?.email_dueno || null
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, slug });
}
