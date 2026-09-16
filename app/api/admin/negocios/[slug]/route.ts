import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verificarAdmin } from "@/lib/admin-auth";

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
