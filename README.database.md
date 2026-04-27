# Database Workflow

This file explains how database work is handled in ProfitResearch after the Drizzle setup.

The short version:

- Drizzle owns the schema definition
- Drizzle migrations are the source of truth for structure changes
- local development uses Docker PostgreSQL
- production uses Neon through `DATABASE_URL`
- commands only affect the database your current `DATABASE_URL` points to

## Files That Matter

- [db/schema.ts](/Users/saifulislamrifat/Desktop/projects/product-research/db/schema.ts)
  - the current schema definition in Drizzle
- [drizzle.config.ts](/Users/saifulislamrifat/Desktop/projects/product-research/drizzle.config.ts)
  - tells Drizzle where the schema is and which database URL to use
- [drizzle/](/Users/saifulislamrifat/Desktop/projects/product-research/drizzle)
  - generated SQL migrations
- [drizzle/meta/_journal.json](/Users/saifulislamrifat/Desktop/projects/product-research/drizzle/meta/_journal.json)
  - Drizzle migration history metadata
- [lib/db.ts](/Users/saifulislamrifat/Desktop/projects/product-research/lib/db.ts)
  - shared database clients
- [lib/db-migrate.ts](/Users/saifulislamrifat/Desktop/projects/product-research/lib/db-migrate.ts)
  - runtime migration bootstrap used by the app
- [docker-compose.yml](/Users/saifulislamrifat/Desktop/projects/product-research/docker-compose.yml)
  - local Postgres container and volume

## What "Schema" Means

The schema is the structure of the database:

- tables
- columns
- indexes
- foreign keys
- defaults

In this repo, the schema is defined in [db/schema.ts](/Users/saifulislamrifat/Desktop/projects/product-research/db/schema.ts).

## What a Migration Means

A migration is a versioned SQL change that moves the database from one schema state to another.

Examples:

- create a new table
- add a new column
- add an index
- backfill old rows
- fix bad JSON storage

In this repo, migrations live in [drizzle/](/Users/saifulislamrifat/Desktop/projects/product-research/drizzle).

## Safe Mental Model

- `db/schema.ts` is the intended structure
- `drizzle/*.sql` are the actual change steps
- `npm run db:migrate` applies those changes to the current database

Do not think of `db:generate` as changing the database. It does not.

## Commands And What They Do

### `npm run db:up`

Starts the local Docker Postgres container.

It affects:

- local Docker only

It does not:

- apply schema changes
- seed data
- touch production

### `npm run db:down`

Stops the local Docker Postgres container.

It affects:

- local Docker only

It does not:

- delete the Docker volume
- wipe local data by itself
- touch production

### `npm run db:logs`

Shows logs from the local Docker Postgres container.

It affects:

- nothing in data

### `npm run db:generate`

Reads [db/schema.ts](/Users/saifulislamrifat/Desktop/projects/product-research/db/schema.ts) and generates a new migration file under [drizzle/](/Users/saifulislamrifat/Desktop/projects/product-research/drizzle).

It affects:

- files in the repo

It does not:

- change any database
- insert data
- wipe data

### `npm run db:migrate`

Applies all pending migration SQL files to the database in `DATABASE_URL`.

It affects:

- whichever database `DATABASE_URL` points to

It can:

- create tables
- add columns
- add indexes
- run data-fix SQL written into migrations

It does not:

- copy local rows into production
- seed sample data unless a migration explicitly inserts rows

Important:

- if `DATABASE_URL` is local Docker, it changes local only
- if `DATABASE_URL` is Neon production, it changes production

### `npm run db:push`

Pushes schema directly from Drizzle to the database without the normal migration workflow.

Recommendation:

- use this only for throwaway local experimentation
- do not use this as your normal team workflow
- do not use this in production

Reason:

- it bypasses the clean migration history you want to keep

### `npm run db:studio`

Opens Drizzle Studio against the current `DATABASE_URL`.

It affects:

- no data by default

But it connects to:

- local or production depending on `DATABASE_URL`

So treat it carefully.

## Local Development Workflow

Use this when working on your own machine with Docker Postgres.

1. Make sure `.env.local` uses the local Docker database URL.

