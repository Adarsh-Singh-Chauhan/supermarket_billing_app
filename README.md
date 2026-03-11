# Supermarket Billing & Inventory Management System

A comprehensive Point of Sale (POS) system built with React, Express, tRPC, and MySQL for retail business management with intelligent analytics and AI-powered forecasting.

## 🎯 Features

### Core POS Functionality
- **User Authentication**: Role-based access control (Admin, Cashier, User)
- **Product Management**: Full CRUD operations with barcode support
- **Point of Sale Interface**: Barcode scanning, cart management, quick checkout
- **GST Invoice Generation**: Automatic tax calculation with professional invoice format
- **Real-time Inventory Tracking**: Stock level management with low-stock alerts

### Analytics & Intelligence
- **Sales Dashboard**: Interactive charts with daily, weekly, monthly revenue trends
- **AI-Powered Forecasting**: Machine learning-based demand prediction using LLM
- **Smart Reports**: Sales analytics, inventory reports, profit/loss statements
- **Category Analysis**: Sales breakdown by product category
- **Top Products Tracking**: Identify best-selling items

### User Experience
- **Dark/Light Theme Toggle**: Comfortable viewing in any lighting condition
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Professional UI**: Clean, intuitive interface with Tailwind CSS and shadcn/ui
- **Real-time Updates**: Live inventory and sales data

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Recharts
- **Backend**: Express 4, tRPC 11, Node.js
- **Database**: MySQL with Drizzle ORM
- **Authentication**: Manus OAuth
- **AI/ML**: LLM integration for demand forecasting
- **Testing**: Vitest

### Database Schema
- **users**: User accounts with role-based access
- **products**: Product catalog with pricing and inventory
- **sales**: Sales transactions with payment details
- **saleItems**: Individual items in each sale
- **invoices**: Detailed invoice records with GST
- **stockHistory**: Inventory change tracking
- **systemSettings**: Store configuration
- **forecastingResults**: AI demand predictions

## 🚀 Getting Started

### Prerequisites
- Node.js 22+
- MySQL 8.0+
- pnpm package manager

### Installation

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Setup Database**
   ```bash
   # Generate migrations
   pnpm drizzle-kit generate

   # Apply migrations
   pnpm drizzle-kit migrate
   ```

3. **Seed Demo Data**
   ```bash
   node seed-db.mjs
   ```

4. **Start Development Server**
   ```bash
   pnpm dev
   ```

5. **Access Application**
   - Open browser to `https://localhost:3000`
   - Login with your Manus OAuth credentials

## 📱 Main Pages

### POS Interface (`/pos`)
- Barcode scanner integration
- Shopping cart with real-time updates
- Multiple payment modes (Cash, Card, UPI, Cheque)
- Quick checkout with GST calculation

### Product Management (`/products`)
- Add/Edit/Delete products
- Barcode generation and management
- Category organization
- Supplier information tracking

### Inventory Management (`/inventory`)
- Real-time stock tracking
- Low-stock alerts
- Stock adjustment history
- Total inventory value calculation

### Sales Transactions (`/sales`)
- View all sales with filters
- Invoice preview and download
- Payment mode breakdown
- Transaction details

### Analytics Dashboard (`/analytics`)
- Revenue trends (daily, weekly, monthly)
- Top-selling products
- Category-wise sales breakdown
- Profit & loss analysis
- Interactive Recharts visualizations

### Smart Reports (`/reports`)
- AI-powered demand forecasting
- Inventory insights
- Sales analytics reports
- Profit/loss statements
- Downloadable reports

## 🔑 Key APIs

### Products
```typescript
trpc.products.list()                    // Get all products
trpc.products.search({ query })         // Search products
trpc.products.create(data)              // Add new product
trpc.products.update(data)              // Update product
trpc.products.delete({ id })            // Delete product
```

### Inventory
```typescript
trpc.inventory.getStockHistory({ productId })
trpc.inventory.updateStock({ productId, quantity, reason })
```

