import { eq, and, desc, gte, lte, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users,
  products,
  sales,
  saleItems,
  invoices,
  stockHistory,
  dailySalesSummary,
  productSalesAnalytics,
  forecastingResults,
  systemSettings,
  Product,
  Sale,
  SaleItem,
  Invoice,
  StockHistory,
  DailySalesSummary,
  ProductSalesAnalytics,
  ForecastingResult,
  SystemSettings
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER OPERATIONS ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users);
}

// ============ PRODUCT OPERATIONS ============

export async function createProduct(product: typeof products.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(products).values(product);
  return result;
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getProductByBarcode(barcode: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(products).where(eq(products.barcode, barcode)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getAllProducts() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(products).where(eq(products.isActive, true));
}

export async function searchProducts(query: string) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(products).where(
    and(
      eq(products.isActive, true),
      like(products.name, `%${query}%`)
    )
  );
}

export async function updateProduct(id: number, data: Partial<typeof products.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(products).set({ isActive: false }).where(eq(products.id, id));
}

export async function getLowStockProducts(threshold: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(products).where(
    and(
      eq(products.isActive, true),
      lte(products.stockQuantity, threshold)
    )
  );
}

// ============ SALES OPERATIONS ============

export async function createSale(sale: typeof sales.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(sales).values(sale);
  return result;
}

export async function getSaleById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(sales).where(eq(sales.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getSaleByInvoiceNumber(invoiceNumber: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(sales).where(eq(sales.invoiceNumber, invoiceNumber)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getAllSales() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(sales).orderBy(desc(sales.createdAt));
}

export async function getSalesByDateRange(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(sales).where(
    and(
      gte(sales.createdAt, startDate),
      lte(sales.createdAt, endDate)
    )
  ).orderBy(desc(sales.createdAt));
}

// ============ SALE ITEMS OPERATIONS ============

export async function createSaleItem(item: typeof saleItems.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(saleItems).values(item);
}

export async function getSaleItems(saleId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(saleItems).where(eq(saleItems.saleId, saleId));
}

// ============ INVOICE OPERATIONS ============

export async function createInvoice(invoice: typeof invoices.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(invoices).values(invoice);
}

export async function getInvoiceById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getInvoiceByNumber(invoiceNumber: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(invoices).where(eq(invoices.invoiceNumber, invoiceNumber)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateInvoice(id: number, data: Partial<typeof invoices.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(invoices).set(data).where(eq(invoices.id, id));
}

// ============ STOCK HISTORY OPERATIONS ============

export async function createStockHistory(history: typeof stockHistory.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(stockHistory).values(history);
}

export async function getStockHistory(productId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(stockHistory).where(eq(stockHistory.productId, productId)).orderBy(desc(stockHistory.createdAt));
}

// ============ ANALYTICS OPERATIONS ============

export async function createDailySalesSummary(summary: typeof dailySalesSummary.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(dailySalesSummary).values(summary);
}

export async function getDailySalesSummary(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(dailySalesSummary).where(
    and(
      gte(dailySalesSummary.date, startDate),
      lte(dailySalesSummary.date, endDate)
    )
  ).orderBy(dailySalesSummary.date);
}

export async function createProductSalesAnalytics(analytics: typeof productSalesAnalytics.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(productSalesAnalytics).values(analytics);
}

export async function getProductSalesAnalytics(productId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(productSalesAnalytics).where(
    and(
      eq(productSalesAnalytics.productId, productId),
      gte(productSalesAnalytics.date, startDate),
      lte(productSalesAnalytics.date, endDate)
    )
  ).orderBy(productSalesAnalytics.date);
}

// ============ FORECASTING OPERATIONS ============

export async function createForecastingResult(forecast: typeof forecastingResults.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(forecastingResults).values(forecast);
}

export async function getForecastingResults(productId: number, forecastType: string) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(forecastingResults).where(
    and(
      eq(forecastingResults.productId, productId),
      eq(forecastingResults.forecastType, forecastType as any)
    )
  ).orderBy(desc(forecastingResults.createdAt));
}

export async function getLatestForecasts(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(forecastingResults).orderBy(desc(forecastingResults.createdAt)).limit(limit);
}

// ============ SYSTEM SETTINGS OPERATIONS ============

export async function getSystemSettings() {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(systemSettings).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createSystemSettings(settings: typeof systemSettings.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(systemSettings).values(settings);
}

export async function updateSystemSettings(data: Partial<typeof systemSettings.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const settings = await getSystemSettings();
  if (!settings) {
    return createSystemSettings(data as any);
  }
  
  return db.update(systemSettings).set(data).where(eq(systemSettings.id, settings.id));
}
