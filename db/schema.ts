import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const appUsers = pgTable(
  "app_users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    name: text("name"),
    passwordHash: text("password_hash").notNull(),
    emailVerifiedAt: timestamp("email_verified_at", {
      withTimezone: true,
      mode: "string",
    }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    emailIdx: uniqueIndex("app_users_email_unique").on(table.email),
  }),
);

export const authTokens = pgTable(
  "auth_tokens",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => appUsers.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    tokenHash: text("token_hash").notNull(),
    type: text("type").notNull(),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    tokenHashIdx: uniqueIndex("auth_tokens_token_hash_unique").on(table.tokenHash),
    userTypeIdx: index("auth_tokens_user_type_idx").on(table.userId, table.type),
  }),
);

export const productResearches = pgTable(
  "product_researches",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => appUsers.id, { onDelete: "cascade" }),
    product: jsonb("product").notNull(),
    competitors: jsonb("competitors").notNull().default([]),
    salesLog: jsonb("sales_log").notNull().default([]),
    scenarioUnitsSold: integer("scenario_units_sold").notNull().default(0),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userUpdatedIdx: index("product_researches_user_idx").on(table.userId, table.updatedAt),
  }),
);

export const businessProducts = pgTable(
  "business_products",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => appUsers.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    sku: text("sku").notNull().default(""),
    supplier: text("supplier").notNull().default(""),
    status: text("status").notNull().default("researching"),
    targetSellPrice: integer("target_sell_price").notNull().default(0),
    reorderPoint: integer("reorder_point").notNull().default(0),
    onHandUnits: integer("on_hand_units").notNull().default(0),
    soldUnits: integer("sold_units").notNull().default(0),
    returnedUnits: integer("returned_units").notNull().default(0),
    linkedResearchId: text("linked_research_id"),
    notes: text("notes").notNull().default(""),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userUpdatedIdx: index("business_products_user_idx").on(table.userId, table.updatedAt),
  }),
);

export const purchaseOrders = pgTable(
  "purchase_orders",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => appUsers.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => businessProducts.id, { onDelete: "cascade" }),
    supplier: text("supplier").notNull().default(""),
    status: text("status").notNull().default("planned"),
    units: integer("units").notNull().default(0),
    unitCost: integer("unit_cost").notNull().default(0),
    shippingCost: integer("shipping_cost").notNull().default(0),
    orderedAt: timestamp("ordered_at", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
    expectedAt: timestamp("expected_at", {
      withTimezone: true,
      mode: "string",
    }),
    note: text("note").notNull().default(""),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userOrderedIdx: index("purchase_orders_user_idx").on(table.userId, table.orderedAt),
  }),
);

export const salesLogs = pgTable(
  "sales_logs",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => appUsers.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => businessProducts.id, { onDelete: "cascade" }),
    channel: text("channel").notNull().default("facebook"),
    status: text("status").notNull().default("delivered"),
    quantity: integer("quantity").notNull().default(1),
    sellPrice: integer("sell_price").notNull().default(0),
    deliveryCost: integer("delivery_cost").notNull().default(0),
    adSpend: integer("ad_spend").notNull().default(0),
    packagingCost: integer("packaging_cost").notNull().default(0),
    platformFee: integer("platform_fee").notNull().default(0),
    soldAt: timestamp("sold_at", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
    note: text("note").notNull().default(""),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userSoldIdx: index("sales_logs_user_idx").on(table.userId, table.soldAt),
  }),
);

export const inventoryAdjustments = pgTable(
  "inventory_adjustments",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => appUsers.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => businessProducts.id, { onDelete: "cascade" }),
    deltaUnits: integer("delta_units").notNull(),
    reason: text("reason").notNull(),
    note: text("note").notNull().default(""),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userCreatedIdx: index("inventory_adjustments_user_idx").on(table.userId, table.createdAt),
  }),
);