### Sales
```typescript
trpc.sales.list()
trpc.sales.getByDateRange({ startDate, endDate })
trpc.sales.create(data)
```

### Analytics
```typescript
trpc.analytics.getSalesOverview({ startDate, endDate })
trpc.analytics.getDailySalesData({ startDate, endDate })
trpc.analytics.getTopSellingProducts({ startDate, endDate, limit })
trpc.analytics.getCategoryWiseSales({ startDate, endDate })
trpc.analytics.getProfitLossAnalysis({ startDate, endDate })
trpc.analytics.getInventoryInsights()
trpc.analytics.generateDemandForecast({ productId, forecastDays })
trpc.analytics.getLatestForecasts({ limit })
```

## 🧪 Testing

Run the comprehensive test suite:
```bash
pnpm test
```

Test coverage includes:
- Product management operations
- Inventory tracking and updates
- Sales transactions
- Invoice generation
- Analytics calculations
- Authentication and authorization
- System settings

## 🎨 Customization

### Theme Configuration
Edit `client/src/index.css` to customize:
- Color palette (background, foreground, accent, etc.)
- Typography (fonts, sizes, weights)
- Spacing and sizing
- Shadows and borders

### Business Settings
Configure store details in the system settings:
- Store name and address
- GSTIN (GST Identification Number)
- Phone and email
- Tax rates and policies

## 📊 Demo Data

The system comes pre-seeded with:
- 10 sample products across multiple categories
- System settings for "SuperMart Retail Store"
- 3 sample sales transactions with invoices
- Stock history and inventory data

## 🔐 Security

- Role-based access control (Admin/Cashier/User)
- Secure authentication via Manus OAuth
- Protected API endpoints with tRPC
- Type-safe database queries with Drizzle ORM
- Input validation and error handling

## 📈 Performance

- Optimized database queries with indexes
- Caching for frequently accessed data
- Lazy loading of components
- Efficient state management with React Query
- CDN-ready static assets

## 🐛 Troubleshooting

### Dev Server Not Starting
```bash
# Clear cache and reinstall
rm -rf node_modules .next
pnpm install
pnpm dev
```

### Database Connection Issues
- Verify MySQL is running
- Check DATABASE_URL in environment
- Ensure migrations are applied: `pnpm drizzle-kit migrate`

### Tests Failing
```bash
# Run tests with verbose output
pnpm test -- --reporter=verbose
```

## 📚 Documentation

### File Structure
```
supermarket_billing_app/
├── client/                  # React frontend
│   ├── src/
│   │   ├── pages/          # Page components
│   │   ├── components/     # Reusable components
│   │   ├── lib/            # Utilities and helpers
│   │   └── App.tsx         # Main app routing
│   └── public/             # Static assets
├── server/                 # Express backend
│   ├── routers.ts          # tRPC procedures
│   ├── analytics.ts        # Analytics endpoints
│   ├── db.ts               # Database helpers
│   └── _core/              # Core framework
├── drizzle/                # Database schema
│   └── schema.ts           # Table definitions
├── seed-db.mjs             # Demo data seeding
└── package.json            # Dependencies
```

### Database Schema
See `drizzle/schema.ts` for complete schema definitions with types.

## 🤝 Contributing

To extend the system:

1. **Add New Features**: Follow the pattern in `server/routers.ts`
2. **Create Pages**: Add React components in `client/src/pages/`
3. **Update Schema**: Modify `drizzle/schema.ts` and run migrations
4. **Write Tests**: Add test cases to `server/*.test.ts`

## 📝 License

This project is built with Manus webdev tools and follows the standard Manus project license.

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review test files for usage examples
3. Examine the database schema for data structure
4. Check API documentation in tRPC procedures

## 🎓 Learning Resources

- **tRPC Documentation**: https://trpc.io
- **React Documentation**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com
- **Drizzle ORM**: https://orm.drizzle.team
- **Recharts**: https://recharts.org

---

**Version**: 1.0.0  
**Last Updated**: March 2026  
**Status**: Production Ready
