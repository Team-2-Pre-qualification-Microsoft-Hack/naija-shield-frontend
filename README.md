# NaijaShield

**Real-time fraud intelligence platform for Nigerian telecom networks.**  
NaijaShield intercepts, classifies, and scores SMS and voice threats across Nigerian carriers — protecting end users, supporting regulatory compliance, and exposing fraud patterns through a live operations dashboard.

---

## Overview

NaijaShield is a **B2B2C platform** built for telecom operators and financial institutions. It exposes a full internal operations surface for SOC analysts and compliance officers, alongside a public-facing number reputation tool that any Nigerian — or any bank app — can query before engaging with an unknown number.

```
Telecom intercept → AI classification → Risk scoring → SOC dashboard
                                                     → Public reputation API
                                                     → Compliance reports (CBN / NCC)
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.4 (App Router) |
| Language | TypeScript 5 |
| UI | Tailwind CSS v4, shadcn/ui, Radix UI |
| Charts | Chart.js 4 + react-chartjs-2 |
| Maps | react-simple-maps (Nigeria choropleth) |
| Data fetching | SWR 2 |
| State | React 19 + Zustand |
| PDF generation | jsPDF + jsPDF-AutoTable |
| Auth | JWT (access + refresh tokens), cookie-based RBAC |
| Backend | REST API (Azure App Service — .NET / Kestrel) |

---

## Features

### Internal Dashboard (authenticated)

| Route | Roles | Description |
|-------|-------|-------------|
| `/overview` | All | Command Centre — KPI cards, Threat Velocity chart (Chart.js), live incident table, Nigeria threat heatmap |
| `/threat-feed` | SOC Analyst, Admin | Paginated incident table with search, detail panel with AI explanation and deepfake score |
| `/compliance` | Compliance Officer, Admin | Stats, channel breakdown, classification table, PDF report generator (CBN / NCC / General) |
| `/user-management` | Admin | Invite users, view roles and activity, remove users |
| `/lookup` | All | Internal number reputation search with score ring, breakdown bars, and incident history |
| `/settings` | Admin | System settings |

### Public Routes (no auth required)

| Route | Description |
|-------|-------------|
| `/users/lookup` | Consumer-facing number reputation checker — enter any Nigerian number, get a fraud verdict, score, and incident history |
| `/login` | Email + password sign-in with Microsoft SSO button |
| `/invite/accept` | Invite acceptance flow — set password to activate account |

### Fraud Intelligence API (public endpoint)

```
GET /api/numbers/{phone}/reputation
```

Returns a fraud reputation score (0–100), verdict, incident breakdown, flagged fraud types, and up to 5 recent incidents for any Nigerian phone number. No authentication required — designed for direct integration into bank apps and fintech platforms.

**Verdict levels:** `UNKNOWN` · `CLEAN` · `LOW_RISK` · `SUSPICIOUS` · `HIGH_RISK`

---

## Role-Based Access Control

Three roles with distinct access:

| Role | Access |
|------|--------|
| `SOC_ANALYST` | Overview, Threat Feed, Number Lookup |
| `COMPLIANCE_OFFICER` | Overview, Compliance, Number Lookup |
| `SYSTEM_ADMIN` | Full access including User Management and Settings |

RBAC is enforced at three layers:
1. **Server** — `proxy.ts` (Next.js middleware) checks JWT cookie and role cookie before serving any route
2. **Sidebar** — nav items filtered client-side by `user.role`
3. **Mobile nav** — same filtering applied to the drawer

---

## Project Structure

```
naijashield/
├── app/
│   ├── (auth)/                  # Unauthenticated pages
│   │   ├── login/
│   │   ├── accept-invite/
│   │   └── invite/accept/
│   ├── (dashboard)/             # Authenticated pages (sidebar layout)
│   │   ├── overview/
│   │   ├── threat-feed/
│   │   ├── compliance/
│   │   ├── user-management/
│   │   ├── lookup/
│   │   └── settings/
│   └── users/
│       └── lookup/              # Public B2C reputation checker
├── components/
│   ├── auth/
│   │   └── login-form.tsx
│   ├── dashboard/
│   │   ├── sidebar.tsx
│   │   ├── mobile-nav.tsx
│   │   └── nigeria-map.tsx      # Choropleth + incident markers
│   └── ui/                      # shadcn/ui primitives + spinner
├── context/
│   └── auth-context.tsx         # Global auth state, login/logout
├── lib/
│   ├── api.ts                   # Fetch wrapper with JWT attach + silent refresh
│   ├── auth.ts                  # Token/session helpers (cookie-based)
│   ├── errors.ts                # Centralized friendlyError() mapper
│   ├── hooks.ts                 # SWR data hooks (incidents, stats, users, heatmap, reports)
│   ├── pdf-report.ts            # jsPDF compliance report builder
│   └── types.ts                 # Shared TypeScript types
└── proxy.ts                     # Next.js middleware — auth guard + RBAC
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
git clone https://github.com/your-org/naijashield.git
cd naijashield
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_BACKEND_URL=https://your-backend-api-url
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm start
```

---

## Authentication Flow

1. User visits `/login` → submits credentials → backend returns `{ token, refreshToken, user }`
2. Tokens and role stored in cookies (`ns_token`, `ns_refresh`, `ns_role`)
3. All API requests attach `Authorization: Bearer <token>` via `lib/api.ts`
4. On 401 with an existing token → silent refresh attempted → on failure, session cleared and redirected to `/login`
5. On 401 with **no** token (e.g. wrong login credentials) → API error surfaced directly — no false "session expired" message

### Invite Flow

1. Admin invites user from `/user-management` → backend emails a link to `/invite/accept?token=...`
2. User sets password → redirected to `/login` with an activation success banner
3. User signs in normally

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/auth/login` | — | Sign in |
| `POST` | `/api/auth/refresh` | — | Refresh access token |
| `POST` | `/api/auth/invite` | Admin | Invite a new user |
| `POST` | `/api/auth/invite/accept` | — | Accept invite, set password |
| `DELETE` | `/api/auth/users/:id` | Admin | Remove a user |
| `GET` | `/api/auth/users` | Admin | List all users |
| `GET` | `/api/incidents?limit=N` | Auth | Paginated incident list |
| `GET` | `/api/incidents/stats` | Auth | KPI stats |
| `GET` | `/api/incidents/heatmap` | Auth | GPS-tagged heatmap points |
| `POST` | `/api/reports` | Auth | Generate compliance report |
| `GET` | `/api/reports?limit=N` | Auth | Report history |
| `GET` | `/api/numbers/:phone/reputation` | **Public** | Number fraud reputation |

---

## Compliance Reports

The compliance module generates structured PDF reports for three regulatory bodies:

- **CBN** — Central Bank of Nigeria
- **NCC** — Nigerian Communications Commission
- **General** — Internal / multi-agency

Each report includes an executive summary, KPI snapshot, channel breakdown, classification breakdown, and a detailed incident table — all generated client-side via jsPDF and persisted on the backend.

---

## Implementation Notes

- **`proxy.ts`** is the middleware entry point (not `middleware.ts`) — project convention
- **`searchParams`** is a `Promise` in Next.js 16 — must be `await`ed in server components
- **`useSearchParams`** requires a `<Suspense>` boundary — see `threat-feed/page.tsx`
- All form handlers use `React.SyntheticEvent<HTMLFormElement>` (React 19 deprecates `FormEvent`)
- All error messages route through `lib/errors.ts` `friendlyError()` — single source of truth for user-facing copy
- The Nigeria map uses `react-simple-maps` with a TopoJSON file for state fills and GPS-coordinate markers for individual incidents

---

## License

Private — all rights reserved. NaijaShield is proprietary software.
