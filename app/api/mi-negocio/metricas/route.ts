import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getContadores, getSerieDiaria } from "@/lib/eventos";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { data: negocio, error: negocioError } = await supabaseAdmin
    .from("negocios")
    .select("slug")
    .eq("email_dueno", userData.user.email)
    .single();

  if (negocioError || !negocio) {
    return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });
  }

  const [contadores, serie] = await Promise.all([
    getContadores(negocio.slug),
    getSerieDiaria(negocio.slug, 14)
  ]);

  return NextResponse.json({
    scans: contadores.scan,
    clicksGoogle: contadores.click_google,
    clicksWhatsapp: contadores.click_wa,
    serie
  });
}
