// Capa de datos de negocios.
//
// Hoy es un objeto estático (igual que el index.html de pruebas), para que
// el sitio funcione sin depender todavía de Supabase.
//
// Cuando conectes la base de datos, reemplaza el cuerpo de getNegocio()
// por una consulta a la tabla `negocios` (ver README.md) y borra el
// objeto NEGOCIOS de abajo. El resto de la app (rutas, componentes)
// no necesita cambiar porque ya consume esta función.

export type Negocio = {
  slug: string;
  nombre: string;
  bio: string;
  logo: string;
  googleReviewUrl: string;
  whatsapp: string;
  facebook?: string;
  instagram?: string;
  menuPdfUrl?: string;
};

const NEGOCIOS: Record<string, Negocio> = {
  cafe: {
    slug: "cafe",
    nombre: "Café Santo Domingo",
    bio: "El mejor café de especialidad del centro de Oaxaca.",
    logo: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200",
    googleReviewUrl: "https://maps.google.com",
    instagram: "https://instagram.com",
    whatsapp: "https://wa.me/529510000000?text=Hola,%20quiero%20hacer%20un%20pedido"
  },
  barber: {
    slug: "barber",
    nombre: "Barbería Tradicional Oaxaca",
    bio: "Corte clásico, barba y estilo profesional.",
    logo: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200",
    googleReviewUrl: "https://maps.google.com",
    instagram: "https://instagram.com",
    whatsapp: "https://wa.me/529510000000?text=Hola,%20quiero%20agendar%20cita"
  },
  motoneto: {
    slug: "motoneto",
    nombre: "Refaccionaria de Motos MOTONETO",
    bio: "Refacciones, accesorios y servicio mecánico para tu moto en Oaxaca.",
    logo: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=200",
    googleReviewUrl:
      "https://search.google.com/local/writereview?placeid=ChIJsdxdDaUZx4URLEJQc9bHKvQ",
    facebook: "https://www.facebook.com/profile.php?id=61575582748381&locale=es_LA",
    whatsapp: "https://wa.me/529511898601?text=Hola,%20busco%20una%20refacción%20para%20mi%20moto"
  }
};

export async function getNegocio(slug: string): Promise<Negocio | null> {
  // TODO cuando conectes Supabase:
  // const { data } = await supabase.from('negocios').select('*').eq('slug', slug).single();
  // return data as Negocio | null;
  return NEGOCIOS[slug] ?? null;
}

export async function registrarEvento(
  slug: string,
  tipo: "scan" | "click_google" | "click_wa" | "click_menu" | "click_social"
) {
  // TODO cuando conectes Supabase:
  // await supabase.from('eventos').insert({ negocio_slug: slug, tipo });
  console.log(`[evento] ${slug} -> ${tipo}`);
}
