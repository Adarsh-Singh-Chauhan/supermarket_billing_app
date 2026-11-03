<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Manrope&weight=800&size=30&pause=900&color=2563EB&center=true&vCenter=true&width=900&lines=Supermarket+Billing+%26+Inventory+POS;A+Retail+Operations+Workspace;From+Checkout+to+Business+Intelligence" alt="Animated project title" />

<p><strong>A full-stack retail Point of Sale and inventory management application with GST billing, sales analytics and AI-assisted demand forecasting.</strong></p>

<p>
  <img src="https://img.shields.io/badge/React-19-149ECA?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-4-111827?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/tRPC-11-2596BE?style=for-the-badge&logo=trpc&logoColor=white" />
  <img src="https://img.shields.io/badge/MySQL-8-4479A1?style=for-the-badge&logo=mysql&logoColor=white" />
  <img src="https://img.shields.io/badge/Drizzle%20ORM-0.44-C5F74F?style=for-the-badge" />
</p>

<p>
  <a href="#-overview">Overview</a> ·
  <a href="#-product-tour">Product tour</a> ·
  <a href="#-architecture">Architecture</a> ·
  <a href="#-getting-started">Getting started</a> ·
  <a href="#-api-surface">API surface</a>
</p>

</div>

---

## ✨ Overview

This repository contains a full-stack **Supermarket Billing & Inventory Management System**. It is designed around the day-to-day workflow of a retail store: maintain a product catalogue, scan or search items at checkout, calculate GST, record payment, create an invoice, track inventory movement and review business performance.

The application uses a React + TypeScript client, an Express server, tRPC for end-to-end typed procedures, and MySQL accessed through Drizzle ORM.

### What the application brings together

| Retail workflow | What it supports |
|---|---|
| Checkout / POS | Product search, barcode lookup, cart, quantity adjustment and checkout |
| Billing | GST calculation, CGST/SGST fields, invoice records and payment mode |
| Product catalogue | Product create/update/deactivate, categories, barcode, prices and supplier |
| Inventory | Available stock, low-stock lookup and stock movement history |
| Sales operations | Transaction listing, date-range sales and invoice lookup |
| Analytics | Revenue overview, daily trend, top products, category sales and profit/loss |
| Demand forecasting | LLM-assisted forecast generation based on historical product sales |
| Store settings | Store identity, GSTIN, contact details and low-stock threshold |
| Access control | Authenticated user context and Admin / Cashier / User roles |

## 🧭 Product tour

The client routes are defined in `client/src/App.tsx`.

| Route | Workspace |
|---|---|
| `/` and `/dashboard` | Store dashboard |
| `/pos` | Point of Sale |
| `/products` | Product catalogue |
| `/inventory` | Stock management |
| `/sales` | Sales transactions |
| `/analytics` | Sales and business analytics |
| `/reports` | Reports and demand forecasts |
| `/admin`, `/admin/users`, `/admin/settings` | Admin route placeholders / settings entry points |

### POS workflow

```text
Search product / scan barcode
          ↓
      Add to cart
          ↓
 Adjust quantity / discount
          ↓
 Choose payment mode
          ↓
       Checkout
          ↓
 Sale + sale items + invoice
          ↓
 Stock and sales history
```

Supported payment modes declared in the sales schema: **Cash, Card, UPI and Cheque**.

## 🧱 Architecture

```text
┌─────────────────────────────────────────────────────────┐
│                    React 19 Client                       │
│  Wouter routes · Tailwind CSS 4 · shadcn/ui · Recharts   │
│                     React Query                          │
└──────────────────────────┬──────────────────────────────┘
                           │ tRPC client
                           ▼
┌─────────────────────────────────────────────────────────┐
│                 Express 4 Application                    │
│  OAuth routes · tRPC middleware · authenticated context  │
│  Product · POS · Inventory · Invoice · Analytics APIs    │
└──────────────────────────┬──────────────────────────────┘
                           │ Drizzle ORM
                           ▼
┌─────────────────────────────────────────────────────────┐
│                         MySQL                            │
│ Users · Products · Sales · Sale Items · Invoices         │
│ Stock History · Analytics · Forecasting · Settings       │
└─────────────────────────────────────────────────────────┘
                           │
                           └──── LLM integration
                                  Demand forecast analysis
```

### Technology stack

