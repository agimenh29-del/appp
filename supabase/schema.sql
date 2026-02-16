-- Run this in Supabase SQL Editor
-- This schema stores your existing app objects as JSON payloads so your current frontend can keep working.

create extension if not exists pgcrypto;

create table if not exists public.app_products (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table if not exists public.app_portfolio (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table if not exists public.app_orders (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table if not exists public.app_site_settings (
  id int primary key,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

insert into public.app_site_settings (id, data)
values (1, jsonb_build_object('adminPasscode', 'change-this-passcode'))
on conflict (id) do nothing;

-- For initial setup only (opens access with anon key):
-- Tighten these later with RLS policies or move writes to Supabase Edge Functions.
alter table public.app_products enable row level security;
alter table public.app_portfolio enable row level security;
alter table public.app_orders enable row level security;
alter table public.app_site_settings enable row level security;

drop policy if exists app_products_public_rw on public.app_products;
create policy app_products_public_rw on public.app_products for all using (true) with check (true);

drop policy if exists app_portfolio_public_rw on public.app_portfolio;
create policy app_portfolio_public_rw on public.app_portfolio for all using (true) with check (true);

drop policy if exists app_orders_public_rw on public.app_orders;
create policy app_orders_public_rw on public.app_orders for all using (true) with check (true);

drop policy if exists app_site_settings_public_rw on public.app_site_settings;
create policy app_site_settings_public_rw on public.app_site_settings for all using (true) with check (true);
