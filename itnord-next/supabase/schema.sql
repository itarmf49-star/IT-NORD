-- Run this in Supabase SQL Editor (or any Postgres) once.
-- Then set NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in Vercel.

create extension if not exists "pgcrypto";

create table if not exists public.users (
  id text primary key,
  name text,
  email text unique,
  email_verified timestamptz,
  image text,
  password_hash text,
  role text not null default 'CUSTOMER' check (role in ('ADMIN', 'EDITOR', 'CUSTOMER')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id text primary key,
  title text not null,
  slug text not null unique,
  category text not null,
  description text not null,
  image_url text,
  video_url text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id text primary key,
  name text not null,
  email text,
  phone text,
  subject text,
  body text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.page_views (
  id text primary key,
  path text not null,
  referrer text,
  user_agent text,
  created_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id text primary key,
  user_id text not null references public.users (id) on delete cascade,
  status text not null default 'DRAFT' check (status in ('DRAFT', 'SENT', 'PAID', 'VOID')),
  currency text not null default 'MRU',
  subtotal int not null default 0,
  tax int not null default 0,
  total int not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoice_items (
  id text primary key,
  invoice_id text not null references public.invoices (id) on delete cascade,
  description text not null,
  quantity int not null default 1,
  unit_price int not null,
  total int not null
);

create table if not exists public.service_products (
  id text primary key,
  slug text not null unique,
  title text not null,
  description text not null,
  base_price int not null,
  currency text not null default 'MRU',
  specs jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pricing_rules (
  id text primary key,
  name text not null,
  priority int not null default 0,
  match jsonb not null,
  price int not null,
  currency text not null default 'MRU',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_threads (
  id text primary key,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id text primary key,
  thread_id text not null references public.chat_threads (id) on delete cascade,
  sender_id text references public.users (id),
  body text not null,
  is_ai boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_usage (
  id text primary key,
  user_id text references public.users (id),
  model text not null,
  tokens int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id text primary key,
  actor_id text,
  action text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.coverage_plans (
  id text primary key,
  user_id text references public.users (id) on delete set null,
  area_sqm int not null,
  floors int not null,
  wall_loss_db int not null,
  recommended_aps int not null,
  recommended_switches int not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_page_views_created on public.page_views (created_at);
create index if not exists idx_chat_messages_thread on public.chat_messages (thread_id);
create index if not exists idx_invoices_user on public.invoices (user_id);