| Layer | Technology | Role in this repository |
|---|---|---|
| Frontend | React 19 | Component-based user interface |
| Language | TypeScript 5.9 | Typed client and server code |
| Styling | Tailwind CSS 4 | Utility-first design system |
| Components | shadcn/ui + Radix UI | Accessible UI building blocks |
| Charts | Recharts | Revenue and analytics visualizations |
| Routing | Wouter | Lightweight client-side routes |
| Data fetching | TanStack React Query | Async server-state management |
| API | tRPC 11 | End-to-end typed RPC procedures |
| Backend | Node.js + Express 4 | HTTP application and API middleware |
| Validation | Zod | Input schema validation |
| Database | MySQL | Persistent retail records |
| ORM | Drizzle ORM + Drizzle Kit | Typed SQL access and migrations |
| Authentication | Manus OAuth integration | Login and user context |
| AI integration | LLM service wrapper | Demand-forecast analysis |
| Testing | Vitest | Automated unit / integration tests |
| Package manager | pnpm | Dependency and script management |
| Build | Vite + esbuild | Client bundle and server bundle |

## 🗃️ Data model

The database definitions live in `drizzle/schema.ts`.

| Table | Purpose |
|---|---|
| `users` | User identity, email, login method and role |
| `products` | Product catalogue, barcode, prices, GST and stock |
| `stockHistory` | Stock adjustments, sales, restocks and damage records |
| `sales` | Sale header, totals, tax, discount and payment mode |
| `saleItems` | Product, quantity, unit price and GST for each sale |
| `invoices` | Invoice number, store details, tax breakdown and QR field |
| `dailySalesSummary` | Daily aggregate sales and revenue |
| `productSalesAnalytics` | Product-level historical sales |
| `forecastingResults` | Predicted demand, confidence and recommended stock |
| `systemSettings` | Store identity and operational settings |

## 📊 Analytics and forecasting

The analytics router in `server/analytics.ts` includes protected procedures for:

- Sales overview: revenue, tax, discounts, transaction count and average transaction value.
- Daily sales data: date-wise revenue, transactions and tax.
- Top-selling products: quantity and revenue by product.
- Category-wise sales: revenue and quantity grouped by category.
- Profit/loss analysis: revenue, estimated product cost, profit and margin.
- Inventory insights: catalogue size, stock value, low-stock and out-of-stock counts.
- Demand forecast generation: sends historical sales context to the configured LLM service and stores the returned forecast.

**Forecasting note:** The forecast depends on historical records and a functioning LLM integration. The feature reports model-generated estimates, not guaranteed demand or purchasing advice.

## 🔐 Authentication and permissions

The repository integrates Manus OAuth. The server resolves the current user context and the schema defines these roles:

- **Admin** — elevated access for administrative operations.
- **Cashier** — store checkout role.
- **User** — standard authenticated account.

Some procedures explicitly check for Admin role before allowing settings, user-management or forecasting actions. Review the exact router procedure for each permission before deploying custom role policies.

## 🚀 Getting started

### Prerequisites

- Node.js 22+
- pnpm (the repository declares pnpm 10.4.1)
- MySQL 8+
- Access to the configured Manus OAuth / runtime integration
- Environment values required by the server (see below)

### 1. Clone

```bash
git clone https://github.com/Adarsh-Singh-Chauhan/supermarket_billing_app.git
cd supermarket_billing_app
```

### 2. Install dependencies

```bash
corepack enable
pnpm install
```

### 3. Configure environment

Create a local `.env` file in the repository root. The server reads these values in `server/_core/env.ts` and related runtime modules.

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | MySQL connection URL |
| `JWT_SECRET` | Session cookie signing secret |
| `OAUTH_SERVER_URL` | Manus OAuth server base URL |
| `VITE_APP_ID` | Application identifier used by the runtime |
| `OWNER_OPEN_ID` | Owner identity used for initial Admin role assignment |
| `BUILT_IN_FORGE_API_URL` | Built-in service endpoint used by runtime integrations |
| `BUILT_IN_FORGE_API_KEY` | Secret key for the built-in service integration |

Use credentials issued for your own environment. Do not commit real secrets or database passwords.

### 4. Prepare the database

