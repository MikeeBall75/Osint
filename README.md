# OSINT Platform

A web-based OSINT (Open Source Intelligence) investigation platform inspired by [osint.industries](https://osint.industries). Search by email or phone number to aggregate intelligence from multiple configurable data sources.

## Features

- **Email & Phone Search** — Enter an email address or phone number to query all configured OSINT API sources
- **Dynamic API Plugin System** — Admin can add/edit/remove API integrations at runtime (no code changes needed)
- **Credit-Based Paywall** — Stripe-powered credit system; each search costs 1 credit
- **Admin Panel** — Dashboard with stats, API integration management, and user oversight
- **Search History** — Full history of past searches with stored results
- **Dark Theme UI** — Modern, responsive design inspired by osint.industries

## Tech Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** + custom design system
- **Prisma** + SQLite (swap to PostgreSQL for production)
- **NextAuth.js** (JWT-based auth with credentials provider)
- **Stripe** (checkout sessions + webhooks for credit purchases)

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

> Stripe keys are optional — the app works without them, but credit purchases will be disabled.

### Database Setup

```bash
npx prisma db push
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### First User = Admin

The first user to register automatically becomes an **ADMIN** with access to the admin panel at `/admin`. All subsequent users are regular users.

## Admin Panel

Navigate to `/admin` to:

1. **Dashboard** — View total users, searches, and active integrations
2. **API Integrations** — Add OSINT API sources with:
   - Name and description
   - Search type (email, phone, or both)
   - Base URL and endpoint template (use `{{query}}` placeholder)
   - Headers (JSON) — for API keys / auth tokens
   - Response mapping (JSON) — dot-notation field extraction
   - Enable/disable toggle
3. **Users** — View all registered users, their credit balances, and search counts

### Example Integration Setup

**Have I Been Pwned:**
```
Name: Have I Been Pwned
Type: email
Base URL: https://haveibeenpwned.com/api/v3
Endpoint: /breachedaccount/{{query}}
Headers: {"hibp-api-key": "your-api-key"}
Response Mapping: {}
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── login/                      # Auth pages
│   ├── register/
│   ├── dashboard/                  # User area
│   │   ├── search/                 # Search UI + results
│   │   ├── history/                # Search history
│   │   └── credits/                # Credit balance + purchase
│   ├── admin/                      # Admin panel
│   │   ├── integrations/           # API CRUD
│   │   └── users/                  # User management
│   └── api/                        # Backend API routes
├── components/                     # Shared UI
├── lib/                            # Core logic
│   ├── auth.ts                     # NextAuth config
│   ├── prisma.ts                   # Database client
│   ├── search-engine.ts            # API fan-out engine
│   └── stripe.ts                   # Stripe config
└── types/                          # TypeScript types
```
