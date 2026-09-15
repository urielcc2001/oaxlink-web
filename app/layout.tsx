import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OaxLink — Tu negocio, a un toque de distancia",
  description:
    "Tarjetas NFC y QR para negocios en Oaxaca: reseñas, redes sociales y menú digital en un solo toque."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
