CREATE TABLE IF NOT EXISTS "app_users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"password_hash" text NOT NULL,
	"email_verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint
		WHERE conname = 'app_users_email_key'
	) AND NOT EXISTS (
		SELECT 1
		FROM pg_indexes
		WHERE schemaname = 'public'
			AND indexname = 'app_users_email_unique'
	) THEN
		CREATE UNIQUE INDEX "app_users_email_unique" ON "app_users" USING btree ("email");
	END IF;
END
$$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"email" text NOT NULL,
	"token_hash" text NOT NULL,
	"type" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint
		WHERE conname IN ('auth_tokens_user_id_fkey', 'auth_tokens_user_id_app_users_id_fk')
	) THEN
		ALTER TABLE "auth_tokens"
		ADD CONSTRAINT "auth_tokens_user_id_app_users_id_fk"
		FOREIGN KEY ("user_id") REFERENCES "public"."app_users"("id") ON DELETE cascade ON UPDATE no action;
	END IF;
END
$$;
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint
		WHERE conname = 'auth_tokens_token_hash_key'
	) AND NOT EXISTS (
		SELECT 1
		FROM pg_indexes
		WHERE schemaname = 'public'
			AND indexname = 'auth_tokens_token_hash_unique'
	) THEN
		CREATE UNIQUE INDEX "auth_tokens_token_hash_unique" ON "auth_tokens" USING btree ("token_hash");
	END IF;
END
$$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "auth_tokens_user_type_idx" ON "auth_tokens" USING btree ("user_id","type");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_researches" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"product" jsonb NOT NULL,
	"competitors" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"sales_log" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"scenario_units_sold" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "product_researches" ADD COLUMN IF NOT EXISTS "user_id" text;
