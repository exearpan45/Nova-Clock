-- NOVA CLOCK cloud schema
-- Run this in the Supabase SQL Editor. Never put a service-role key in the browser.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),
  accent_color text not null default '#d8ef68',
  clock_style text not null default 'analog',
  clock_format text not null default '24h' check (clock_format in ('12h', '24h')),
  show_seconds boolean not null default true,
  show_date boolean not null default true,
  show_weekday boolean not null default true,
  selected_timezone text not null default 'UTC',
  sound_enabled boolean not null default true,
  vibration_enabled boolean not null default true,
  notifications_enabled boolean not null default false,
  animation_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.alarms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Alarm',
  alarm_time time not null,
  enabled boolean not null default true,
  repeat_days smallint[] not null default '{}',
  ringtone text not null default 'gentle',
  vibration boolean not null default true,
  snooze_duration smallint not null default 9 check (snooze_duration between 1 and 60),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.world_clocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  city text not null,
  timezone text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.countdowns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  target_at timestamptz not null,
  accent_color text not null default '#d8ef68',
  created_at timestamptz not null default now()
);

create index if not exists alarms_user_id_idx on public.alarms(user_id);
create index if not exists world_clocks_user_id_idx on public.world_clocks(user_id);
create index if not exists countdowns_user_id_idx on public.countdowns(user_id);

alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.alarms enable row level security;
alter table public.world_clocks enable row level security;
alter table public.countdowns enable row level security;

create policy "Users can manage their own profile"
  on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "Users can manage their own settings"
  on public.user_settings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage their own alarms"
  on public.alarms for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage their own world clocks"
  on public.world_clocks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage their own countdowns"
  on public.countdowns for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do update set email = excluded.email, updated_at = now();
  insert into public.user_settings (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();