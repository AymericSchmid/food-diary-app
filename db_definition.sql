create table public.diary_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  mean_name text not null,
  entry_type text not null check (entry_type in ('manual', 'photo')),

  total_energy_kcal numeric(8,2) not null default 0,
  logged_at timestamptz not null default now(),

  created_at timestamptz not null default now()
);

create table public.diary_items (
  id uuid primary key default gen_random_uuid(),
  diary_entry_id uuid not null references public.diary_entries(id) on delete cascade,

  name text not null,
  amount numeric(8,2),
  unit text not null default 'g',
  energy_kcal numeric(8,2) not null default 0,

  created_at timestamptz not null default now()
);

alter table public.diary_entries enable row level security;
alter table public.diary_items enable row level security;

create policy "Users can view own diary entries"
on public.diary_entries
for select
using (auth.uid() = user_id);

create policy "Users can insert own diary entries"
on public.diary_entries
for insert
with check (auth.uid() = user_id);

create policy "Users can delete own diary entries"
on public.diary_entries
for delete
using (auth.uid() = user_id);

create policy "Users can view own diary items"
on public.diary_items
for select
using(
  exists (
    select 1
    from public.diary_entries
    where diary_entries.id = diary_items.diary_entry_id
    and diary_entries.user_id = auth.uid()
  )
);

create policy "Users can insert own diary items"
on public.diary_items
for insert
with check(
  exists (
    select 1
    from public.diary_entries
    where diary_entries.id = diary_items.diary_entry_id
    and diary_entries.user_id = auth.uid()
  )
);

create policy "Users can delete own diary items"
on public.diary_items
for delete
using(
  exists (
    select 1
    from public.diary_entries
    where diary_entries.id = diary_items.diary_entry_id
    and diary_entries.user_id = auth.uid()
  )
);

alter table public.diary_items
add column logmeal_id text;

alter table public.diary_entries
add column if not exists image_url text;

create policy "Users can upload their own meal images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'meal-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can view their own meal images"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'meal-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  age integer,
  sex text,
  weight_kg numeric(6,2),
  height_cm numeric(6,2),
  goal text,
  dietary_preference text,
  activity_level text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can create their own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);