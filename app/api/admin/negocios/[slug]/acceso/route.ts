import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verificarAdmin } from "@/lib/admin-auth";

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  const verificacion = await verificarAdmin(request);
  if (!verificacion.ok) {
    return NextResponse.json({ error: verificacion.error }, { status: verificacion.status });
  }

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ error: "email y password son obligatorios" }, { status: 400 });
  }

  const { data: negocio, error: negocioError } = await supabaseAdmin
    .from("negocios")
    .select("slug, email_dueno")
    .eq("slug", params.slug)
    .single();

  if (negocioError || !negocio) {
    return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });
  }

  if (negocio.email_dueno) {
    return NextResponse.json({ error: "Este negocio ya tiene una cuenta asociada" }, { status: 400 });
  }

  const { data: userData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("negocios")
    .update({ email_dueno: email })
    .eq("slug", params.slug);

  if (error) {
    await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, slug: params.slug, email, password });
}
