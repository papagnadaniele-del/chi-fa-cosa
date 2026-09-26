create type public.app_role as enum ('admin', 'user');

create table public.profiles (
  id uuid primary key,
  codice_fiscale text not null unique,
  full_name text not null default '',
  created_at timestamptz not null default now()
);
grant select on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

create policy "own profile or admin" on public.profiles for select to authenticated
  using (id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "own roles or admin" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

create table public.turno_weeks (
  week_iso text primary key,
  cells jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.turno_weeks to authenticated;
grant all on public.turno_weeks to service_role;
alter table public.turno_weeks enable row level security;
create policy "read weeks" on public.turno_weeks for select to authenticated
  using (public.has_role(auth.uid(), 'user') or public.has_role(auth.uid(), 'admin'));
create policy "admin write weeks" on public.turno_weeks for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create table public.app_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb
);
grant select, insert, update, delete on public.app_settings to authenticated;
grant all on public.app_settings to service_role;
alter table public.app_settings enable row level security;
create policy "read settings" on public.app_settings for select to authenticated
  using (public.has_role(auth.uid(), 'user') or public.has_role(auth.uid(), 'admin'));
create policy "admin write settings" on public.app_settings for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));