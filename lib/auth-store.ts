import { createHash, randomUUID } from "node:crypto";

import { hashPassword } from "@/lib/auth-crypto";
import { getSql } from "@/lib/db";

export type AppUser = {
  id: string;
  email: string;
  name: string | null;
  password_hash: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
};

type AuthTokenRow = {
  id: string;
  user_id: string;
  email: string;
  token_hash: string;
  type: "email_verification" | "password_reset";
  expires_at: string;
  created_at: string;
};

type TokenType = AuthTokenRow["type"];

let authTablesPromise: Promise<ReturnType<typeof getSql>> | null = null;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function initAuthTables() {
  const sql = getSql();
  if (!sql) {
    return null;
  }

  await sql`
    create table if not exists app_users (
      id text primary key,
      email text not null unique,
      name text,
      password_hash text not null,
      email_verified_at timestamptz,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `;

  await sql`
    create table if not exists auth_tokens (
      id text primary key,
      user_id text not null references app_users(id) on delete cascade,
      email text not null,
      token_hash text not null unique,
      type text not null,
      expires_at timestamptz not null,
      created_at timestamptz not null default now()
    )
  `;

  await sql`
    create index if not exists auth_tokens_user_type_idx
    on auth_tokens(user_id, type)
  `;

  return sql;
}

async function ensureAuthTables() {
  if (!authTablesPromise) {
    authTablesPromise = initAuthTables();
  }

  return authTablesPromise;
}

export async function getUserByEmail(email: string): Promise<AppUser | null> {
  const sql = await ensureAuthTables();
  if (!sql) {
    return null;
  }

  const normalizedEmail = normalizeEmail(email);
  const rows = (await sql`
    select
      id,
      email,
      name,
      password_hash,
      email_verified_at::text,
      created_at::text,
      updated_at::text
    from app_users
    where lower(email) = ${normalizedEmail}
    limit 1
  `) as AppUser[];

  return rows[0] ?? null;
}

export async function getUserById(id: string): Promise<AppUser | null> {
  const sql = await ensureAuthTables();
  if (!sql) {
    return null;
  }

  const rows = (await sql`
    select
      id,
      email,
      name,
      password_hash,
      email_verified_at::text,
      created_at::text,
      updated_at::text
    from app_users
    where id = ${id}
    limit 1
  `) as AppUser[];

  return rows[0] ?? null;
}

export async function upsertPendingUser(input: {
  email: string;
  name: string;
  passwordHash: string;
}) {
  const sql = await ensureAuthTables();
  if (!sql) {
    throw new Error("DATABASE_URL is not configured");
  }

  const normalizedEmail = normalizeEmail(input.email);
  const existingUser = await getUserByEmail(normalizedEmail);

  if (existingUser?.email_verified_at) {
    throw new Error("An account with this email already exists");
  }

  const userId = existingUser?.id ?? randomUUID();

  if (existingUser) {
    await sql`
      update app_users
      set
        name = ${input.name},
        password_hash = ${input.passwordHash},
        updated_at = now()
      where id = ${existingUser.id}
    `;
  } else {
    await sql`
      insert into app_users (
        id,
        email,
        name,
        password_hash
      ) values (
        ${userId},
        ${normalizedEmail},
        ${input.name},
        ${input.passwordHash}
      )
    `;
  }

  return {
    id: userId,
    email: normalizedEmail,
    name: input.name,
  };
}

export async function createAuthToken(input: {
  userId: string;
  email: string;
  rawToken: string;
  type: TokenType;
  expiresAt: Date;
}) {
  const sql = await ensureAuthTables();
  if (!sql) {
    throw new Error("DATABASE_URL is not configured");
  }

  await sql`
    delete from auth_tokens
    where user_id = ${input.userId}
      and type = ${input.type}
  `;

  await sql`
    insert into auth_tokens (
      id,
      user_id,
      email,
      token_hash,
      type,
      expires_at
    ) values (
      ${randomUUID()},
      ${input.userId},
      ${normalizeEmail(input.email)},
      ${hashToken(input.rawToken)},
      ${input.type},
      ${input.expiresAt.toISOString()}
    )
  `;
}

export async function consumeAuthToken(token: string, type: TokenType) {
  const sql = await ensureAuthTables();
  if (!sql) {
    throw new Error("DATABASE_URL is not configured");
  }

  const rows = (await sql`
    select
      id,
      user_id,
      email,
      token_hash,
      type,
      expires_at::text,
      created_at::text
    from auth_tokens
    where token_hash = ${hashToken(token)}
      and type = ${type}
    limit 1
  `) as AuthTokenRow[];

  const row = rows[0];
  if (!row) {
    return null;
  }

  await sql`
    delete from auth_tokens
    where id = ${row.id}
  `;

  if (new Date(row.expires_at).getTime() < Date.now()) {
    return null;
  }

  return row;
}

export async function markUserEmailVerified(userId: string) {
  const sql = await ensureAuthTables();
  if (!sql) {
    throw new Error("DATABASE_URL is not configured");
  }

  await sql`
    update app_users
    set
      email_verified_at = now(),
      updated_at = now()
    where id = ${userId}
  `;
}

export async function updateUserPassword(userId: string, passwordHash: string) {
  const sql = await ensureAuthTables();
  if (!sql) {
    throw new Error("DATABASE_URL is not configured");
  }

  await sql`
    update app_users
    set
      password_hash = ${passwordHash},
      updated_at = now()
    where id = ${userId}
  `;
}

export async function isEmailVerified(email: string) {
  const user = await getUserByEmail(email);
  return Boolean(user?.email_verified_at);
}

export async function findOrCreateOAuthUser(input: {
  email: string;
  name?: string | null;
}) {
  const sql = await ensureAuthTables();
  if (!sql) {
    throw new Error("DATABASE_URL is not configured");
  }

  const normalizedEmail = normalizeEmail(input.email);
  const existingUser = await getUserByEmail(normalizedEmail);

  if (existingUser) {
    await sql`
      update app_users
      set
        name = ${input.name?.trim() || existingUser.name},
        email_verified_at = coalesce(email_verified_at, now()),
        updated_at = now()
      where id = ${existingUser.id}
    `;

    return {
      ...existingUser,
      email: normalizedEmail,
      name: input.name?.trim() || existingUser.name,
      email_verified_at: existingUser.email_verified_at ?? new Date().toISOString(),
    };
  }

  const userId = randomUUID();
  const passwordHash = await hashPassword(randomUUID());
  const name = input.name?.trim() || null;

  await sql`
    insert into app_users (
      id,
      email,
      name,
      password_hash,
      email_verified_at
    ) values (
      ${userId},
      ${normalizedEmail},
      ${name},
      ${passwordHash},
      now()
    )
  `;

  const user = await getUserById(userId);
  if (!user) {
    throw new Error("Unable to create OAuth user");
  }

  return user;
}
