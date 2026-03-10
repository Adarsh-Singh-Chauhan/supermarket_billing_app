# POS System - API Documentation

Complete API reference for the Supermarket Billing & Inventory Management System using tRPC.

## Authentication

All endpoints require authentication via Manus OAuth. The authenticated user context is available in all procedures.

```typescript
// Get current user
trpc.auth.me.useQuery()

// Logout
trpc.auth.logout.useMutation()
```

## Products API

### List All Products
```typescript
trpc.products.list.useQuery()
```
**Returns**: `Product[]`

### Search Products
```typescript
trpc.products.search.useQuery({ query: string })
```
**Parameters**:
- `query`: Search by product name or barcode

**Returns**: `Product[]`

### Create Product
```typescript
trpc.products.create.useMutation()
```
**Input**:
```typescript
{
  name: string
  category: string
  barcode?: string
  costPrice: number
  sellingPrice: number
  gstPercentage: number
  stockQuantity: number
  supplier?: string
  description?: string
}
```

### Update Product
```typescript
trpc.products.update.useMutation()
```
**Input**:
```typescript
{
  id: number
  name?: string
  category?: string
  barcode?: string
  costPrice?: number
  sellingPrice?: number
  gstPercentage?: number
  stockQuantity?: number
  supplier?: string
  description?: string
}
```

### Delete Product
```typescript
trpc.products.delete.useMutation()
```
**Input**: `{ id: number }`

### Get Product by ID
```typescript
trpc.products.getById.useQuery({ id: number })
```

### Get Low Stock Products
```typescript
trpc.products.getLowStock.useQuery({ threshold: number })
```
**Returns**: `Product[]` - Products with stock below threshold

## Inventory API

### Get Stock History
```typescript
trpc.inventory.getStockHistory.useQuery({ productId: number })
```
**Returns**: `StockHistory[]`

### Update Stock
```typescript
trpc.inventory.updateStock.useMutation()
```
**Input**:
```typescript
{
  productId: number
  quantity: number
  reason: 'sale' | 'restock' | 'adjustment' | 'damage'
  notes?: string
}
```

### Get Inventory Summary
```typescript
trpc.inventory.getSummary.useQuery()
```
**Returns**:
```typescript
{
  totalProducts: number
  totalValue: number
  lowStockCount: number
  outOfStockCount: number
}
```

## Sales API

### List All Sales
```typescript
trpc.sales.list.useQuery()
```
**Returns**: `Sale[]`

### Get Sales by Date Range
```typescript
trpc.sales.getByDateRange.useQuery({
  startDate: Date
  endDate: Date
})
```
**Returns**: `Sale[]`

### Create Sale
```typescript
trpc.sales.create.useMutation()
```
**Input**:
```typescript
{
  items: Array<{
    productId: number
    quantity: number
    unitPrice: number
  }>
  paymentMode: 'cash' | 'card' | 'upi' | 'cheque'
  discountAmount?: number
  notes?: string
}
```

### Get Sale by ID
```typescript
trpc.sales.getById.useQuery({ id: number })
```

## Invoices API

### Get Invoice by ID
```typescript
trpc.invoices.getById.useQuery({ id: number })
```
**Returns**: `Invoice`

### Generate Invoice Number
```typescript
trpc.invoices.generateInvoiceNumber.useQuery()
```
**Returns**: `string` - Unique invoice number

### Get Invoice by Sale ID
```typescript
trpc.invoices.getBySaleId.useQuery({ saleId: number })
```

## Analytics API

### Get Sales Overview
```typescript
trpc.analytics.getSalesOverview.useQuery({
  startDate: Date
  endDate: Date
})
```
**Returns**:
```typescript
{
  totalRevenue: number
  totalTransactions: number
  averageOrderValue: number
  totalTax: number
}
```

### Get Daily Sales Data
```typescript
trpc.analytics.getDailySalesData.useQuery({
  startDate: Date
  endDate: Date
})
```
**Returns**: `Array<{ date: string; revenue: number; transactions: number }>`

### Get Top Selling Products
```typescript
trpc.analytics.getTopSellingProducts.useQuery({
  startDate: Date
  endDate: Date
  limit?: number (default: 10)
})
```
**Returns**: `Array<{ productId: number; name: string; quantity: number; revenue: number }>`

### Get Category Wise Sales
```typescript
trpc.analytics.getCategoryWiseSales.useQuery({
  startDate: Date
  endDate: Date
})
```
**Returns**: `Array<{ category: string; revenue: number; quantity: number; percentage: number }>`

### Get Profit Loss Analysis
```typescript
trpc.analytics.getProfitLossAnalysis.useQuery({
  startDate: Date
  endDate: Date
})
```
**Returns**:
```typescript
{
  totalRevenue: number
  totalCost: number
  profit: number
  profitMargin: number
  taxCollected: number
}
```

### Get Inventory Insights
```typescript
trpc.analytics.getInventoryInsights.useQuery()
```
**Returns**:
```typescript
{
  totalProducts: number
  totalValue: number
  lowStockProducts: number
  outOfStockProducts: number
  fastMovingItems: Array<{ name: string; velocity: number }>
  slowMovingItems: Array<{ name: string; velocity: number }>
}
```

