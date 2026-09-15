// Mapeo de "placas libres" (oaxlink.com/t/01, /t/02...) a un negocio.
//
// Cuando vendes placas 01-05 a un cliente, actualizas aquí (o en la tabla
// `placas` de Supabase) el slug al que apuntan. Una placa sin negocio
// asignado se considera "libre" (todavía en stock, no vendida).
//
// Sugerencia de esquema en Supabase:
//   tabla placas: id_placa (pk), negocio_slug (nullable), activada_en (timestamp)

const PLACAS: Record<string, string | null> = {
  "01": "motoneto",
  "02": null,
  "03": null,
  "04": null,
  "05": null
};

export async function resolverPlaca(id: string): Promise<string | null> {
  // TODO cuando conectes Supabase:
  // const { data } = await supabase.from('placas').select('negocio_slug').eq('id_placa', id).single();
  // return data?.negocio_slug ?? null;
  return PLACAS[id] ?? null;
}
