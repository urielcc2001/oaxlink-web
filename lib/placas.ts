// Mapeo de "placas libres" (oaxlink.com/t/01, /t/02...) a un negocio,
// conectado a la tabla `placas` de Supabase. Una placa sin negocio
// asignado (negocio_slug null) se considera "libre".

import { supabase } from "./supabase";

export async function resolverPlaca(id: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("placas")
    .select("negocio_slug")
    .eq("id_placa", id)
    .single();

  if (error || !data) return null;
  return data.negocio_slug ?? null;
}
