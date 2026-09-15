// Consultas de métricas para el dashboard, usando supabase-admin
// (bypassa RLS) — solo se debe llamar desde server components.

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
  total: number;
};

export async function getSerieDiaria(slug: string, dias = 14): Promise<PuntoSerie[]> {
  const desde = new Date();
  desde.setHours(0, 0, 0, 0);
  desde.setDate(desde.getDate() - (dias - 1));

  const { data } = await supabaseAdmin
    .from("eventos")
    .select("created_at")
    .eq("negocio_slug", slug)
    .gte("created_at", desde.toISOString());

  const conteoPorDia = new Map<string, number>();
  for (const fila of data ?? []) {
    const fecha = new Date(fila.created_at as string).toISOString().slice(0, 10);
    conteoPorDia.set(fecha, (conteoPorDia.get(fecha) ?? 0) + 1);
  }

  const serie: PuntoSerie[] = [];
  for (let i = 0; i < dias; i++) {
    const dia = new Date(desde);
    dia.setDate(desde.getDate() + i);
    const fecha = dia.toISOString().slice(0, 10);
    serie.push({ fecha, total: conteoPorDia.get(fecha) ?? 0 });
  }

  return serie;
}
