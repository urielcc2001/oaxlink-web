import { notFound } from "next/navigation";
import { getNegocio } from "@/lib/negocios";
import { getContadores, getSerieDiaria } from "@/lib/eventos";
import { GraficaSerie } from "./grafica-serie";
import "./dashboard.css";

export default async function DashboardNegocio({
  params
}: {
  params: { slug: string };
}) {
  const negocio = await getNegocio(params.slug);
  if (!negocio) notFound();

  const [contadores, serie] = await Promise.all([
    getContadores(negocio.slug),
    getSerieDiaria(negocio.slug, 14)
  ]);

  return (
    <div className="dash-page">
      <nav className="dash-nav">
        <div className="dash-logo">
          <span className="dash-logo-mark">OL</span>OaxLink
        </div>
        <div className="dash-nav-negocio">{negocio.nombre}</div>
      </nav>

      <div className="dash-content">
        <div className="dash-cards">
          <div className="dash-card">
            <span className="dash-card-label">Escaneos</span>
            <span className="dash-card-value">{contadores.scan}</span>
          </div>
          <div className="dash-card">
            <span className="dash-card-label">Reseñas de Google</span>
            <span className="dash-card-value">{contadores.click_google}</span>
          </div>
          <div className="dash-card">
            <span className="dash-card-label">WhatsApp</span>
            <span className="dash-card-value">{contadores.click_wa}</span>
          </div>
        </div>

        <div className="dash-chart-card">
          <h2 className="dash-chart-title">Eventos por día (últimos 14 días)</h2>
          <GraficaSerie datos={serie} />
        </div>
      </div>
    </div>
  );
}
