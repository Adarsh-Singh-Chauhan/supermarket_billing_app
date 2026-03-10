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
  productId: z.number(),
  quantity: z.number().positive(),
  unitPrice: z.number().positive(),
  gstPercentage: z.number().min(0).max(100),
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
    list: publicProcedure.query(async () => {
      return db.getAllProducts();
    }),

    search: publicProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        if (!input.query.trim()) {
          return db.getAllProducts();
        }
        return db.searchProducts(input.query);
      }),

    getById: publicProcedure
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

    getByBarcode: publicProcedure
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
          code: "FORBIDDEN" as any,
          message: "Only cashiers and admins can create sales",
        });
        }

        const invoiceNumber = generateInvoiceNumber();
        let subtotal = 0;
        let totalTax = 0;
        const saleItems = [];

        // Process each item
        for (const item of input.items) {
          const product = await db.getProductById(item.productId);
          if (!product) {
            throw new TRPCError({
              code: "NOT_FOUND" as any,
              message: `Product ${item.productId} not found`,
            });
          }

          if (product.stockQuantity < item.quantity) {
            throw new TRPCError({
              code: "BAD_REQUEST" as any,
              message: `Insufficient stock for ${product.name}`,
            });
          }

          const itemSubtotal = item.quantity * item.unitPrice;
          const gstAmount = (itemSubtotal * item.gstPercentage) / 100;
          const itemTotal = itemSubtotal + gstAmount;

          subtotal += itemSubtotal;
          totalTax += gstAmount;

          saleItems.push({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice.toString(),
            gstPercentage: item.gstPercentage.toString(),
            gstAmount: gstAmount.toString(),
            totalPrice: itemTotal.toString(),
          });

          // Update stock
          await db.updateProduct(item.productId, {
            stockQuantity: product.stockQuantity - item.quantity,
          } as any);

          // Record stock history
          await db.createStockHistory({
            productId: item.productId,
            previousQuantity: product.stockQuantity,
            newQuantity: product.stockQuantity - item.quantity,
            changeReason: "sale" as any,
            quantity: -item.quantity,
          });
        }

        const totalAmount = subtotal + totalTax - input.discountAmount;
        const cgst = totalTax / 2;
        const sgst = totalTax / 2;

        // Create sale record
        await db.createSale({
          invoiceNumber,
          cashierId: ctx.user!.id,
          totalAmount: totalAmount.toString() as any,
          subtotal: subtotal.toString() as any,
          discountAmount: input.discountAmount.toString() as any,
          taxAmount: totalTax.toString() as any,
          cgst: cgst.toString() as any,
          sgst: sgst.toString() as any,
          paymentMode: input.paymentMode,
          status: "completed",
          notes: input.notes,
        });

        // Create sale items
        for (const item of saleItems) {
          await db.createSaleItem({
            productId: item.productId,
            saleId: 0, // Will be set by database
            quantity: item.quantity,
            unitPrice: item.unitPrice.toString() as any,
            gstPercentage: item.gstPercentage.toString() as any,
            gstAmount: item.gstAmount.toString() as any,
            totalPrice: item.totalPrice.toString() as any,
          });
        }

        // Create invoice
        const settings = await db.getSystemSettings();
        await db.createInvoice({
          saleId: 0,
          invoiceNumber,
          gstin: settings?.gstin,
          storeName: settings?.storeName,
          storeAddress: settings?.storeAddress,
          invoiceDate: new Date(),
          items: JSON.stringify(saleItems),
          subtotal: subtotal.toString() as any,
          cgst: cgst.toString() as any,
          sgst: sgst.toString() as any,
          totalTax: totalTax.toString() as any,
          totalAmount: totalAmount.toString() as any,
        });

        return {
          success: true,
          saleId: 0,
          invoiceId: 0,
          invoiceNumber,
          totalAmount: Number(totalAmount.toFixed(2)),
        };
      }),

    list: publicProcedure.query(async () => {
      return db.getAllSales();
    }),

    getById: publicProcedure
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

    getByDateRange: publicProcedure
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
    getById: publicProcedure
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

    getByNumber: publicProcedure
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

    markPrinted: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.updateInvoice(input.id, { isPrinted: true });
        return { success: true };
      }),
  }),

  // ============ SYSTEM SETTINGS ============
  settings: router({
    get: publicProcedure.query(async () => {
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
  }),

  // ============ ANALYTICS ============
  analytics: analyticsRouter,
});

export type AppRouter = typeof appRouter;
