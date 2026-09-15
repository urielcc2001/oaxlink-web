import { redirect, notFound } from "next/navigation";
import { resolverPlaca } from "@/lib/placas";

export default async function Placa({ params }: { params: { id: string } }) {
  const slug = await resolverPlaca(params.id);

  // Placa sin vender todavía (en stock, sin negocio asignado).
  if (slug === null) {
    return (
      <div style={{ padding: 40, fontFamily: "system-ui", textAlign: "center" }}>
        <h1>Esta placa aún no está activada</h1>
        <p>Si eres dueño de un negocio y quieres activarla, escríbenos por WhatsApp.</p>
      </div>
    );
  }

  redirect(`/${slug}`);
}