--> statement-breakpoint
UPDATE "product_researches"
SET "product" = ("product" #>> '{}')::jsonb
WHERE jsonb_typeof("product") = 'string'
	AND left("product" #>> '{}', 1) = '{';
--> statement-breakpoint
UPDATE "product_researches"
SET "competitors" = ("competitors" #>> '{}')::jsonb
WHERE jsonb_typeof("competitors") = 'string'
	AND left("competitors" #>> '{}', 1) = '[';
--> statement-breakpoint
UPDATE "product_researches"
SET "sales_log" = ("sales_log" #>> '{}')::jsonb
WHERE jsonb_typeof("sales_log") = 'string'
	AND left("sales_log" #>> '{}', 1) = '[';
--> statement-breakpoint
DELETE FROM "product_researches"
WHERE "user_id" IS NOT NULL
	AND NOT EXISTS (
		SELECT 1
		FROM "app_users"
		WHERE "app_users"."id" = "product_researches"."user_id"
	);
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint
		WHERE conname IN ('product_researches_user_id_fkey', 'product_researches_user_id_app_users_id_fk')
	) THEN
		ALTER TABLE "product_researches"
		ADD CONSTRAINT "product_researches_user_id_app_users_id_fk"
		FOREIGN KEY ("user_id") REFERENCES "public"."app_users"("id") ON DELETE cascade ON UPDATE no action;
	END IF;
END
$$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_researches_user_idx" ON "product_researches" USING btree ("user_id","updated_at");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "business_products" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"sku" text DEFAULT '' NOT NULL,
	"supplier" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'researching' NOT NULL,
	"target_sell_price" integer DEFAULT 0 NOT NULL,
	"reorder_point" integer DEFAULT 0 NOT NULL,
	"on_hand_units" integer DEFAULT 0 NOT NULL,
	"sold_units" integer DEFAULT 0 NOT NULL,
	"returned_units" integer DEFAULT 0 NOT NULL,
	"linked_research_id" text,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint
		WHERE conname IN ('business_products_user_id_fkey', 'business_products_user_id_app_users_id_fk')
	) THEN
		ALTER TABLE "business_products"
		ADD CONSTRAINT "business_products_user_id_app_users_id_fk"
		FOREIGN KEY ("user_id") REFERENCES "public"."app_users"("id") ON DELETE cascade ON UPDATE no action;
	END IF;
END
$$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "business_products_user_idx" ON "business_products" USING btree ("user_id","updated_at");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "purchase_orders" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"product_id" text NOT NULL,
	"supplier" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'planned' NOT NULL,
	"units" integer DEFAULT 0 NOT NULL,
	"unit_cost" integer DEFAULT 0 NOT NULL,
	"shipping_cost" integer DEFAULT 0 NOT NULL,
	"ordered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expected_at" timestamp with time zone,
	"note" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint
		WHERE conname IN ('purchase_orders_user_id_fkey', 'purchase_orders_user_id_app_users_id_fk')
	) THEN
		ALTER TABLE "purchase_orders"
		ADD CONSTRAINT "purchase_orders_user_id_app_users_id_fk"
		FOREIGN KEY ("user_id") REFERENCES "public"."app_users"("id") ON DELETE cascade ON UPDATE no action;
	END IF;
END
$$;
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint
		WHERE conname IN ('purchase_orders_product_id_fkey', 'purchase_orders_product_id_business_products_id_fk')
	) THEN
		ALTER TABLE "purchase_orders"
		ADD CONSTRAINT "purchase_orders_product_id_business_products_id_fk"
		FOREIGN KEY ("product_id") REFERENCES "public"."business_products"("id") ON DELETE cascade ON UPDATE no action;
	END IF;
END
$$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "purchase_orders_user_idx" ON "purchase_orders" USING btree ("user_id","ordered_at");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sales_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"product_id" text NOT NULL,
	"channel" text DEFAULT 'facebook' NOT NULL,
	"status" text DEFAULT 'delivered' NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"sell_price" integer DEFAULT 0 NOT NULL,
	"delivery_cost" integer DEFAULT 0 NOT NULL,
	"ad_spend" integer DEFAULT 0 NOT NULL,
	"packaging_cost" integer DEFAULT 0 NOT NULL,
	"platform_fee" integer DEFAULT 0 NOT NULL,
	"sold_at" timestamp with time zone DEFAULT now() NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint
		WHERE conname IN ('sales_logs_user_id_fkey', 'sales_logs_user_id_app_users_id_fk')
	) THEN
		ALTER TABLE "sales_logs"
		ADD CONSTRAINT "sales_logs_user_id_app_users_id_fk"
		FOREIGN KEY ("user_id") REFERENCES "public"."app_users"("id") ON DELETE cascade ON UPDATE no action;
	END IF;
END
$$;
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint
		WHERE conname IN ('sales_logs_product_id_fkey', 'sales_logs_product_id_business_products_id_fk')
	) THEN
		ALTER TABLE "sales_logs"
		ADD CONSTRAINT "sales_logs_product_id_business_products_id_fk"
		FOREIGN KEY ("product_id") REFERENCES "public"."business_products"("id") ON DELETE cascade ON UPDATE no action;
	END IF;
END
$$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sales_logs_user_idx" ON "sales_logs" USING btree ("user_id","sold_at");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inventory_adjustments" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"product_id" text NOT NULL,
	"delta_units" integer NOT NULL,
	"reason" text NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint
		WHERE conname IN ('inventory_adjustments_user_id_fkey', 'inventory_adjustments_user_id_app_users_id_fk')
	) THEN
		ALTER TABLE "inventory_adjustments"
		ADD CONSTRAINT "inventory_adjustments_user_id_app_users_id_fk"
		FOREIGN KEY ("user_id") REFERENCES "public"."app_users"("id") ON DELETE cascade ON UPDATE no action;
	END IF;
END
$$;
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint
		WHERE conname IN ('inventory_adjustments_product_id_fkey', 'inventory_adjustments_product_id_business_products_id_fk')
	) THEN
		ALTER TABLE "inventory_adjustments"
		ADD CONSTRAINT "inventory_adjustments_product_id_business_products_id_fk"
		FOREIGN KEY ("product_id") REFERENCES "public"."business_products"("id") ON DELETE cascade ON UPDATE no action;
	END IF;
END
$$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "inventory_adjustments_user_idx" ON "inventory_adjustments" USING btree ("user_id","created_at");
