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