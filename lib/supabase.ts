// Cliente público de Supabase (anon key). Es un singleton — todo el código
// de cliente debe importar esta misma instancia en vez de llamar a
// createClient() de nuevo, para no generar sesiones/listeners duplicados.

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});
