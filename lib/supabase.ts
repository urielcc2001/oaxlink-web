// Cliente de Supabase. No se usa todavía en lib/negocios.ts ni lib/placas.ts
// (esos siguen con datos estáticos), pero ya queda listo para cuando
// crees el proyecto en supabase.com y agregues las variables de entorno.
//
// 1. Crea el proyecto en https://supabase.com (plan free).
// 2. Copia la URL y la anon key a .env.local:
//      NEXT_PUBLIC_SUPABASE_URL=...
//      NEXT_PUBLIC_SUPABASE_ANON_KEY=...
// 3. Corre el SQL de schema.sql en el SQL editor de Supabase.
// 4. Reemplaza los TODO de lib/negocios.ts y lib/placas.ts por consultas reales.

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
