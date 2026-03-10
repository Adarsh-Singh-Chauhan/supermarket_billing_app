import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { invokeLLM } from "./_core/llm";

export const analyticsRouter = router({
  // ============ SALES ANALYTICS ============
  getSalesOverview: protectedProcedure
    .input(z.object({
      startDate: z.date(),
      endDate: z.date(),
    }))
    .query(async ({ input }) => {
      const sales = await db.getSalesByDateRange(input.startDate, input.endDate);
      
      let totalRevenue = 0;
      let totalTax = 0;
      let totalDiscount = 0;
      let totalTransactions = 0;

      for (const sale of sales) {
        totalRevenue += Number(sale.totalAmount);
        totalTax += Number(sale.taxAmount);
        totalDiscount += Number(sale.discountAmount);
        totalTransactions += 1;
      }

      return {
        totalRevenue,
        totalTax,
        totalDiscount,
        totalTransactions,
        averageTransactionValue: totalTransactions > 0 ? totalRevenue / totalTransactions : 0,
      };
    }),

  getDailySalesData: protectedProcedure
    .input(z.object({
      startDate: z.date(),
      endDate: z.date(),
    }))
    .query(async ({ input }) => {
      const sales = await db.getSalesByDateRange(input.startDate, input.endDate);
      
      // Group sales by date
      const dailyData: Record<string, {
        date: string;
        revenue: number;
        transactions: number;
        tax: number;
      }> = {};

      for (const sale of sales) {
        const date = new Date(sale.createdAt).toISOString().split('T')[0];
        if (!dailyData[date]) {
          dailyData[date] = {
            date,
            revenue: 0,
            transactions: 0,
            tax: 0,
          };
        }
        dailyData[date].revenue += Number(sale.totalAmount);
        dailyData[date].transactions += 1;
        dailyData[date].tax += Number(sale.taxAmount);
      }

      return Object.values(dailyData).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    }),

  getTopSellingProducts: protectedProcedure
    .input(z.object({
      startDate: z.date(),
      endDate: z.date(),
      limit: z.number().default(10),
    }))
    .query(async ({ input }) => {
      const sales = await db.getSalesByDateRange(input.startDate, input.endDate);
      
      // Aggregate product sales
      const productSales: Record<number, {
        productId: number;
        quantity: number;
        revenue: number;
      }> = {};

      for (const sale of sales) {
        const items = await db.getSaleItems(sale.id);
        for (const item of items) {
          if (!productSales[item.productId]) {
            productSales[item.productId] = {
              productId: item.productId,
              quantity: 0,
              revenue: 0,
            };
          }
          productSales[item.productId].quantity += item.quantity;
          productSales[item.productId].revenue += Number(item.totalPrice);
        }
      }

      // Get product details and sort by quantity
      const topProducts = await Promise.all(
        Object.values(productSales)
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, input.limit)
          .map(async (ps) => {
            const product = await db.getProductById(ps.productId);
            return {
              ...ps,
              productName: product?.name || "Unknown",
            };
          })
      );

      return topProducts;
    }),

  getCategoryWiseSales: protectedProcedure
    .input(z.object({
      startDate: z.date(),
      endDate: z.date(),
    }))
    .query(async ({ input }) => {
      const sales = await db.getSalesByDateRange(input.startDate, input.endDate);
      
      // Aggregate by category
      const categorySales: Record<string, {
        category: string;
        revenue: number;
        quantity: number;
      }> = {};

      for (const sale of sales) {
        const items = await db.getSaleItems(sale.id);
        for (const item of items) {
          const product = await db.getProductById(item.productId);
          if (product) {
            if (!categorySales[product.category]) {
              categorySales[product.category] = {
                category: product.category,
                revenue: 0,
                quantity: 0,
              };
            }
            categorySales[product.category].revenue += Number(item.totalPrice);
            categorySales[product.category].quantity += item.quantity;
          }
        }
      }

      return Object.values(categorySales).sort((a, b) => b.revenue - a.revenue);
    }),

  // ============ AI FORECASTING ============
  generateDemandForecast: protectedProcedure
    .input(z.object({
      productId: z.number(),
      forecastDays: z.number().default(30),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN" as any,
        message: "Only admins can generate forecasts",
      });
      }

      const product = await db.getProductById(input.productId);
      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND" as any,
          message: "Product not found",
        });
      }

      // Get historical sales data for the product
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000); // Last 90 days
      
      const historicalData = await db.getProductSalesAnalytics(
        input.productId,
        startDate,
        endDate
      );

      if (historicalData.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST" as any,
          message: "Insufficient historical data for forecasting",
        });
      }

      // Prepare data for LLM analysis
      const salesSummary = historicalData.map(d => ({
        date: new Date(d.date).toISOString().split('T')[0],
        quantity: d.quantitySold,
        revenue: Number(d.revenue),
      }));

      // Use LLM to analyze trends and predict demand
      const forecastPrompt = `
You are a demand forecasting expert. Analyze the following historical sales data for a product and provide a demand forecast.

Product: ${product.name}
Category: ${product.category}
Current Stock: ${product.stockQuantity}

Historical Sales Data (last 90 days):
${JSON.stringify(salesSummary, null, 2)}

Based on this data, provide:
1. Average daily demand
2. Predicted demand for the next ${input.forecastDays} days
3. Confidence level (0-100)
4. Recommended stock level
5. Brief analysis of trends

Respond in JSON format with keys: averageDailyDemand, predictedDemand, confidence, recommendedStock, analysis
`;

      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "You are a demand forecasting expert. Respond only with valid JSON.",
            },
            {
              role: "user",
              content: forecastPrompt as any,
            },
          ],
        });

        const content = response.choices[0]?.message.content;
        const contentStr = typeof content === 'string' ? content : "{}";
        const forecast = JSON.parse(contentStr);

        // Store forecast result
        const forecastDate = new Date();
        forecastDate.setDate(forecastDate.getDate() + input.forecastDays);

        await db.createForecastingResult({
          productId: input.productId,
          forecastDate,
          predictedDemand: Math.round(forecast.predictedDemand || 0),
          confidence: forecast.confidence || 0,
          recommendedStock: Math.round(forecast.recommendedStock || 0),
          forecastType: "monthly",
        });

        return {
          success: true,
          forecast: {
            ...forecast,
            productName: product.name,
            currentStock: product.stockQuantity,
          },
        };
      } catch (error) {
        console.error("Forecasting error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR" as any,
          message: "Failed to generate forecast",
        });
      }
    }),

  getLatestForecasts: protectedProcedure
    .input(z.object({
      limit: z.number().default(10),
    }))
    .query(async ({ input }) => {
      const forecasts = await db.getLatestForecasts(input.limit);
      
      // Enrich with product details
      const enriched = await Promise.all(
        forecasts.map(async (f) => {
          const product = await db.getProductById(f.productId);
          return {
            ...f,
            productName: product?.name || "Unknown",
            currentStock: product?.stockQuantity || 0,
          };
        })
      );

      return enriched;
    }),

  // ============ PROFIT & LOSS ANALYSIS ============
  getProfitLossAnalysis: protectedProcedure
    .input(z.object({
      startDate: z.date(),
      endDate: z.date(),
    }))
    .query(async ({ input }) => {
      const sales = await db.getSalesByDateRange(input.startDate, input.endDate);
      
      let totalRevenue = 0;
      let totalCost = 0;

      for (const sale of sales) {
        totalRevenue += Number(sale.totalAmount);
        
        // Calculate cost from sale items
        const items = await db.getSaleItems(sale.id);
        for (const item of items) {
          const product = await db.getProductById(item.productId);
          if (product) {
            totalCost += Number(product.costPrice) * item.quantity;
          }
        }
      }

      const profit = totalRevenue - totalCost;
      const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

      return {
        totalRevenue,
        totalCost,
        profit,
        profitMargin,
        breakEvenPoint: totalRevenue > 0 ? (totalCost / totalRevenue) * 100 : 0,
      };
    }),

  // ============ INVENTORY INSIGHTS ============
  getInventoryInsights: protectedProcedure.query(async () => {
    const products = await db.getAllProducts();
    
    const insights = {
      totalProducts: products.length,
      totalStockValue: 0,
      lowStockProducts: 0,
      outOfStockProducts: 0,
      averageStockLevel: 0,
      fastMovingProducts: 0,
      slowMovingProducts: 0,
    };

    let totalStock = 0;

    for (const product of products) {
      insights.totalStockValue += Number(product.sellingPrice) * product.stockQuantity;
      totalStock += product.stockQuantity;

      if (product.stockQuantity === 0) {
        insights.outOfStockProducts += 1;
      } else if (product.stockQuantity <= 10) {
        insights.lowStockProducts += 1;
      }
    }

    insights.averageStockLevel = products.length > 0 ? totalStock / products.length : 0;

    return insights;
  }),
});

export type AnalyticsRouter = typeof analyticsRouter;
