import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { invokeLLM } from "./_core/llm";
import { analyticsRouter } from "./analytics";

export type AnalyticsRouter = typeof analyticsRouter;

// Helper function to generate invoice number
function generateInvoiceNumber(): string {
  const date = new Date();
  const timestamp = date.getTime().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `INV-${date.getFullYear()}-${timestamp}-${random}`;
}

// Helper function to generate barcode
function generateBarcode(): string {
  return `BC-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

// Validation schemas
const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  category: z.string().min(1, "Category is required"),
  barcode: z.string().optional(),
  costPrice: z.number().positive("Cost price must be positive"),
  sellingPrice: z.number().positive("Selling price must be positive"),
  gstPercentage: z.number().min(0).max(100).default(0),
  stockQuantity: z.number().int().default(0),
  supplier: z.string().optional(),
  imageUrl: z.string().optional(),
  description: z.string().optional(),
});

const saleItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive(),
});

const createSaleSchema = z.object({
  items: z.array(saleItemSchema),
  discountAmount: z.number().default(0),
  paymentMode: z.enum(["cash", "card", "upi", "cheque"]),
  notes: z.string().optional(),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ PRODUCT MANAGEMENT ============
  products: router({
    list: protectedProcedure.query(async () => {
      return db.getAllProducts();
    }),

    search: protectedProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        if (!input.query.trim()) {
          return db.getAllProducts();
        }
        return db.searchProducts(input.query);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const product = await db.getProductById(input.id);
        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND" as any,
            message: "Product not found",
          });
        }
        return product;
      }),

    getByBarcode: protectedProcedure
      .input(z.object({ barcode: z.string() }))
      .query(async ({ input }) => {
        const product = await db.getProductByBarcode(input.barcode);
        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND" as any,
            message: "Product with this barcode not found",
          });
        }
        return product;
      }),

    create: protectedProcedure
      .input(productSchema)
      .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN" as any,
          message: "Only admins can create products",
        });
        }

        const barcode = input.barcode || generateBarcode();
        
        // Check if barcode already exists
        const existing = await db.getProductByBarcode(barcode);
        if (existing) {
          throw new TRPCError({
            code: "CONFLICT" as any,
            message: "Barcode already exists",
          });
        }

        await db.createProduct({
          name: input.name,
          category: input.category,
          barcode,
          costPrice: input.costPrice.toString() as any,
          sellingPrice: input.sellingPrice.toString() as any,
          gstPercentage: input.gstPercentage.toString() as any,
          stockQuantity: input.stockQuantity,
          supplier: input.supplier,
          imageUrl: input.imageUrl,
          description: input.description,
        });

        return { success: true, barcode };
      }),

    update: protectedProcedure
      .input(z.object({ id: z.number(), ...productSchema.shape }))
      .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN" as any,
          message: "Only admins can update products",
        });
        }

        const { id, ...data } = input;
        const updateData: any = {
          name: data.name,
          category: data.category,
          costPrice: data.costPrice.toString(),
          sellingPrice: data.sellingPrice.toString(),
          gstPercentage: data.gstPercentage.toString(),
          stockQuantity: data.stockQuantity,
          supplier: data.supplier,
          imageUrl: data.imageUrl,
          description: data.description,
        };
        await db.updateProduct(id, updateData);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN" as any,
          message: "Only admins can delete products",
        });
        }

        await db.deleteProduct(input.id);
        return { success: true };
      }),

    getLowStock: protectedProcedure
      .input(z.object({ threshold: z.number().optional() }))
      .query(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN" as any,
          message: "Only admins can view low stock products",
        });
        }

        const settings = await db.getSystemSettings();
        const threshold = input.threshold || settings?.lowStockThreshold || 10;
        return db.getLowStockProducts(threshold);
      }),
  }),

  // ============ INVENTORY MANAGEMENT ============
  inventory: router({
    getStockHistory: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ input }) => {
        return db.getStockHistory(input.productId);
      }),

    updateStock: protectedProcedure
      .input(z.object({
        productId: z.number(),
        quantity: z.number(),
        reason: z.enum(["restock", "adjustment", "damage"]),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN" as any,
          message: "Only admins can update stock",
        });
        }

        const product = await db.getProductById(input.productId);
        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND" as any,
            message: "Product not found",
          });
        }

        const previousQuantity = product.stockQuantity;
        const newQuantity = previousQuantity + input.quantity;

        // Update product stock
        await db.updateProduct(input.productId, {
          stockQuantity: newQuantity,
        } as any);

        // Record stock history
        await db.createStockHistory({
          productId: input.productId,
          previousQuantity,
          newQuantity,
          changeReason: input.reason as any,
          quantity: input.quantity,
          notes: input.notes,
        });

        return { success: true, newQuantity };
      }),
  }),

  // ============ BILLING & SALES ============
  sales: router({
    create: protectedProcedure
      .input(createSaleSchema)
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "cashier" && ctx.user?.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only cashiers and admins can create sales",
          });
        }

        try {
          return await db.createSaleTransaction({
            cashierId: ctx.user.id,
            invoiceNumber: generateInvoiceNumber(),
            items: input.items,
            discountAmount: input.discountAmount,
            paymentMode: input.paymentMode,
            notes: input.notes,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unable to complete the sale";
          throw new TRPCError({ code: "BAD_REQUEST", message });
        }
      }),

    list: protectedProcedure.query(async () => {
      return db.getAllSales();
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const sale = await db.getSaleById(input.id);
        if (!sale) {
          throw new TRPCError({
            code: "NOT_FOUND" as any,
            message: "Sale not found",
          });
        }
        const items = await db.getSaleItems(input.id);
        return { ...sale, items };
      }),

    getByDateRange: protectedProcedure
      .input(z.object({
        startDate: z.date(),
        endDate: z.date(),
      }))
      .query(async ({ input }) => {
        return db.getSalesByDateRange(input.startDate, input.endDate);
      }),
  }),

  // ============ INVOICES ============
  invoices: router({
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const invoice = await db.getInvoiceById(input.id);
        if (!invoice) {
          throw new TRPCError({
            code: "NOT_FOUND" as any,
            message: "Invoice not found",
          });
        }
        return invoice;
      }),

    getByNumber: protectedProcedure
      .input(z.object({ invoiceNumber: z.string() }))
      .query(async ({ input }) => {
        const invoice = await db.getInvoiceByNumber(input.invoiceNumber);
        if (!invoice) {
          throw new TRPCError({
            code: "NOT_FOUND" as any,
            message: "Invoice not found",
          });
        }
        return invoice;
      }),

    getBySaleId: protectedProcedure
      .input(z.object({ saleId: z.number().int().positive() }))
      .query(async ({ input }) => {
        const invoice = await db.getInvoiceBySaleId(input.saleId);
        if (!invoice) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
        }
        return invoice;
      }),

    markPrinted: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.updateInvoice(input.id, { isPrinted: true });
        return { success: true };
      }),
  }),

  // ============ SYSTEM SETTINGS ============
  settings: router({
    get: protectedProcedure.query(async () => {
      return db.getSystemSettings();
    }),

    update: protectedProcedure
      .input(z.object({
        storeName: z.string().optional(),
        storeAddress: z.string().optional(),
        gstin: z.string().optional(),
        phoneNumber: z.string().optional(),
        email: z.string().optional(),
        logoUrl: z.string().optional(),
        lowStockThreshold: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN" as any,
          message: "Only admins can update settings",
        });
        }

        const updateData: any = { ...input };
        await db.updateSystemSettings(updateData);
        return { success: true };
      }),
  }),

  // ============ USERS ============
  users: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN" as any,
          message: "Only admins can view users",
        });
      }
      return db.getAllUsers();
    }),

    updateRole: protectedProcedure
      .input(z.object({
        userId: z.number().int().positive(),
        role: z.enum(["admin", "cashier", "user"]),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Only admins can change user roles" });
        }
        if (input.userId === ctx.user.id && input.role !== "admin") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "You cannot remove your own admin role" });
        }
        await db.updateUserRole(input.userId, input.role);
        return { success: true };
      }),
  }),

  // ============ ANALYTICS ============
  analytics: analyticsRouter,
});

export type AppRouter = typeof appRouter;
