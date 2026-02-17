# AmSpirit Leadership Conference Registration (Next.js + Tailwind + Supabase)

This app is now configured to store registrations in Supabase so it can run on Vercel serverless functions (no local CSV writes required).

## Required Environment Variables

Set these in Vercel Project Settings and locally in `.env`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
ADMIN_USER=admin
ADMIN_PASSWORD=change-me
# Optional (defaults to "registrations")
SUPABASE_REGISTRATIONS_TABLE=registrations
```

`SUPABASE_SERVICE_ROLE_KEY` must stay server-side only. Do not expose it to the client.

## Supabase Table Setup

Run `supabase/schema.sql` in Supabase SQL Editor:

```sql
create table if not exists public.registrations (
  id bigint generated always as identity primary key,
  submitted_at timestamptz not null,
  chapter text not null,
  director text not null,
  registrant_email text not null,
  attendee_first_name text not null,
  attendee_last_name text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists registrations_submitted_at_idx
  on public.registrations (submitted_at desc, id desc);

alter table public.registrations enable row level security;
```

## Run Locally

```bash
npm install
npm run dev
```

## Admin

- Visit: `/admin`
- Browser prompts for Basic Auth (`ADMIN_USER` / `ADMIN_PASSWORD`)
- Download CSV via `/api/admin/download` (generated from Supabase rows)
