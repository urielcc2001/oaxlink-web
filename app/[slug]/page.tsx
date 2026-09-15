import { notFound } from "next/navigation";
import { getNegocio, registrarEvento } from "@/lib/negocios";
import { BotonesTarjeta } from "./botones-tarjeta";
import "./card.css";

export default async function TarjetaNegocio({
  params
}: {
  params: { slug: string };
}) {
  const negocio = await getNegocio(params.slug);
  if (!negocio) notFound();

  await registrarEvento(negocio.slug, "scan");

  return (
    <div className="page">
      <div className="card">
        <img src={negocio.logo} alt={negocio.nombre} className="avatar" />
        <h1>{negocio.nombre}</h1>
        <p>{negocio.bio}</p>

        <BotonesTarjeta negocio={negocio} />

        <div className="footer">
          Powered by <strong>OaxLink</strong>
        </div>
      </div>
    </div>
  );
}