```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

The repository also contains a demo-data seeder:

```bash
node seed-db.mjs
```

Run the seeder only against a development database you control. Inspect `seed-db.mjs` before running it against an existing database.

### 5. Start the development server

```bash
pnpm dev
```

The server entrypoint is `server/_core/index.ts`. It starts Express and configures Vite in development mode. Open the local URL printed in the terminal (the preferred port is 3000).

### 6. Validate the project

```bash
pnpm check
pnpm test
pnpm build
```

## 🔌 API surface

The main tRPC router is defined in `server/routers.ts`; analytics procedures are composed from `server/analytics.ts`.

| Domain | Example procedures |
|---|---|
| Products | `products.list`, `products.search`, `products.create`, `products.update`, `products.delete`, `products.getByBarcode` |
| Inventory | `inventory.getStockHistory`, `inventory.updateStock`, `inventory.getSummary` |
| Sales | `sales.list`, `sales.getByDateRange`, `sales.create` |
| Invoices | `invoices.getById`, `invoices.getByNumber`, `invoices.markPrinted` |
| Analytics | `analytics.getSalesOverview`, `analytics.getDailySalesData`, `analytics.getTopSellingProducts`, `analytics.getProfitLossAnalysis` |
| Forecasting | `analytics.generateDemandForecast`, `analytics.getLatestForecasts` |
| Settings | `settings.get`, `settings.update` |
| Users | `users.list` |

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for request shapes and response details. The router source is the implementation authority if documentation and code differ.

## 🧪 Testing

Run the repository test suite:

```bash
pnpm test
```

Type-check:

```bash
pnpm check
```

The repository includes Vitest configuration and tests such as `server/pos.test.ts` and `server/auth.logout.test.ts`. The current checked-in TODO describes a 20-test milestone; run the test command to confirm the current result in your environment.

## 📁 Repository structure

```text
supermarket_billing_app/
├── client/
│   └── src/
│       ├── components/          # Shared layouts and UI components
│       ├── contexts/            # Theme context
│       ├── hooks/               # Client hooks
│       ├── lib/                 # tRPC client and utilities
│       ├── pages/               # POS, products, inventory, sales, analytics
│       ├── App.tsx              # Client route definitions
│       └── index.css            # Tailwind theme and base styles
├── server/
│   ├── _core/                   # Express, OAuth, tRPC context and runtime
│   ├── analytics.ts             # Analytics and forecasting procedures
│   ├── db.ts                    # Drizzle query helpers
│   └── routers.ts               # Main tRPC router
├── shared/                      # Shared constants and types
├── drizzle/                     # MySQL schema and migrations
├── API_DOCUMENTATION.md         # API guide
├── seed-db.mjs                  # Demo data seeder
├── package.json                 # Scripts and dependencies
├── pnpm-lock.yaml               # Locked dependency graph
├── drizzle.config.ts            # Drizzle configuration
├── vite.config.ts               # Vite frontend configuration
└── vitest.config.ts             # Test configuration
```

## 🛡️ Security and operational notes

- Keep `.env`, database credentials, OAuth secrets and API keys out of Git.
- Use HTTPS in production and configure secure cookie settings for the target domain.
- Restrict Admin-only procedures and validate access at the server, not only in the client.
- Back up MySQL before migrations or destructive data operations.
- Run database migrations as a controlled release step.
- Configure CORS, allowed origins, session secrets and OAuth callback URLs for the production domain.
- Use a dedicated production database; never point a public demo to a local or personal development database.

## ☁️ Deployment

This repository is a **full-stack Node.js + Express + MySQL application**, not a static-only site. A production deployment needs:
1. A Node.js hosting environment capable of running the Express server.
2. A reachable MySQL database and a configured `DATABASE_URL`.
3. OAuth application settings and callback URLs for the production domain.
4. Runtime secrets and LLM service configuration.
5. A release process for database migrations and the Vite/esbuild build.

Vercel can host the built frontend and supported serverless functions, but the current Express entrypoint, Manus OAuth runtime, long-lived server setup and MySQL connectivity must be adapted and verified before a Vercel deployment can be called production-ready. Do not use a static-only deployment as a replacement for the full application.

## 🧑‍💻 Contributing

1. Create a branch for your work.
2. Keep UI changes consistent with the existing Tailwind and shadcn/ui component system.
3. Keep API input validation in Zod schemas.
4. Update Drizzle schema and migrations together when changing persistence.
5. Add or update Vitest coverage for business logic.
6. Run `pnpm check`, `pnpm test` and `pnpm build` before opening a pull request.

## 📄 License

The repository's `package.json` declares the MIT license. Refer to the repository's [LICENSE](LICENSE) file for the complete terms.

---

<div align="center">

**Built for everyday retail operations — from the first scan to the final report.**

<a href="https://github.com/Adarsh-Singh-Chauhan">GitHub · Adarsh Singh Chauhan</a>

</div>
