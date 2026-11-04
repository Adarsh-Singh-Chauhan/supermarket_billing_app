import { 
  int, 
  mysqlEnum, 
  mysqlTable, 
  text, 
  timestamp, 
  varchar,
  decimal,
  boolean,
  datetime,
  json
} from "drizzle-orm/mysql-core";

/**
 * Users table with role-based access control
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["admin", "cashier", "user"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Local email/password credentials. Password hashes are kept separate from
 * the user profile and are never returned by application queries.
 */
export const localCredentials = mysqlTable("localCredentials", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LocalCredential = typeof localCredentials.$inferSelect;

/**
 * Products table for inventory management
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  barcode: varchar("barcode", { length: 100 }).unique(),
  costPrice: decimal("costPrice", { precision: 10, scale: 2 }).notNull(),
  sellingPrice: decimal("sellingPrice", { precision: 10, scale: 2 }).notNull(),
  gstPercentage: decimal("gstPercentage", { precision: 5, scale: 2 }).default("0"),
  stockQuantity: int("stockQuantity").default(0).notNull(),
  supplier: varchar("supplier", { length: 255 }),
  imageUrl: text("imageUrl"),
  description: text("description"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Inventory stock history for tracking changes
 */
export const stockHistory = mysqlTable("stockHistory", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  previousQuantity: int("previousQuantity").notNull(),
  newQuantity: int("newQuantity").notNull(),
  changeReason: mysqlEnum("changeReason", ["sale", "restock", "adjustment", "damage"]).notNull(),
  quantity: int("quantity").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StockHistory = typeof stockHistory.$inferSelect;
export type InsertStockHistory = typeof stockHistory.$inferInsert;

/**
 * Sales transactions table
 */
export const sales = mysqlTable("sales", {
  id: int("id").autoincrement().primaryKey(),
  invoiceNumber: varchar("invoiceNumber", { length: 50 }).unique().notNull(),
  cashierId: int("cashierId").notNull(),
  totalAmount: decimal("totalAmount", { precision: 12, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  discountAmount: decimal("discountAmount", { precision: 10, scale: 2 }).default("0"),
  taxAmount: decimal("taxAmount", { precision: 10, scale: 2 }).notNull(),
  cgst: decimal("cgst", { precision: 10, scale: 2 }).default("0"),
  sgst: decimal("sgst", { precision: 10, scale: 2 }).default("0"),
  paymentMode: mysqlEnum("paymentMode", ["cash", "card", "upi", "cheque"]).notNull(),
  status: mysqlEnum("status", ["completed", "pending", "cancelled"]).default("completed").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Sale = typeof sales.$inferSelect;
export type InsertSale = typeof sales.$inferInsert;

/**
 * Sale items - individual products in each sale
 */
export const saleItems = mysqlTable("saleItems", {
  id: int("id").autoincrement().primaryKey(),
  saleId: int("saleId").notNull(),
  productId: int("productId").notNull(),
  quantity: int("quantity").notNull(),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  gstPercentage: decimal("gstPercentage", { precision: 5, scale: 2 }).notNull(),
  gstAmount: decimal("gstAmount", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SaleItem = typeof saleItems.$inferSelect;
export type InsertSaleItem = typeof saleItems.$inferInsert;

/**
 * Invoices table for detailed invoice records
 */
export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  saleId: int("saleId").notNull().unique(),
  invoiceNumber: varchar("invoiceNumber", { length: 50 }).unique().notNull(),
  gstin: varchar("gstin", { length: 20 }),
  storeName: varchar("storeName", { length: 255 }),
  storeAddress: text("storeAddress"),
  invoiceDate: datetime("invoiceDate").notNull(),
  items: json("items"), // Stores serialized sale items
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  cgst: decimal("cgst", { precision: 10, scale: 2 }).default("0"),
  sgst: decimal("sgst", { precision: 10, scale: 2 }).default("0"),
  totalTax: decimal("totalTax", { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal("totalAmount", { precision: 12, scale: 2 }).notNull(),
  qrCode: text("qrCode"),
  isPrinted: boolean("isPrinted").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

/**
 * Daily sales summary for analytics
 */
export const dailySalesSummary = mysqlTable("dailySalesSummary", {
  id: int("id").autoincrement().primaryKey(),
  date: datetime("date").notNull(),
  totalSales: int("totalSales").notNull(),
  totalRevenue: decimal("totalRevenue", { precision: 12, scale: 2 }).notNull(),
  totalTax: decimal("totalTax", { precision: 10, scale: 2 }).notNull(),
  totalDiscount: decimal("totalDiscount", { precision: 10, scale: 2 }).default("0"),
  transactionCount: int("transactionCount").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DailySalesSummary = typeof dailySalesSummary.$inferSelect;
export type InsertDailySalesSummary = typeof dailySalesSummary.$inferInsert;

/**
 * Product sales analytics for demand forecasting
 */
export const productSalesAnalytics = mysqlTable("productSalesAnalytics", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  date: datetime("date").notNull(),
  quantitySold: int("quantitySold").notNull(),
  revenue: decimal("revenue", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProductSalesAnalytics = typeof productSalesAnalytics.$inferSelect;
export type InsertProductSalesAnalytics = typeof productSalesAnalytics.$inferInsert;

/**
 * AI Forecasting results
 */
export const forecastingResults = mysqlTable("forecastingResults", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  forecastDate: datetime("forecastDate").notNull(),
  predictedDemand: int("predictedDemand").notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 2 }).notNull(),
  recommendedStock: int("recommendedStock").notNull(),
  forecastType: mysqlEnum("forecastType", ["daily", "weekly", "monthly"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ForecastingResult = typeof forecastingResults.$inferSelect;
export type InsertForecastingResult = typeof forecastingResults.$inferInsert;

/**
 * System settings and configuration
 */
export const systemSettings = mysqlTable("systemSettings", {
  id: int("id").autoincrement().primaryKey(),
  storeName: varchar("storeName", { length: 255 }).notNull(),
  storeAddress: text("storeAddress"),
  gstin: varchar("gstin", { length: 20 }),
  phoneNumber: varchar("phoneNumber", { length: 20 }),
  email: varchar("email", { length: 320 }),
  logoUrl: text("logoUrl"),
  lowStockThreshold: int("lowStockThreshold").default(10).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SystemSettings = typeof systemSettings.$inferSelect;
export type InsertSystemSettings = typeof systemSettings.$inferInsert;