### Generate Demand Forecast
```typescript
trpc.analytics.generateDemandForecast.useMutation()
```
**Input**:
```typescript
{
  productId: number
  forecastDays: number (7-90)
}
```
**Returns**:
```typescript
{
  productId: number
  forecastedDemand: Array<{ date: string; quantity: number; confidence: number }>
  trend: 'increasing' | 'decreasing' | 'stable'
  recommendation: string
}
```

### Get Latest Forecasts
```typescript
trpc.analytics.getLatestForecasts.useQuery({
  limit?: number (default: 10)
})
```
**Returns**: `ForecastingResult[]`

## System API

### Get System Settings
```typescript
trpc.system.getSettings.useQuery()
```
**Returns**: `SystemSettings`

### Update System Settings
```typescript
trpc.system.updateSettings.useMutation()
```
**Input**:
```typescript
{
  storeName?: string
  storeAddress?: string
  gstin?: string
  phoneNumber?: string
  email?: string
}
```

### Notify Owner
```typescript
trpc.system.notifyOwner.useMutation()
```
**Input**:
```typescript
{
  title: string
  content: string
}
```

## Error Handling

All endpoints follow standard tRPC error codes:

- `PARSE_ERROR`: Invalid input
- `BAD_REQUEST`: Validation failed
- `NOT_FOUND`: Resource not found
- `INTERNAL_SERVER_ERROR`: Server error
- `FORBIDDEN`: Insufficient permissions

Example error handling:
```typescript
const mutation = trpc.products.create.useMutation({
  onError: (error) => {
    console.error(error.message);
    // Handle specific error codes
    if (error.data?.code === 'BAD_REQUEST') {
      // Handle validation error
    }
  }
});
```

## Pagination

For list endpoints, use React Query's built-in pagination:

```typescript
const { data, hasNextPage, fetchNextPage } = trpc.sales.list.useInfiniteQuery(
  {},
  {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  }
);
```

## Rate Limiting

The API implements rate limiting per user:
- 100 requests per minute for read operations
- 50 requests per minute for write operations

## Data Types

### Product
```typescript
{
  id: number
  name: string
  category: string
  barcode?: string
  costPrice: Decimal
  sellingPrice: Decimal
  gstPercentage: Decimal
  stockQuantity: number
  supplier?: string
  imageUrl?: string
  description?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Sale
```typescript
{
  id: number
  invoiceNumber: string
  cashierId: number
  totalAmount: Decimal
  subtotal: Decimal
  discountAmount: Decimal
  taxAmount: Decimal
  cgst: Decimal
  sgst: Decimal
  paymentMode: 'cash' | 'card' | 'upi' | 'cheque'
  status: 'completed' | 'pending' | 'cancelled'
  notes?: string
  createdAt: Date
  updatedAt: Date
}
```

### Invoice
```typescript
{
  id: number
  saleId: number
  invoiceNumber: string
  gstin?: string
  storeName?: string
  storeAddress?: string
  invoiceDate: Date
  subtotal: Decimal
  cgst: Decimal
  sgst: Decimal
  totalTax: Decimal
  totalAmount: Decimal
  qrCode?: string
  isPrinted: boolean
  createdAt: Date
  updatedAt: Date
}
```

## Best Practices

1. **Always handle loading states**
   ```typescript
   const { data, isLoading } = trpc.products.list.useQuery();
   if (isLoading) return <Spinner />;
   ```

2. **Use optimistic updates for better UX**
   ```typescript
   const mutation = trpc.products.update.useMutation({
     onMutate: async (newData) => {
       // Update UI immediately
     },
     onError: (err, newData, context) => {
       // Rollback on error
     }
   });
   ```

3. **Invalidate cache after mutations**
   ```typescript
   const utils = trpc.useUtils();
   const mutation = trpc.products.create.useMutation({
     onSuccess: () => {
       utils.products.list.invalidate();
     }
   });
   ```

4. **Use proper date handling**
   ```typescript
   // Always use Date objects, not strings
   const startDate = new Date();
   startDate.setDate(startDate.getDate() - 30);
   ```

## Examples

### Complete Sales Flow
```typescript
// 1. Get products
const products = await trpc.products.list.useQuery();

// 2. Create sale
const sale = await trpc.sales.create.useMutation({
  items: [
    { productId: 1, quantity: 2, unitPrice: 60 }
  ],
  paymentMode: 'cash'
});

// 3. Get invoice
const invoice = await trpc.invoices.getBySaleId.useQuery({
  saleId: sale.id
});

// 4. Update analytics
const overview = await trpc.analytics.getSalesOverview.useQuery({
  startDate: new Date(),
  endDate: new Date()
});
```

### Demand Forecasting
```typescript
// Generate forecast
const forecast = await trpc.analytics.generateDemandForecast.useMutation({
  productId: 1,
  forecastDays: 30
});

// Get latest forecasts
const forecasts = await trpc.analytics.getLatestForecasts.useQuery({
  limit: 5
});
```

---

**API Version**: 1.0.0  
**Last Updated**: March 2026
