// Verificación compartida por las rutas /api/admin/*: confirma que el
// access_token pertenece a un usuario cuyo email está en ADMIN_EMAIL.

import { supabase } from "./supabase";
import { esEmailAdmin } from "./admin-emails";

type ResultadoVerificacion = { ok: true } | { ok: false; status: number; error: string };

export async function verificarAdmin(request: Request): Promise<ResultadoVerificacion> {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    return { ok: false, status: 401, error: "No autorizado" };
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user?.email) {
    return { ok: false, status: 401, error: "No autorizado" };
  }

  if (!esEmailAdmin(data.user.email, process.env.ADMIN_EMAIL)) {
    return { ok: false, status: 403, error: "Prohibido" };
  }

  return { ok: true };
}
