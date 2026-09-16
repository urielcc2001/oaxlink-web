// ADMIN_EMAIL / NEXT_PUBLIC_ADMIN_EMAIL admiten varios correos separados por
// comas (ej. "a@x.com, b@x.com"). Este helper centraliza el parseo para que
// /login, /admin y las rutas /api/admin/* verifiquen igual.

export function listaDeEmailsAdmin(valor: string | undefined): string[] {
  return (valor ?? "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
}

export function esEmailAdmin(email: string | null | undefined, listaEnv: string | undefined): boolean {
  if (!email) return false;
  return listaDeEmailsAdmin(listaEnv).includes(email);
}
