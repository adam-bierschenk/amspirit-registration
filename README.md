# AmSpirit Leadership Conference Registration (Next.js + Tailwind)

## Setup
1. Add the logo:
   - Save your logo as: `public/logo.png`

2. Admin protection (required):
   - Set `ADMIN_PASSWORD`
   - Optional: set `ADMIN_USER` (defaults to `admin`)

Example:
```bash
export ADMIN_PASSWORD='change-me'
export ADMIN_USER='admin'
```

## Run
```bash
npm install
npm run dev
```

## CSV Output
- Stored at: `data/registrations.csv`
- One row per attendee:
  `timestamp,chapter,director,registrant_email,attendee_first_name,attendee_last_name`

## Admin
- Visit: `/admin`
- Browser prompts for username/password (Basic Auth)
- Download CSV via button
