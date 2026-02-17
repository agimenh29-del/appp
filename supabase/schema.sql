-- Run this in Supabase SQL Editor
-- Secure baseline for frontend + Supabase:
-- - Public can read products/portfolio/site settings
-- - Public can create orders
-- - Only authenticated admin users in app_admin_users can write products/portfolio/site settings

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

create table if not exists public.app_admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  created_at timestamptz not null default now()
);

insert into public.app_site_settings (id, data)
values (1, '{}'::jsonb)
on conflict (id) do nothing;

alter table public.app_products enable row level security;
alter table public.app_portfolio enable row level security;
alter table public.app_orders enable row level security;
alter table public.app_site_settings enable row level security;
alter table public.app_admin_users enable row level security;

create or replace function public.is_admin_user()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.app_admin_users a
    where a.user_id = auth.uid()
  );
$$;

drop policy if exists app_products_public_read on public.app_products;
create policy app_products_public_read
on public.app_products for select
using (true);

drop policy if exists app_products_admin_insert on public.app_products;
create policy app_products_admin_insert
on public.app_products for insert
with check (public.is_admin_user());

drop policy if exists app_products_admin_update on public.app_products;
create policy app_products_admin_update
on public.app_products for update
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists app_products_admin_delete on public.app_products;
create policy app_products_admin_delete
on public.app_products for delete
using (public.is_admin_user());

drop policy if exists app_portfolio_public_read on public.app_portfolio;
create policy app_portfolio_public_read
on public.app_portfolio for select
using (true);

drop policy if exists app_portfolio_admin_insert on public.app_portfolio;
create policy app_portfolio_admin_insert
on public.app_portfolio for insert
with check (public.is_admin_user());

drop policy if exists app_portfolio_admin_update on public.app_portfolio;
create policy app_portfolio_admin_update
on public.app_portfolio for update
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists app_portfolio_admin_delete on public.app_portfolio;
create policy app_portfolio_admin_delete
on public.app_portfolio for delete
using (public.is_admin_user());

drop policy if exists app_orders_admin_read on public.app_orders;
create policy app_orders_admin_read
on public.app_orders for select
using (public.is_admin_user());

drop policy if exists app_orders_public_insert on public.app_orders;
create policy app_orders_public_insert
on public.app_orders for insert
with check (true);

drop policy if exists app_site_settings_public_read on public.app_site_settings;
create policy app_site_settings_public_read
on public.app_site_settings for select
using (id = 1);

drop policy if exists app_site_settings_admin_insert on public.app_site_settings;
create policy app_site_settings_admin_insert
on public.app_site_settings for insert
with check (public.is_admin_user());

drop policy if exists app_site_settings_admin_update on public.app_site_settings;
create policy app_site_settings_admin_update
on public.app_site_settings for update
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists app_site_settings_admin_delete on public.app_site_settings;
create policy app_site_settings_admin_delete
on public.app_site_settings for delete
using (public.is_admin_user());

drop policy if exists app_admin_users_self_read on public.app_admin_users;
create policy app_admin_users_self_read
on public.app_admin_users for select
using (auth.uid() = user_id);
