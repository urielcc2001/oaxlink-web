import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verificarAdmin } from "@/lib/admin-auth";

export async function PATCH(request: Request, { params }: { params: { slug: string } }) {
  const verificacion = await verificarAdmin(request);
  if (!verificacion.ok) {
    return NextResponse.json({ error: verificacion.error }, { status: verificacion.status });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("negocios")
    .update({
      nombre: body.nombre,
      bio: body.bio || null,
      whatsapp: body.whatsapp || null,
      google_review_url: body.google_review_url || null,
      facebook: body.facebook || null,
      instagram: body.instagram || null,
      tiktok: body.tiktok || null,
      logo_url: body.logo_url || null,
      email_dueno: body.email_dueno || null,
      menu_pdf_url: body.menu_pdf_url || null,
      menu_pdf_label: body.menu_pdf_label || null,
      banco: body.banco || null,
      titular_cuenta: body.titular_cuenta || null,
      clabe: body.clabe || null
    })
    .eq("slug", params.slug);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: { params: { slug: string } }) {
  const verificacion = await verificarAdmin(request);
  if (!verificacion.ok) {
    return NextResponse.json({ error: verificacion.error }, { status: verificacion.status });
  }

  const slug = params.slug;

  const { error: errorEventos } = await supabaseAdmin
    .from("eventos")
    .delete()
    .eq("negocio_slug", slug);
  if (errorEventos) {
    return NextResponse.json({ error: errorEventos.message }, { status: 500 });
  }

  const { error: errorPlacas } = await supabaseAdmin
    .from("placas")
    .delete()
    .eq("negocio_slug", slug);
  if (errorPlacas) {
    return NextResponse.json({ error: errorPlacas.message }, { status: 500 });
  }

  const { error: errorNegocio } = await supabaseAdmin.from("negocios").delete().eq("slug", slug);
  if (errorNegocio) {
    return NextResponse.json({ error: errorNegocio.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
