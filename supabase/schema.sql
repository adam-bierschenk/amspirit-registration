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
