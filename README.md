# NaijaShield Frontend (UI MVP)

NaijaShield is a Trust, Safety, and Fraud Intelligence dashboard UI built with Next.js.
This repository currently focuses on frontend UX and mock data flows, and is ready for API integration.

## Run Locally

1. Install dependencies

```bash
npm install
```

2. Start the app

```bash
npm run dev
```

3. Open:

http://localhost:3000

## Login (Normal Email + Password)

This MVP uses normal email/password fields on the login page.

- URL: `/login`
- Enter any non-empty email and password to sign in

Examples:

- `analyst@mtn.ng` + `password123`
- `admin@naijashield.ng` + `password123`
- `compliance@naijashield.ng` + `password123`

Role behavior in current mock logic:

- If email contains `admin` → redirects to `/overview`
- If email contains `compliance` → redirects to `/compliance`
- Otherwise → redirects to `/overview`

## Available Routes

- `/login` - Auth screen
- `/overview` - Dashboard command center
- `/threat-feed` - Threat table and details
- `/compliance` - Compliance reports view
- `/user-management` - User and role view
- `/settings` - System settings placeholders

## Notes for Team Members

- UI is mock-data driven from `lib/mock-data.ts`
- Real backend/auth integrations are pending
- Logos/assets live in `public/`
