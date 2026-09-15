// Cliente de Supabase con la secret key (bypassa RLS). Server-only:
// nunca lo importes desde un componente "use client" ni desde código
// que termine en el bundle del navegador — solo desde server components
// o route handlers, donde SUPABASE_SECRET_KEY está disponible.

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY ?? "";

export const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    persistSession: false
  }
});
