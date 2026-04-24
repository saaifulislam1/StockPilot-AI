import { randomUUID } from "node:crypto";

import { ensureAuthTables } from "@/lib/auth-store";
import { getSql } from "@/lib/db";

export type BusinessProduct = {
  id: string;
  name: string;
  sku: string;
  supplier: string;
  status: string;
  targetSellPrice: number;
  reorderPoint: number;
  onHandUnits: number;
  soldUnits: number;
  returnedUnits: number;
  linkedResearchId: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type PurchaseOrder = {
  id: string;
  productId: string;
  productName: string;
  supplier: string;
  status: string;
  units: number;
  unitCost: number;
  shippingCost: number;
  orderedAt: string;
  expectedAt: string | null;
  note: string;
  totalCost: number;
};

export type SalesLog = {
  id: string;
  productId: string;
  productName: string;
  channel: string;
  status: string;
  quantity: number;
  sellPrice: number;
  deliveryCost: number;
  adSpend: number;
  packagingCost: number;
  platformFee: number;
  soldAt: string;
  note: string;
  revenue: number;
  profit: number;
};

export type InventoryAdjustment = {
  id: string;
  productId: string;
  productName: string;
  deltaUnits: number;
  reason: string;
  note: string;
  createdAt: string;
};

export type OperationsOverview = {
  activeProducts: number;
  onHandUnits: number;
  lowStockCount: number;
  openPurchaseValue: number;
  last30DayRevenue: number;
  last30DayProfit: number;
  lowStockProducts: BusinessProduct[];
  recentSales: SalesLog[];
  recentPurchases: PurchaseOrder[];
};

type BusinessProductRow = {
  id: string;
  name: string;
  sku: string;
  supplier: string;
  status: string;
  target_sell_price: number;
  reorder_point: number;
  on_hand_units: number;
  sold_units: number;
  returned_units: number;
  linked_research_id: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
};

type PurchaseOrderRow = {
  id: string;
  product_id: string;
  product_name: string;
  supplier: string;
  status: string;
  units: number;
  unit_cost: number;
  shipping_cost: number;
  ordered_at: string;
  expected_at: string | null;
  note: string;
};

type SalesLogRow = {
  id: string;
  product_id: string;
  product_name: string;
  channel: string;
  status: string;
  quantity: number;
  sell_price: number;
  delivery_cost: number;
  ad_spend: number;
  packaging_cost: number;
  platform_fee: number;
  sold_at: string;
  note: string;
};

type InventoryAdjustmentRow = {
  id: string;
  product_id: string;
  product_name: string;
  delta_units: number;
  reason: string;
  note: string;
  created_at: string;
};

let businessTablesPromise: Promise<ReturnType<typeof getSql>> | null = null;

function normalizeText(value: string) {
  return value.trim();
}

function clampInteger(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.round(value);
}

function mapBusinessProduct(row: BusinessProductRow): BusinessProduct {
  return {
    id: row.id,
    name: row.name,
    sku: row.sku,
    supplier: row.supplier,
    status: row.status,
    targetSellPrice: row.target_sell_price,
    reorderPoint: row.reorder_point,
    onHandUnits: row.on_hand_units,
    soldUnits: row.sold_units,
    returnedUnits: row.returned_units,
    linkedResearchId: row.linked_research_id,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapPurchaseOrder(row: PurchaseOrderRow): PurchaseOrder {
  return {
    id: row.id,
    productId: row.product_id,
    productName: row.product_name,
    supplier: row.supplier,
    status: row.status,
    units: row.units,
    unitCost: row.unit_cost,
    shippingCost: row.shipping_cost,
    orderedAt: row.ordered_at,
    expectedAt: row.expected_at,
    note: row.note,
    totalCost: row.units * row.unit_cost + row.shipping_cost,
  };
}

function mapSalesLog(row: SalesLogRow): SalesLog {
  const revenue = row.quantity * row.sell_price;
  const totalCosts =
    row.delivery_cost +
    row.ad_spend +
    row.packaging_cost +
    row.platform_fee;

  return {
    id: row.id,
    productId: row.product_id,
    productName: row.product_name,
    channel: row.channel,
    status: row.status,
    quantity: row.quantity,
    sellPrice: row.sell_price,
    deliveryCost: row.delivery_cost,
    adSpend: row.ad_spend,
    packagingCost: row.packaging_cost,
    platformFee: row.platform_fee,
    soldAt: row.sold_at,
    note: row.note,
    revenue,
    profit: revenue - totalCosts,
  };
}

function mapInventoryAdjustment(row: InventoryAdjustmentRow): InventoryAdjustment {
  return {
    id: row.id,
    productId: row.product_id,
    productName: row.product_name,
    deltaUnits: row.delta_units,
    reason: row.reason,
    note: row.note,
    createdAt: row.created_at,
  };
}

async function initBusinessTables() {
  const sql = getSql();
  if (!sql) {
    return null;
  }

  await ensureAuthTables();

  await sql`
    create table if not exists business_products (
      id text primary key,
      user_id text not null references app_users(id) on delete cascade,
      name text not null,
      sku text not null default '',
      supplier text not null default '',
      status text not null default 'researching',
      target_sell_price integer not null default 0,
      reorder_point integer not null default 0,
      on_hand_units integer not null default 0,
      sold_units integer not null default 0,
      returned_units integer not null default 0,
      linked_research_id text,
      notes text not null default '',
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `;

  await sql`
    create index if not exists business_products_user_idx
    on business_products(user_id, updated_at desc)
  `;

  await sql`
    create table if not exists purchase_orders (
      id text primary key,
      user_id text not null references app_users(id) on delete cascade,
      product_id text not null references business_products(id) on delete cascade,
      supplier text not null default '',
      status text not null default 'planned',
      units integer not null default 0,
      unit_cost integer not null default 0,
      shipping_cost integer not null default 0,
      ordered_at timestamptz not null default now(),
      expected_at timestamptz,
      note text not null default '',
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `;

  await sql`
    create index if not exists purchase_orders_user_idx
    on purchase_orders(user_id, ordered_at desc)
  `;

  await sql`
    create table if not exists sales_logs (
      id text primary key,
      user_id text not null references app_users(id) on delete cascade,
      product_id text not null references business_products(id) on delete cascade,
      channel text not null default 'facebook',
      status text not null default 'delivered',
      quantity integer not null default 1,
      sell_price integer not null default 0,
      delivery_cost integer not null default 0,
      ad_spend integer not null default 0,
      packaging_cost integer not null default 0,
      platform_fee integer not null default 0,
      sold_at timestamptz not null default now(),
      note text not null default '',
      created_at timestamptz not null default now()
    )
  `;

  await sql`
    create index if not exists sales_logs_user_idx
    on sales_logs(user_id, sold_at desc)
  `;

  await sql`
    create table if not exists inventory_adjustments (
      id text primary key,
      user_id text not null references app_users(id) on delete cascade,
      product_id text not null references business_products(id) on delete cascade,
      delta_units integer not null,
      reason text not null,
      note text not null default '',
      created_at timestamptz not null default now()
    )
  `;

  await sql`
    create index if not exists inventory_adjustments_user_idx
    on inventory_adjustments(user_id, created_at desc)
  `;

  return sql;
}

async function ensureBusinessTables() {
  if (!businessTablesPromise) {
    businessTablesPromise = initBusinessTables();
  }

  return businessTablesPromise;
}

async function getOwnedProductForWrite(userId: string, productId: string) {
  const sql = await ensureBusinessTables();
  if (!sql) {
    throw new Error("DATABASE_URL is not configured");
  }

  const rows = (await sql`
    select
      id,
      name,
      sku,
      supplier,
      status,
      target_sell_price,
      reorder_point,
      on_hand_units,
      sold_units,
      returned_units,
      linked_research_id,
      notes,
      created_at::text,
      updated_at::text
    from business_products
    where id = ${productId}
      and user_id = ${userId}
    limit 1
  `) as BusinessProductRow[];

  return rows[0] ? mapBusinessProduct(rows[0]) : null;
}

export async function listBusinessProducts(userId: string): Promise<BusinessProduct[]> {
  const sql = await ensureBusinessTables();
  if (!sql) {
    return [];
  }

  const rows = (await sql`
    select
      id,
      name,
      sku,
      supplier,
      status,
      target_sell_price,
      reorder_point,
      on_hand_units,
      sold_units,
      returned_units,
      linked_research_id,
      notes,
      created_at::text,
      updated_at::text
    from business_products
    where user_id = ${userId}
    order by updated_at desc
  `) as BusinessProductRow[];

  return rows.map(mapBusinessProduct);
}

export async function createBusinessProduct(
  userId: string,
  input: {
    name: string;
    sku?: string;
    supplier?: string;
    status?: string;
    targetSellPrice?: number;
    reorderPoint?: number;
    linkedResearchId?: string | null;
    notes?: string;
  },
): Promise<BusinessProduct> {
  const sql = await ensureBusinessTables();
  if (!sql) {
    throw new Error("DATABASE_URL is not configured");
  }

  const id = randomUUID();
  await sql`
    insert into business_products (
      id,
      user_id,
      name,
      sku,
      supplier,
      status,
      target_sell_price,
      reorder_point,
      linked_research_id,
      notes
    )
    values (
      ${id},
      ${userId},
      ${normalizeText(input.name)},
      ${normalizeText(input.sku ?? "")},
      ${normalizeText(input.supplier ?? "")},
      ${normalizeText(input.status ?? "researching")},
      ${clampInteger(input.targetSellPrice ?? 0)},
      ${Math.max(0, clampInteger(input.reorderPoint ?? 0))},
      ${input.linkedResearchId?.trim() || null},
      ${normalizeText(input.notes ?? "")}
    )
  `;

  const product = await getOwnedProductForWrite(userId, id);
  if (!product) {
    throw new Error("Unable to create product");
  }

  return product;
}

export async function updateBusinessProduct(
  userId: string,
  id: string,
  input: {
    name: string;
    sku?: string;
    supplier?: string;
    status?: string;
    targetSellPrice?: number;
    reorderPoint?: number;
    linkedResearchId?: string | null;
    notes?: string;
  },
): Promise<BusinessProduct> {
  const sql = await ensureBusinessTables();
  if (!sql) {
    throw new Error("DATABASE_URL is not configured");
  }

  const rows = (await sql`
    update business_products
    set
      name = ${normalizeText(input.name)},
      sku = ${normalizeText(input.sku ?? "")},
      supplier = ${normalizeText(input.supplier ?? "")},
      status = ${normalizeText(input.status ?? "researching")},
      target_sell_price = ${clampInteger(input.targetSellPrice ?? 0)},
      reorder_point = ${Math.max(0, clampInteger(input.reorderPoint ?? 0))},
      linked_research_id = ${input.linkedResearchId?.trim() || null},
      notes = ${normalizeText(input.notes ?? "")},
      updated_at = now()
    where id = ${id}
      and user_id = ${userId}
    returning id
  `) as { id: string }[];

  if (rows.length === 0) {
    throw new Error("Product not found");
  }

  const product = await getOwnedProductForWrite(userId, id);
  if (!product) {
    throw new Error("Product not found");
  }

  return product;
}

export async function createPurchaseOrder(
  userId: string,
  input: {
    productId: string;
    supplier?: string;
    status?: string;
    units: number;
    unitCost: number;
    shippingCost?: number;
    orderedAt?: string;
    expectedAt?: string | null;
    note?: string;
  },
): Promise<PurchaseOrder> {
  const sql = await ensureBusinessTables();
  if (!sql) {
    throw new Error("DATABASE_URL is not configured");
  }

  const product = await getOwnedProductForWrite(userId, input.productId);
  if (!product) {
    throw new Error("Product not found");
  }

  const id = randomUUID();
  const status = normalizeText(input.status ?? "planned");
  const units = Math.max(1, clampInteger(input.units));
  const unitCost = Math.max(0, clampInteger(input.unitCost));
  const shippingCost = Math.max(0, clampInteger(input.shippingCost ?? 0));
  const note = normalizeText(input.note ?? "");

  await sql.begin(async (transaction) => {
    await transaction`
      insert into purchase_orders (
        id,
        user_id,
        product_id,
        supplier,
        status,
        units,
        unit_cost,
        shipping_cost,
        ordered_at,
        expected_at,
        note
      )
      values (
        ${id},
        ${userId},
        ${input.productId},
        ${normalizeText(input.supplier ?? product.supplier)},
        ${status},
        ${units},
        ${unitCost},
        ${shippingCost},
        ${input.orderedAt || new Date().toISOString()},
        ${input.expectedAt || null},
        ${note}
      )
    `;

    if (status === "received") {
      await transaction`
        update business_products
        set
          on_hand_units = on_hand_units + ${units},
          updated_at = now()
        where id = ${input.productId}
          and user_id = ${userId}
      `;

      await transaction`
        insert into inventory_adjustments (
          id,
          user_id,
          product_id,
          delta_units,
          reason,
          note
        )
        values (
          ${randomUUID()},
          ${userId},
          ${input.productId},
          ${units},
          ${"purchase-received"},
          ${note || "Stock received from purchase order"}
        )
      `;
    }
  });

  const rows = (await sql`
    select
      purchase_orders.id,
      purchase_orders.product_id,
      business_products.name as product_name,
      purchase_orders.supplier,
      purchase_orders.status,
      purchase_orders.units,
      purchase_orders.unit_cost,
      purchase_orders.shipping_cost,
      purchase_orders.ordered_at::text,
      purchase_orders.expected_at::text,
      purchase_orders.note
    from purchase_orders
    join business_products on business_products.id = purchase_orders.product_id
    where purchase_orders.id = ${id}
      and purchase_orders.user_id = ${userId}
    limit 1
  `) as PurchaseOrderRow[];

  if (!rows[0]) {
    throw new Error("Unable to create purchase order");
  }

  return mapPurchaseOrder(rows[0]);
}

export async function listPurchaseOrders(userId: string): Promise<PurchaseOrder[]> {
  const sql = await ensureBusinessTables();
  if (!sql) {
    return [];
  }

  const rows = (await sql`
    select
      purchase_orders.id,
      purchase_orders.product_id,
      business_products.name as product_name,
      purchase_orders.supplier,
      purchase_orders.status,
      purchase_orders.units,
      purchase_orders.unit_cost,
      purchase_orders.shipping_cost,
      purchase_orders.ordered_at::text,
      purchase_orders.expected_at::text,
      purchase_orders.note
    from purchase_orders
    join business_products on business_products.id = purchase_orders.product_id
    where purchase_orders.user_id = ${userId}
    order by purchase_orders.ordered_at desc
  `) as PurchaseOrderRow[];

  return rows.map(mapPurchaseOrder);
}

export async function createInventoryAdjustment(
  userId: string,
  input: {
    productId: string;
    deltaUnits: number;
    reason: string;
    note?: string;
  },
): Promise<InventoryAdjustment> {
  const sql = await ensureBusinessTables();
  if (!sql) {
    throw new Error("DATABASE_URL is not configured");
  }

  const product = await getOwnedProductForWrite(userId, input.productId);
  if (!product) {
    throw new Error("Product not found");
  }

  const deltaUnits = clampInteger(input.deltaUnits);
  const nextUnits = product.onHandUnits + deltaUnits;

  if (deltaUnits === 0) {
    throw new Error("Adjustment amount must be non-zero");
  }

  if (nextUnits < 0) {
    throw new Error("Adjustment would reduce stock below zero");
  }

  const id = randomUUID();
  await sql.begin(async (transaction) => {
    await transaction`
      insert into inventory_adjustments (
        id,
        user_id,
        product_id,
        delta_units,
        reason,
        note
      )
      values (
        ${id},
        ${userId},
        ${input.productId},
        ${deltaUnits},
        ${normalizeText(input.reason)},
        ${normalizeText(input.note ?? "")}
      )
    `;

    await transaction`
      update business_products
      set
        on_hand_units = on_hand_units + ${deltaUnits},
        updated_at = now()
      where id = ${input.productId}
        and user_id = ${userId}
    `;
  });

  const rows = (await sql`
    select
      inventory_adjustments.id,
      inventory_adjustments.product_id,
      business_products.name as product_name,
      inventory_adjustments.delta_units,
      inventory_adjustments.reason,
      inventory_adjustments.note,
      inventory_adjustments.created_at::text
    from inventory_adjustments
    join business_products on business_products.id = inventory_adjustments.product_id
    where inventory_adjustments.id = ${id}
      and inventory_adjustments.user_id = ${userId}
    limit 1
  `) as InventoryAdjustmentRow[];

  if (!rows[0]) {
    throw new Error("Unable to create inventory adjustment");
  }

  return mapInventoryAdjustment(rows[0]);
}

export async function listInventoryAdjustments(
  userId: string,
): Promise<InventoryAdjustment[]> {
  const sql = await ensureBusinessTables();
  if (!sql) {
    return [];
  }

  const rows = (await sql`
    select
      inventory_adjustments.id,
      inventory_adjustments.product_id,
      business_products.name as product_name,
      inventory_adjustments.delta_units,
      inventory_adjustments.reason,
      inventory_adjustments.note,
      inventory_adjustments.created_at::text
    from inventory_adjustments
    join business_products on business_products.id = inventory_adjustments.product_id
    where inventory_adjustments.user_id = ${userId}
    order by inventory_adjustments.created_at desc
    limit 50
  `) as InventoryAdjustmentRow[];

  return rows.map(mapInventoryAdjustment);
}

export async function createSalesLog(
  userId: string,
  input: {
    productId: string;
    channel?: string;
    status?: string;
    quantity: number;
    sellPrice: number;
    deliveryCost?: number;
    adSpend?: number;
    packagingCost?: number;
    platformFee?: number;
    soldAt?: string;
    note?: string;
  },
): Promise<SalesLog> {
  const sql = await ensureBusinessTables();
  if (!sql) {
    throw new Error("DATABASE_URL is not configured");
  }

  const product = await getOwnedProductForWrite(userId, input.productId);
  if (!product) {
    throw new Error("Product not found");
  }

  const quantity = Math.max(1, clampInteger(input.quantity));
  const status = normalizeText(input.status ?? "delivered");

  if (status === "delivered" && product.onHandUnits < quantity) {
    throw new Error("Not enough on-hand stock for this sale");
  }

  const id = randomUUID();
  await sql.begin(async (transaction) => {
    await transaction`
      insert into sales_logs (
        id,
        user_id,
        product_id,
        channel,
        status,
        quantity,
        sell_price,
        delivery_cost,
        ad_spend,
        packaging_cost,
        platform_fee,
        sold_at,
        note
      )
      values (
        ${id},
        ${userId},
        ${input.productId},
        ${normalizeText(input.channel ?? "facebook")},
        ${status},
        ${quantity},
        ${Math.max(0, clampInteger(input.sellPrice))},
        ${Math.max(0, clampInteger(input.deliveryCost ?? 0))},
        ${Math.max(0, clampInteger(input.adSpend ?? 0))},
        ${Math.max(0, clampInteger(input.packagingCost ?? 0))},
        ${Math.max(0, clampInteger(input.platformFee ?? 0))},
        ${input.soldAt || new Date().toISOString()},
        ${normalizeText(input.note ?? "")}
      )
    `;

    if (status === "delivered") {
      await transaction`
        update business_products
        set
          on_hand_units = on_hand_units - ${quantity},
          sold_units = sold_units + ${quantity},
          updated_at = now()
        where id = ${input.productId}
          and user_id = ${userId}
      `;
    }

    if (status === "returned") {
      await transaction`
        update business_products
        set
          returned_units = returned_units + ${quantity},
          updated_at = now()
        where id = ${input.productId}
          and user_id = ${userId}
      `;
    }
  });

  const rows = (await sql`
    select
      sales_logs.id,
      sales_logs.product_id,
      business_products.name as product_name,
      sales_logs.channel,
      sales_logs.status,
      sales_logs.quantity,
      sales_logs.sell_price,
      sales_logs.delivery_cost,
      sales_logs.ad_spend,
      sales_logs.packaging_cost,
      sales_logs.platform_fee,
      sales_logs.sold_at::text,
      sales_logs.note
    from sales_logs
    join business_products on business_products.id = sales_logs.product_id
    where sales_logs.id = ${id}
      and sales_logs.user_id = ${userId}
    limit 1
  `) as SalesLogRow[];

  if (!rows[0]) {
    throw new Error("Unable to create sales log");
  }

  return mapSalesLog(rows[0]);
}

export async function listSalesLogs(userId: string): Promise<SalesLog[]> {
  const sql = await ensureBusinessTables();
  if (!sql) {
    return [];
  }

  const rows = (await sql`
    select
      sales_logs.id,
      sales_logs.product_id,
      business_products.name as product_name,
      sales_logs.channel,
      sales_logs.status,
      sales_logs.quantity,
      sales_logs.sell_price,
      sales_logs.delivery_cost,
      sales_logs.ad_spend,
      sales_logs.packaging_cost,
      sales_logs.platform_fee,
      sales_logs.sold_at::text,
      sales_logs.note
    from sales_logs
    join business_products on business_products.id = sales_logs.product_id
    where sales_logs.user_id = ${userId}
    order by sales_logs.sold_at desc
    limit 100
  `) as SalesLogRow[];

  return rows.map(mapSalesLog);
}

export async function getOperationsOverview(
  userId: string,
): Promise<OperationsOverview> {
  const [products, sales, purchases] = await Promise.all([
    listBusinessProducts(userId),
    listSalesLogs(userId),
    listPurchaseOrders(userId),
  ]);

  const last30DayCutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recentDeliveredSales = sales.filter(
    (sale) =>
      sale.status === "delivered" &&
      new Date(sale.soldAt).getTime() >= last30DayCutoff,
  );
  const lowStockProducts = products
    .filter((product) => product.reorderPoint > 0 && product.onHandUnits <= product.reorderPoint)
    .sort((left, right) => left.onHandUnits - right.onHandUnits)
    .slice(0, 5);
  const openPurchaseValue = purchases
    .filter((purchase) => purchase.status !== "received" && purchase.status !== "cancelled")
    .reduce((total, purchase) => total + purchase.totalCost, 0);

  return {
    activeProducts: products.length,
    onHandUnits: products.reduce((total, product) => total + product.onHandUnits, 0),
    lowStockCount: lowStockProducts.length,
    openPurchaseValue,
    last30DayRevenue: recentDeliveredSales.reduce((total, sale) => total + sale.revenue, 0),
    last30DayProfit: recentDeliveredSales.reduce((total, sale) => total + sale.profit, 0),
    lowStockProducts,
    recentSales: sales.slice(0, 6),
    recentPurchases: purchases.slice(0, 6),
  };
}
