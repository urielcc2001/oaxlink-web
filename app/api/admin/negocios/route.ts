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
