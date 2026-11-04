# Vercel deployment setup

## Current deployment

- Project: `supermarket-billing-app`
- Production URL: https://supermarket-billing-app.vercel.app
- Repository: https://github.com/Adarsh-Singh-Chauhan/supermarket_billing_app
- Runtime: Vercel Express / Node.js 22
- The Vite client, SPA fallback, `/api/health` and Express API function are deployed.

## Values already configured on Vercel

- `JWT_SECRET`: generated random session-signing secret, stored as a sensitive variable for Production and Preview.
- `VITE_OAUTH_PORTAL_URL`: `https://manus.im`
- `OAUTH_SERVER_URL`: `https://api.manus.im`

These OAuth URLs match the legacy Manus WebDev OAuth flow implemented by this repository. The app ID is still unique to the Manus app and must come from the original app configuration.

## Required values still to add

Add these in **Vercel → Project → Settings → Environment Variables** for Production and Preview:

| Variable | What to enter |
|---|---|
| `VITE_APP_ID` | The Manus WebDev app ID for this application. Required at Vite build time. |
| `OWNER_OPEN_ID` | Your Manus Open ID. The first matching account is assigned the Admin role on user creation. |
| `DATABASE_URL` | A reachable MySQL connection string for the production database. |

Optional for AI demand forecasting:

| Variable | What to enter |
|---|---|
| `BUILT_IN_FORGE_API_KEY` | A valid Manus Forge API key for this app/runtime. |
| `BUILT_IN_FORGE_API_URL` | Optional override; the code defaults to `https://forge.manus.im`. |

Do not paste these credentials into source files or commit them to Git. Set them in Vercel's encrypted Environment Variables UI. `VITE_APP_ID` is included in the browser bundle by design; it is an app identifier, not a secret.

## Database initialization

1. Provision a production MySQL database with network access from Vercel.
2. Set `DATABASE_URL` in Vercel.
3. From a trusted local checkout with the same `DATABASE_URL`, run:

   ```bash
   pnpm install
   pnpm db:push
   ```

4. Confirm that the ten Drizzle tables are present before using the POS.

**Do not run `node seed-db.mjs` against production.** That script deletes existing stock history, sale items, invoices, sales, forecasts, products and settings before inserting demo records.

## Redeploy and verify

After adding the remaining values, trigger a new Production deployment so Vite rebuilds with `VITE_APP_ID` and the server picks up the environment variables. Verify:

- `/` and `/pos` return the app HTML.
- `/api/health` returns `200`.
- The Manus sign-in redirect uses the production callback URL `https://supermarket-billing-app.vercel.app/api/oauth/callback`.
- A signed-in owner is stored with the Admin role.
- Product, inventory, checkout, invoice and sales records persist after separate requests.

The app is not production-ready for transactions until the database connection, OAuth app ID and owner identity are configured and the checks above pass.
