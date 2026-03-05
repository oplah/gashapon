-- ============================================================
-- Gashapon Schema
-- Run this in your Supabase SQL editor to set up the database
-- ============================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ============================================================
-- MACHINES
-- ============================================================
create table if not exists machines (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  theme       text not null default 'default',
  -- pastel theme key: default | blush | mint | lavender | peach | sky
  creator_name text,
  receiver_name text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================
-- CAPSULES
-- ============================================================
create table if not exists capsules (
  id          uuid primary key default gen_random_uuid(),
  machine_id  uuid not null references machines(id) on delete cascade,
  type        text not null check (type in ('text', 'image', 'link', 'quote')),
  -- type:  text  → plain message
  --        image → image URL (stored in Supabase storage)
  --        link  → URL + optional label
  --        quote → short quote with optional author
  content     jsonb not null,
  -- text:   { "message": "..." }
  -- image:  { "url": "...", "caption": "..." }
  -- link:   { "url": "...", "label": "...", "preview": "..." }
  -- quote:  { "text": "...", "author": "..." }
  color       text not null default 'blush',
  -- capsule color: blush | mint | lavender | peach | sky
  opened      boolean not null default false,
  opened_at   timestamptz,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- Index for fast capsule lookup per machine
create index if not exists idx_capsules_machine_id on capsules(machine_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
-- Machines: anyone can read (public link sharing), no auth needed for MVP
alter table machines enable row level security;

create policy "Anyone can view machines"
  on machines for select
  using (true);

create policy "Anyone can create machines"
  on machines for insert
  with check (true);

create policy "Anyone can update machines"
  on machines for update
  using (true);

-- Capsules: anyone can read/write (public MVP)
alter table capsules enable row level security;

create policy "Anyone can view capsules"
  on capsules for select
  using (true);

create policy "Anyone can create capsules"
  on capsules for insert
  with check (true);

create policy "Anyone can update capsules"
  on capsules for update
  using (true);

-- ============================================================
-- STORAGE (run separately in Supabase Dashboard → Storage)
-- ============================================================
-- Create a bucket named: capsule-images
-- Set it to PUBLIC
-- Allowed MIME types: image/jpeg, image/png, image/webp, image/gif
-- Max file size: 5MB

-- ============================================================
-- HELPER FUNCTION: auto-update updated_at
-- ============================================================
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger machines_updated_at
  before update on machines
  for each row execute procedure handle_updated_at();
