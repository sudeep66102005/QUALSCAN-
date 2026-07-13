-- ============================================================
-- QUALSCAN — Leads table
-- Run this in your Supabase project:
--   Dashboard → SQL Editor → New query → paste → Run
--
-- This creates a single `leads` table that stores submissions
-- from BOTH website forms:
--   1. Home page form   (index.html   #homeLeadForm)
--   2. Contact page form (contact.html #lead-form)
-- Columns not used by a given form are simply left null.
-- ============================================================

create table if not exists public.leads (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  source       text,          -- 'home' or 'contact'
  first_name   text,          -- home form
  last_name    text,          -- home form
  full_name    text,          -- contact form
  email        text,
  phone        text,          -- home form
  organization text,          -- company / hospital name
  region       text,
  role         text,          -- home form (healthcare role)
  interest     text,          -- service of interest
  message      text
);

-- Speed up "newest first" lead browsing in the dashboard.
create index if not exists leads_created_at_idx
  on public.leads (created_at desc);

-- ============================================================
-- Row Level Security
-- The website uses the public "publishable" (anon) key, which
-- ships in the browser. We therefore allow anon to INSERT only,
-- and deliberately DO NOT grant SELECT/UPDATE/DELETE so nobody
-- can read or tamper with captured leads from the client side.
-- View leads via the Supabase dashboard (Table editor) instead.
-- ============================================================

alter table public.leads enable row level security;

drop policy if exists "Allow public form inserts" on public.leads;

create policy "Allow public form inserts"
  on public.leads
  for insert
  to anon, authenticated
  with check (true);
