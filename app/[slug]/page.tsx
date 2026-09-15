import { notFound } from "next/navigation";
import { getNegocio } from "@/lib/negocios";
import "./card.css";

export default async function TarjetaNegocio({
  params
}: {
  params: { slug: string };
}) {
  const negocio = await getNegocio(params.slug);
  if (!negocio) notFound();

  return (
    <div className="page">
      <div className="card">
        <img src={negocio.logo} alt={negocio.nombre} className="avatar" />
        <h1>{negocio.nombre}</h1>
        <p>{negocio.bio}</p>

        <a href={negocio.googleReviewUrl} target="_blank" rel="noreferrer" className="btn btn-google">
          ⭐ Déjanos tu reseña en Google
        </a>

        {negocio.facebook && (
          <a href={negocio.facebook} target="_blank" rel="noreferrer" className="btn btn-facebook">
            📘 Síguenos en Facebook
          </a>
        )}
        {!negocio.facebook && negocio.instagram && (
          <a href={negocio.instagram} target="_blank" rel="noreferrer" className="btn btn-instagram">
            📸 Síguenos en Instagram
          </a>
        )}

        {negocio.menuPdfUrl && (
          <a href={negocio.menuPdfUrl} target="_blank" rel="noreferrer" className="btn btn-google">
            📎 Ver menú
          </a>
        )}

        <a href={negocio.whatsapp} target="_blank" rel="noreferrer" className="btn btn-wa">
          💬 Escríbenos por WhatsApp
        </a>

        <div className="footer">
          Powered by <strong>OaxLink</strong>
        </div>
      </div>
    </div>
  );
}
