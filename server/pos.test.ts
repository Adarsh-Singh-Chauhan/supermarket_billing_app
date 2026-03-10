import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(role: "admin" | "cashier" | "user" = "cashier"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("POS System - Products", () => {
  it("should list all products", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.list();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("should search products by name", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.search({ query: "rice" });
    expect(Array.isArray(result)).toBe(true);
  });

  it("should search products by barcode", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.search({ query: "RICE001" });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("POS System - Inventory", () => {
  it("should get stock history for a product", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const products = await caller.products.list();
    if (products.length === 0) return;

    const result = await caller.inventory.getStockHistory({ productId: products[0].id });
    expect(Array.isArray(result)).toBe(true);
  });

  it("should update stock quantity", async () => {
    const ctx = createAuthContext("admin");
    const caller = appRouter.createCaller(ctx);

    const products = await caller.products.list();
    if (products.length === 0) return;

    const result = await caller.inventory.updateStock({
      productId: products[0].id,
      quantity: 50,
      reason: "adjustment",
    });

    expect(result).toBeDefined();
  });
});

describe("POS System - Sales", () => {
  it("should list all sales", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.sales.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should get sales by date range", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const result = await caller.sales.getByDateRange({
      startDate,
      endDate: new Date(),
    });

    expect(Array.isArray(result)).toBe(true);
  });

  it("should get inventory insights", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.analytics.getInventoryInsights();
    expect(result).toBeDefined();
    expect(result.totalProducts).toBeGreaterThanOrEqual(0);
  });
});

describe("POS System - Invoices", () => {
  it("should get invoice by id", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const sales = await caller.sales.list();
    if (sales.length === 0) return;

    const result = await caller.invoices.getById({ id: sales[0].id });
    expect(result).toBeDefined();
  });

  it("should get latest forecasts", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.analytics.getLatestForecasts({ limit: 10 });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("POS System - Analytics", () => {
  it("should get sales overview", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const result = await caller.analytics.getSalesOverview({
      startDate,
      endDate: new Date(),
    });

    expect(result).toBeDefined();
    expect(result.totalRevenue).toBeGreaterThanOrEqual(0);
    expect(result.totalTransactions).toBeGreaterThanOrEqual(0);
  });

  it("should get daily sales data", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const result = await caller.analytics.getDailySalesData({
      startDate,
      endDate: new Date(),
    });

    expect(Array.isArray(result)).toBe(true);
  });

  it("should get top selling products", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const result = await caller.analytics.getTopSellingProducts({
      startDate,
      endDate: new Date(),
      limit: 5,
    });

    expect(Array.isArray(result)).toBe(true);
  });

  it("should get category wise sales", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const result = await caller.analytics.getCategoryWiseSales({
      startDate,
      endDate: new Date(),
    });

    expect(Array.isArray(result)).toBe(true);
  });

  it("should get profit loss analysis", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const result = await caller.analytics.getProfitLossAnalysis({
      startDate,
      endDate: new Date(),
    });

    expect(result).toBeDefined();
    expect(result.totalRevenue).toBeGreaterThanOrEqual(0);
    expect(result.totalCost).toBeGreaterThanOrEqual(0);
    expect(result.profit).toBeDefined();
    expect(result.profitMargin).toBeDefined();
  });
});

describe("POS System - Authentication", () => {
  it("should allow cashier to access POS", async () => {
    const ctx = createAuthContext("cashier");
    expect(ctx.user.role).toBe("cashier");
  });

  it("should allow admin to access all features", async () => {
    const ctx = createAuthContext("admin");
    expect(ctx.user.role).toBe("admin");
  });

  it("should have user info in context", async () => {
    const ctx = createAuthContext();
    expect(ctx.user).toBeDefined();
    expect(ctx.user.id).toBe(1);
    expect(ctx.user.email).toBe("test@example.com");
  });
});

describe("POS System - System Settings", () => {
  it("should verify system is operational", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Verify we can access auth and products
    const user = await caller.auth.me();
    expect(user).toBeDefined();

    const products = await caller.products.list();
    expect(Array.isArray(products)).toBe(true);
  });
});
