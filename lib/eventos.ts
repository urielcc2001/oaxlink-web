// Consultas de métricas para el panel del dueño (/mi-negocio), usando
// supabase-admin (bypassa RLS) — solo se debe llamar desde server components
// o route handlers.

import { supabaseAdmin } from "./supabase-admin";

export type Contadores = {
  scan: number;
  click_google: number;
  click_wa: number;
};

export async function getContadores(slug: string): Promise<Contadores> {
  const tipos = ["scan", "click_google", "click_wa"] as const;

  const resultados = await Promise.all(
    tipos.map((tipo) =>
      supabaseAdmin
        .from("eventos")
        .select("*", { count: "exact", head: true })
        .eq("negocio_slug", slug)
        .eq("tipo", tipo)
    )
  );

  const [scan, clickGoogle, clickWa] = resultados;

  return {
    scan: scan.count ?? 0,
    click_google: clickGoogle.count ?? 0,
    click_wa: clickWa.count ?? 0
  };
}

export type PuntoSerie = {
  fecha: string;
  scans: number;
  google: number;
  wa: number;
};

const TIPO_A_CAMPO: Record<string, keyof Omit<PuntoSerie, "fecha">> = {
  scan: "scans",
  click_google: "google",
  click_wa: "wa"
};

export async function getSerieDiaria(slug: string, dias = 14): Promise<PuntoSerie[]> {
  const desde = new Date();
  desde.setHours(0, 0, 0, 0);
  desde.setDate(desde.getDate() - (dias - 1));

  const { data } = await supabaseAdmin
    .from("eventos")
    .select("tipo, created_at")
    .eq("negocio_slug", slug)
    .gte("created_at", desde.toISOString());

  const conteoPorDia = new Map<string, { scans: number; google: number; wa: number }>();
  for (const fila of data ?? []) {
    const campo = TIPO_A_CAMPO[fila.tipo as string];
    if (!campo) continue;

    const fecha = new Date(fila.created_at as string).toISOString().slice(0, 10);
    const acumulado = conteoPorDia.get(fecha) ?? { scans: 0, google: 0, wa: 0 };
    acumulado[campo] += 1;
    conteoPorDia.set(fecha, acumulado);
  }

  const serie: PuntoSerie[] = [];
  for (let i = 0; i < dias; i++) {
    const dia = new Date(desde);
    dia.setDate(desde.getDate() + i);
    const fecha = dia.toISOString().slice(0, 10);
    const acumulado = conteoPorDia.get(fecha) ?? { scans: 0, google: 0, wa: 0 };
    serie.push({ fecha, ...acumulado });
  }

  return serie;
}
