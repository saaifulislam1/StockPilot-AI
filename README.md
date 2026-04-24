# ProfitResearch

ProfitResearch is a Next.js application for two separate but connected jobs:

- `Research`: evaluate a product before you buy inventory
- `Operations`: run the business after a product is approved

The research flow remains a dedicated decision layer for competitor tracking, pricing, and launch viability. The operations layer adds products, purchases, inventory, and sales tracking without altering the research workflow.

## Modules

- `New Research` and `Saved Research`
  - pre-buy product analysis
  - competitor price tracking
  - launch budget and pricing decisions
- `Operations`
  - business product workspaces
  - purchase orders
  - stock adjustments and on-hand inventory
  - sales logs with revenue and direct-profit tracking

## Local development database

Local development uses Docker PostgreSQL.

1. Copy env values from `.env.example` if needed.
2. Start the local database:

```bash
npm run db:up
```

3. Start the app:

```bash
npm run dev
```

4. Stop the database when finished:

```bash
npm run db:down
```

The default local database URL is:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/profitresearch
```

## Production database

Production should use your Neon PostgreSQL connection string by setting `DATABASE_URL` in Vercel.

## Auth

The app supports:

- email/password auth via NextAuth credentials
- Google OAuth via NextAuth Google provider
- password reset via Resend

Required environment variables are listed in `.env.example`.

## Main scripts

```bash
npm run dev
npm run build
npm run lint
npm run db:up
npm run db:down
npm run db:logs
```