Example:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/profitresearch
```

2. Start the database.

```bash
npm run db:up
```

3. Apply the current schema.

```bash
npm run db:migrate
```

4. Start the app.

```bash
npm run dev
```

5. Create or test data through the app UI.

## Production Workflow

Use this when deploying to Neon through Vercel.

1. Set Vercel `DATABASE_URL` to the Neon production database.
2. Commit schema and migration files.
3. Deploy the app.
4. Apply migrations to production.

Recommended rule:

- do not point your local shell at production and casually run DB commands

Because in this repo, DB commands follow `DATABASE_URL` exactly.

## If You Change The Schema

If you add or change a table, column, index, or foreign key:

1. Edit [db/schema.ts](/Users/saifulislamrifat/Desktop/projects/product-research/db/schema.ts).
2. Generate a migration:

```bash
npm run db:generate
```

3. Review the generated SQL in [drizzle/](/Users/saifulislamrifat/Desktop/projects/product-research/drizzle).
4. Apply it locally:

```bash
npm run db:migrate
```

5. Test the app locally.
6. Commit both:
   - schema file changes
   - generated migration files
7. Deploy and apply the same migration in production.

## What Will Wipe Old Data

These are the dangerous cases.

### Local only

This will wipe local Docker Postgres data:

```bash
docker compose down -v
```

Why:

- `-v` removes the named Docker volume
- the local Postgres volume is `profitresearch_postgres_data`

This also wipes local data:

```bash
docker volume rm profitresearch_postgres_data
```

### Local or production

These can wipe data depending on what SQL you write:

- a migration with `drop table`
- a migration with `delete from`
- a migration with destructive backfill logic
- manual SQL against the connected database

## What Will NOT Wipe Old Data

These are normally safe for existing rows unless your migration itself is destructive:

- `npm run db:up`
- `npm run db:down`
- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:studio`

Important detail:

- `db:migrate` changes structure
- it does not automatically mean data loss
- data loss only happens if the migration SQL contains destructive statements

## What Will Insert Local Data Into Production

Nothing in the current standard workflow copies local rows into production automatically.

These do not copy local data into production:

- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:up`
- `npm run db:down`

Local data reaches production only if you do one of these on purpose:

- export local rows and import them into production
- run manual insert SQL against production
- write a migration that inserts sample data and then run it on production
- point your scripts to production and run seed/import logic there

## What Could Accidentally Touch Production

Anything that uses `DATABASE_URL` can hit production if your env is pointing there.

That includes:

- `npm run db:migrate`
- `npm run db:push`
- `npm run db:studio`
- app runtime migration bootstrap in [lib/db-migrate.ts](/Users/saifulislamrifat/Desktop/projects/product-research/lib/db-migrate.ts)

That last one matters:

- when the app boots and hits the database, it can run pending migrations
- so if you start the app with production `DATABASE_URL`, it can apply production migrations

## Seeding Basic Data

Current state:

- there is no dedicated seed script in this repo yet

So right now, basic data is created by:

- signing up through the app
- creating research records through the UI
- creating operations records through the UI

There is currently no:

- `npm run db:seed`

and no migration that inserts demo rows.

## Recommended Team Rules

1. Use Docker Postgres locally.
2. Keep `.env.local` pointed to local DB during development.
3. Change [db/schema.ts](/Users/saifulislamrifat/Desktop/projects/product-research/db/schema.ts) first.
4. Run `npm run db:generate`.
5. Review the migration SQL carefully.
6. Run `npm run db:migrate` locally.
7. Test the app.
8. Commit schema plus migration files together.
9. Apply the same migration in production.
10. Avoid `db:push` for production work.

## Recommended Everyday Commands

### Start local work

```bash
npm run db:up
npm run db:migrate
npm run dev
```

### After changing schema

```bash
npm run db:generate
npm run db:migrate
```

### Check database visually

```bash
npm run db:studio
```

### Stop local database

```bash
npm run db:down
```

### Full local reset

This is destructive to local data only:

```bash
docker compose down -v
npm run db:up
npm run db:migrate
```

## Best Practice For Production

- local Docker for development
- Neon only for production
- migration files committed to git
- no schema changes done manually in production unless truly necessary
- no `db:push` in production

If you want, the next step should be adding a real seed system such as:

- `npm run db:seed`
- `npm run db:seed:local`

with starter demo users, research entries, products, inventory, and sales data.
