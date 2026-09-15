-- Corre esto completo en el SQL editor de tu proyecto de Supabase.

create table if not exists negocios (
  slug text primary key,
  nombre text not null,
  bio text,
  logo_url text,
  google_review_url text,
  whatsapp text,
  facebook text,
  instagram text,
  menu_pdf_url text,
  plan text default 'basico',        -- 'basico' | 'pro'
  estado text default 'activo',      -- 'activo' | 'pausado'
  wifi_ssid text,
  wifi_password text,
  email_dueno text,
  telefono_contacto text,
  created_at timestamptz default now()
);

create table if not exists placas (
  id_placa text primary key,         -- '01', '02', '03'...
  negocio_slug text references negocios(slug),
  estado text default 'libre',       -- 'libre' | 'vendida'
  tipo text default 'individual',    -- 'individual' | 'mesa'
  numero_mesa int,                   -- solo aplica si tipo = 'mesa'
  activada_en timestamptz,
  vendida_en timestamptz
);

create table if not exists eventos (
  id bigint generated always as identity primary key,
  negocio_slug text references negocios(slug),
  tipo text not null,                -- 'scan' | 'click_google' | 'click_wa' | 'click_menu' | 'click_social'
  created_at timestamptz default now()
);

create index if not exists eventos_negocio_idx on eventos(negocio_slug, created_at);

-- Corre esto si tu tabla `negocios` ya existía antes de agregar TikTok al panel del dueño.
alter table negocios add column if not exists tiktok text;