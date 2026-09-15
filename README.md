# OaxLink — App

Migración del `index.html` de pruebas a Next.js. Estructura real de rutas,
lista para conectar Supabase cuando quieras.

## Cómo correrlo local

```bash
npm install
npm run dev
```

Abre http://localhost:3000

- `/` — landing de ventas (la que vamos a usar para captar negocios)
- `/cafe`, `/barber`, `/motoneto` — tarjetas de negocio de ejemplo (antes `?b=cafe`)
- `/t/01` — ejemplo de placa física ya vinculada a `motoneto`
- `/t/02` — ejemplo de placa libre (sin vender todavía)

## Qué cambió respecto al index.html de pruebas

- El query param `?b=cafe` se volvió una ruta real: `/cafe`.
- Los datos de negocios siguen estáticos por ahora, pero viven en
  `lib/negocios.ts` en vez de estar sueltos en el HTML — ya con la forma
  exacta que van a tener cuando vengan de Supabase.
- Se agregó `/t/[id]`, el sistema de placas libres: resuelve un ID físico
  (grabado una sola vez en el NFC/QR) contra el negocio al que está
  vinculado hoy.
- La raíz `/` ya no es una tarjeta de negocio, es la landing de ventas.

## Cuando conectes Supabase

1. Crea el proyecto en supabase.com (plan free).
2. Corre `schema.sql` en el SQL editor — crea las tablas `negocios`,
   `placas` y `eventos`.
3. Agrega a `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
4. En `lib/negocios.ts` y `lib/placas.ts` ya están los `TODO` marcados
   con la consulta exacta que reemplaza los datos estáticos — no hay que
   tocar nada más de la app.
5. `registrarEvento()` en `lib/negocios.ts` es donde vas a insertar cada
   escaneo/clic en la tabla `eventos`; ya está llamado desde donde
   corresponde, solo falta activar el insert real.

## Pendiente antes de vender en serio

- Conectar Supabase (arriba).
- Botón de subir PDF de menú + logo (Supabase Storage) — hoy `menuPdfUrl`
  se puede poner a mano en `lib/negocios.ts` mientras tanto.
- Dashboard de métricas (3 contadores + 1 gráfica) leyendo la tabla
  `eventos` — probablemente la siguiente pieza a construir.
- Deploy: conectar este repo a tu proyecto de Vercel existente
  (oaxlink.com) en vez del HTML estático actual.
