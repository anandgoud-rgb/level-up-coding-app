-- ============================================================
-- Level Up — Supabase Schema
-- Run this once in your Supabase project → SQL Editor
-- ============================================================

-- 1. STUDENTS table (one row per verified student)
create table if not exists public.students (
  id          uuid primary key,          -- = Supabase auth user id
  name        text not null,
  email       text not null unique,
  program     text,                       -- B.Tech / BCA / MCA
  college     text,
  batch       text,                       -- e.g. "2025-2029"
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- 2. PROGRESS table (one row per student, upserted on every completion)
create table if not exists public.progress (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references public.students(id) on delete cascade,
  html_done     int  default 0,           -- 0–10 levels completed
  css_done      int  default 0,
  js_done       int  default 0,
  instagram     bool default false,       -- Instagram capstone done
  java_levels   int  default 0,           -- 0–9 Java quest levels done
  atm_done      bool default false,       -- ATM capstone done
  xp            int  default 0,
  updated_at    timestamptz default now(),
  unique(student_id)                      -- one progress row per student
);

-- 3. Enable Row Level Security
alter table public.students enable row level security;
alter table public.progress enable row level security;

-- 4. RLS Policies — students can read/write only their own row
create policy "students: own row" on public.students
  for all using (auth.uid() = id);

create policy "progress: own row" on public.progress
  for all using (auth.uid() = student_id);

-- 5. Upsert support — allow insert + update on conflict
-- (The app uses POST with Prefer: return=representation which handles upsert)

-- ============================================================
-- ADMIN VIEW — query this to see all student progress
-- (Run in Supabase Studio → SQL Editor, or use Table Editor)
-- ============================================================
-- select
--   s.name, s.email, s.program, s.college, s.batch,
--   p.html_done, p.css_done, p.js_done,
--   case when p.instagram then '✅' else '❌' end as instagram,
--   p.java_levels,
--   case when p.atm_done then '✅' else '❌' end as atm,
--   p.xp,
--   p.updated_at
-- from public.students s
-- left join public.progress p on p.student_id = s.id
-- order by s.college, s.batch, s.name;
