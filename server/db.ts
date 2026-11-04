import { eq, and, desc, gte, lte, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users,
  localCredentials,
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

export async function getUserById(id: number) {
  const database = await getDb();
  if (!database) return undefined;
  const result = await database.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function getLocalCredentialByEmail(email: string) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  const result = await database
    .select({ passwordHash: localCredentials.passwordHash, userId: users.id })
    .from(localCredentials)
    .innerJoin(users, eq(localCredentials.userId, users.id))
    .where(eq(localCredentials.email, email))
    .limit(1);

  if (!result[0]) return undefined;
  const user = await getUserById(result[0].userId);
  if (!user) return undefined;
  return { user, passwordHash: result[0].passwordHash };
}

export async function createLocalAccount(input: {
  openId: string;
  name: string;
  email: string;
  passwordHash: string;
}) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  return database.transaction(async (tx) => {
    await tx.insert(users).values({
      openId: input.openId,
      name: input.name,
      email: input.email,
      loginMethod: "email",
      role: "user",
      lastSignedIn: new Date(),
    });

    const created = await tx.select().from(users).where(eq(users.openId, input.openId)).limit(1);
    const user = created[0];
    if (!user) throw new Error("Unable to create user account");

    await tx.insert(localCredentials).values({
      userId: user.id,
      email: input.email,
      passwordHash: input.passwordHash,
    });
    return user;
  });
}

export async function touchUserLastSignedIn(userId: number) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");
  await database.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, userId));
}

export async function updateUserRole(userId: number, role: "admin" | "cashier" | "user") {
  const database = await getDb();
  if (!database) throw new Error("Database not available");
  await database.update(users).set({ role }).where(eq(users.id, userId));
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

/**
 * Creates a sale, sale items, stock movements and invoice atomically.
 * All prices and GST rates are read from the database, never trusted from the browser.
 */
export async function createSaleTransaction(input: {
  cashierId: number;
  invoiceNumber: string;
  items: Array<{ productId: number; quantity: number }>;
  discountAmount: number;
  paymentMode: "cash" | "card" | "upi" | "cheque";
  notes?: string;
}) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  return database.transaction(async (tx) => {
    if (input.items.length === 0) throw new Error("Add at least one product to the bill");

    const seen = new Set<number>();
    const lineItems: Array<{
      productId: number;
      name: string;
      category: string;
      barcode: string | null;
      quantity: number;
      unitPrice: number;
      gstPercentage: number;
      gstAmount: number;
      totalPrice: number;
      previousQuantity: number;
    }> = [];

    let subtotal = 0;
    let totalTax = 0;

    for (const item of input.items) {
      if (seen.has(item.productId)) throw new Error("A product may appear only once in a bill");
      seen.add(item.productId);
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        throw new Error("Product quantities must be positive whole numbers");
      }

      const rows = await tx
        .select()
        .from(products)
        .where(eq(products.id, item.productId))
        .for("update");
      const product = rows[0];

      if (!product || !product.isActive) throw new Error("A selected product is unavailable");
      if (product.stockQuantity < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);

      const unitPrice = Number(product.sellingPrice);
      const gstPercentage = Number(product.gstPercentage ?? 0);
      const lineSubtotal = unitPrice * item.quantity;
      const gstAmount = (lineSubtotal * gstPercentage) / 100;
      const totalPrice = lineSubtotal + gstAmount;

      subtotal += lineSubtotal;
      totalTax += gstAmount;
      lineItems.push({
        productId: product.id,
        name: product.name,
        category: product.category,
        barcode: product.barcode ?? null,
        quantity: item.quantity,
        unitPrice,
        gstPercentage,
        gstAmount,
        totalPrice,
        previousQuantity: product.stockQuantity,
      });
    }

    const discountAmount = Number(input.discountAmount || 0);
    if (!Number.isFinite(discountAmount) || discountAmount < 0 || discountAmount > subtotal + totalTax) {
      throw new Error("Discount must be between zero and the bill total");
    }

    const totalAmount = subtotal + totalTax - discountAmount;
    const cgst = totalTax / 2;
    const sgst = totalTax / 2;
    const now = new Date();

    const saleResult: any = await tx.insert(sales).values({
      invoiceNumber: input.invoiceNumber,
      cashierId: input.cashierId,
      totalAmount: totalAmount.toFixed(2),
      subtotal: subtotal.toFixed(2),
      discountAmount: discountAmount.toFixed(2),
      taxAmount: totalTax.toFixed(2),
      cgst: cgst.toFixed(2),
      sgst: sgst.toFixed(2),
      paymentMode: input.paymentMode,
      status: "completed",
      notes: input.notes,
      createdAt: now,
      updatedAt: now,
    });

    let saleId = Number(saleResult?.insertId);
    if (!Number.isInteger(saleId) || saleId <= 0) {
      const rows = await tx.select().from(sales).where(eq(sales.invoiceNumber, input.invoiceNumber)).limit(1);
      saleId = Number(rows[0]?.id);
    }
    if (!Number.isInteger(saleId) || saleId <= 0) throw new Error("Sale record could not be created");

    for (const item of lineItems) {
      const newQuantity = item.previousQuantity - item.quantity;
      await tx.update(products)
        .set({ stockQuantity: newQuantity, updatedAt: now })
        .where(eq(products.id, item.productId));

      await tx.insert(saleItems).values({
        saleId,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toFixed(2),
        gstPercentage: item.gstPercentage.toFixed(2),
        gstAmount: item.gstAmount.toFixed(2),
        totalPrice: item.totalPrice.toFixed(2),
        createdAt: now,
      });

      await tx.insert(stockHistory).values({
        productId: item.productId,
        previousQuantity: item.previousQuantity,
        newQuantity,
        changeReason: "sale",
        quantity: -item.quantity,
        notes: `Sale ${input.invoiceNumber}`,
        createdAt: now,
      });
    }

    const settingsRows = await tx.select().from(systemSettings).limit(1);
    const store = settingsRows[0];
    const invoiceItems = lineItems.map(({ previousQuantity: _previousQuantity, ...item }) => item);
    const invoiceResult: any = await tx.insert(invoices).values({
      saleId,
      invoiceNumber: input.invoiceNumber,
      gstin: store?.gstin ?? null,
      storeName: store?.storeName ?? "StoreDesk Retail",
      storeAddress: store?.storeAddress ?? null,
      invoiceDate: now,
      items: invoiceItems as any,
      subtotal: subtotal.toFixed(2),
      cgst: cgst.toFixed(2),
      sgst: sgst.toFixed(2),
      totalTax: totalTax.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      createdAt: now,
      updatedAt: now,
    });

    const invoiceId = Number(invoiceResult?.insertId);
    return {
      success: true as const,
      saleId,
      invoiceId: Number.isInteger(invoiceId) && invoiceId > 0 ? invoiceId : null,
      invoiceNumber: input.invoiceNumber,
      subtotal: Number(subtotal.toFixed(2)),
      taxAmount: Number(totalTax.toFixed(2)),
      discountAmount: Number(discountAmount.toFixed(2)),
      totalAmount: Number(totalAmount.toFixed(2)),
    };
  });
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

export async function getInvoiceBySaleId(saleId: number) {
  const database = await getDb();
  if (!database) return null;
  const result = await database.select().from(invoices).where(eq(invoices.saleId, saleId)).limit(1);
  return result[0] ?? null;
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
