import { useMemo, useState, type ReactNode } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl, isOAuthConfigured } from "@/const";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, BarChart3, CalendarDays,
  ClipboardList, IndianRupee, Package, Plus, RefreshCw, ShoppingBag,
  ShoppingCart, Sparkles, TrendingUp, Truck, Users, Wallet, AlertTriangle,
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { useLocation } from "wouter";

type Period = "today" | "7d" | "30d";

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value || 0);

const dateRange = (period: Period) => {
  const endDate = new Date();
  const startDate = new Date(endDate);
  if (period === "today") startDate.setHours(0, 0, 0, 0);
  else startDate.setDate(startDate.getDate() - (period === "7d" ? 6 : 29));
  return { startDate, endDate };
};

const periodLabel: Record<Period, string> = {
  today: "Today",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
};

function StatCard({
  label, value, note, icon: Icon, tone = "blue",
}: {
  label: string;
  value: string;
  note: string;
  icon: typeof IndianRupee;
  tone?: "blue" | "green" | "amber" | "violet";
}) {
  const tones = {
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
    green: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
    violet: "bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300",
  };
  return (
    <Card className="rounded-2xl border-border/70 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 truncate text-2xl font-bold tracking-tight">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{note}</p>
        </div>
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </Card>
  );
}

function SectionHeading({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [period, setPeriod] = useState<Period>("7d");
  const range = useMemo(() => dateRange(period), [period]);

  const productsQuery = trpc.products.list.useQuery(undefined, { enabled: isAuthenticated });
  const inventoryQuery = trpc.analytics.getInventoryInsights.useQuery(undefined, { enabled: isAuthenticated });
  const overviewQuery = trpc.analytics.getSalesOverview.useQuery(range, { enabled: isAuthenticated });
  const dailyQuery = trpc.analytics.getDailySalesData.useQuery(range, { enabled: isAuthenticated });
  const lowStockQuery = trpc.products.getLowStock.useQuery(
    { threshold: 10 }, { enabled: isAuthenticated }
  );
  const salesQuery = trpc.sales.list.useQuery(undefined, { enabled: isAuthenticated });

  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-background">
      <div className="text-center"><div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary" /><p className="text-sm text-muted-foreground">Preparing your store dashboard…</p></div>
    </div>;
  }

  if (!isAuthenticated) {
    return <div className="grid min-h-screen place-items-center bg-background px-5">
      <Card className="w-full max-w-md rounded-3xl p-8 text-center shadow-xl">
        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary"><ShoppingBag className="h-7 w-7" /></div>
        <p className="text-xs font-semibold uppercase tracking-[.22em] text-primary">Retail operations</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">StoreDesk POS</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">A smarter workspace for checkout, inventory, billing and store performance.</p>
        <Button disabled={!isOAuthConfigured()} onClick={() => window.location.href = getLoginUrl()} className="mt-7 h-11 w-full rounded-xl">
          {isOAuthConfigured() ? "Sign in to your store" : "Sign-in setup pending"}
        </Button>
        {!isOAuthConfigured() && (
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            Sign-in has not been configured for this deployment yet. Please contact the store administrator.
          </p>
        )}
      </Card>
    </div>;
  }

  const products = productsQuery.data ?? [];
  const sales = salesQuery.data ?? [];
  const inventory = inventoryQuery.data;
  const overview = overviewQuery.data;
  const lowStock = lowStockQuery.data ?? [];
  const recentSales = sales.slice(0, 5);
  const loadingStats = productsQuery.isLoading || overviewQuery.isLoading || inventoryQuery.isLoading;
  const refreshAll = () => {
    void productsQuery.refetch(); void inventoryQuery.refetch(); void overviewQuery.refetch();
    void dailyQuery.refetch(); void lowStockQuery.refetch(); void salesQuery.refetch();
  };

  const quickActions = [
    { title: "New sale", detail: "Open checkout", icon: ShoppingCart, route: "/pos", style: "bg-blue-600 text-white hover:bg-blue-700" },
    { title: "Add product", detail: "Update catalogue", icon: Plus, route: "/products", style: "bg-emerald-600 text-white hover:bg-emerald-700" },
    { title: "Stock control", detail: "Review inventory", icon: Package, route: "/inventory", style: "bg-violet-600 text-white hover:bg-violet-700" },
    { title: "Sales reports", detail: "View performance", icon: BarChart3, route: "/reports", style: "bg-amber-500 text-white hover:bg-amber-600" },
  ];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1500px] space-y-7 p-4 sm:p-6 lg:p-8">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-6 py-7 text-white shadow-lg sm:px-8 sm:py-9">
          <div className="pointer-events-none absolute -right-16 -top-32 h-80 w-80 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-4 -top-20 h-64 w-64 rounded-full border border-white/10" />
          <div className="relative flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-medium tracking-wide text-blue-100"><Sparkles className="h-3.5 w-3.5" /> STORE OVERVIEW</div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, {user?.name?.split(" ")[0] || "there"}.</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">Here’s what’s happening across your store. Keep checkout moving and stay ahead of stock changes.</p>
              <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-slate-300">
                <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]" /> Workspace connected</span>
                <span className="text-slate-600">•</span><span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={refreshAll} className="h-10 rounded-xl border border-white/15 bg-white/10 text-white hover:bg-white/20"><RefreshCw className="mr-2 h-4 w-4" /> Refresh</Button>
              <Button onClick={() => navigate("/pos")} className="h-10 rounded-xl bg-white text-slate-950 hover:bg-blue-50"><ShoppingCart className="mr-2 h-4 w-4" /> Start billing <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>
          </div>
        </section>

        <section>
          <SectionHeading title="Business at a glance" subtitle={`Live figures · ${periodLabel[period]} sales window`} action={<div className="flex rounded-xl border bg-card p-1 text-xs">{(["today", "7d", "30d"] as Period[]).map(p => <button key={p} onClick={() => setPeriod(p)} className={`rounded-lg px-3 py-1.5 transition-colors ${period === p ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{p === "today" ? "Today" : p === "7d" ? "7 days" : "30 days"}</button>)}</div>} />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Gross sales" value={loadingStats ? "—" : money(overview?.totalRevenue ?? 0)} note={`${overview?.totalTransactions ?? 0} completed transactions`} icon={IndianRupee} tone="blue" />
            <StatCard label="Average bill value" value={loadingStats ? "—" : money(overview?.averageTransactionValue ?? 0)} note="Average per transaction" icon={Wallet} tone="green" />
            <StatCard label="Active products" value={loadingStats ? "—" : String(inventory?.totalProducts ?? products.length)} note="Products in catalogue" icon={Package} tone="violet" />
            <StatCard label="Low stock items" value={loadingStats ? "—" : String(inventory?.lowStockProducts ?? lowStock.length)} note={`${inventory?.outOfStockProducts ?? 0} currently out of stock`} icon={AlertTriangle} tone="amber" />
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
          <Card className="rounded-2xl border-border/70 p-5 shadow-sm sm:p-6">
            <SectionHeading title="Sales performance" subtitle={`Revenue trend · ${periodLabel[period]}`} action={<span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"><TrendingUp className="h-3.5 w-3.5" /> Revenue</span>} />
            <div className="h-[260px] w-full">
              {dailyQuery.isLoading ? <div className="grid h-full place-items-center text-sm text-muted-foreground">Loading sales trend…</div> : (dailyQuery.data?.length ?? 0) === 0 ? <div className="grid h-full place-items-center rounded-xl border border-dashed text-center"><div><BarChart3 className="mx-auto h-8 w-8 text-muted-foreground/50" /><p className="mt-2 text-sm font-medium">No sales in this period</p><p className="mt-1 text-xs text-muted-foreground">Transactions will appear here after checkout.</p></div></div> : <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyQuery.data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs><linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2563eb" stopOpacity={0.25}/><stop offset="100%" stopColor="#2563eb" stopOpacity={0.01}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(value) => value >= 1000 ? `₹${(value / 1000).toFixed(0)}k` : `₹${value}`} />
                  <Tooltip formatter={(value: number) => [money(value), "Revenue"]} labelFormatter={(label) => new Date(String(label)).toLocaleDateString("en-IN", { day: "numeric", month: "long" })} contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 }} />
                  <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2.5} fill="url(#salesGradient)" />
                </AreaChart>
              </ResponsiveContainer>}
            </div>
          </Card>

          <Card className="rounded-2xl border-border/70 p-5 shadow-sm sm:p-6">
            <SectionHeading title="Quick actions" subtitle="Get to your daily tasks faster" />
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map(action => <button key={action.title} onClick={() => navigate(action.route)} className="group rounded-2xl border border-border/70 p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md">
                <span className={`mb-3 grid h-10 w-10 place-items-center rounded-xl transition-transform group-hover:scale-105 ${action.style}`}><action.icon className="h-5 w-5" /></span>
                <strong className="block text-sm font-semibold">{action.title}</strong><span className="mt-1 block text-[11px] text-muted-foreground">{action.detail}</span>
                <ArrowRight className="mt-3 h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </button>)}
            </div>
          </Card>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
          <Card className="overflow-hidden rounded-2xl border-border/70 shadow-sm">
            <div className="p-5 sm:p-6"><SectionHeading title="Recent transactions" subtitle="Latest bills recorded by your store" action={<Button variant="ghost" size="sm" onClick={() => navigate("/sales")} className="text-xs">View all <ArrowRight className="ml-1 h-3.5 w-3.5" /></Button>} /></div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm"><thead className="border-y bg-muted/40 text-[11px] uppercase tracking-wide text-muted-foreground"><tr><th className="px-5 py-3 font-medium">Invoice</th><th className="px-5 py-3 font-medium">Date</th><th className="px-5 py-3 font-medium">Payment</th><th className="px-5 py-3 text-right font-medium">Total</th></tr></thead>
                <tbody className="divide-y">{salesQuery.isLoading ? <tr><td colSpan={4} className="px-5 py-10 text-center text-muted-foreground">Loading transactions…</td></tr> : recentSales.length === 0 ? <tr><td colSpan={4} className="px-5 py-10 text-center"><ClipboardList className="mx-auto h-7 w-7 text-muted-foreground/40"/><p className="mt-2 text-sm font-medium">No transactions yet</p><p className="mt-1 text-xs text-muted-foreground">Start a sale to see your first bill here.</p></td></tr> : recentSales.map((sale: any) => <tr key={sale.id} className="transition-colors hover:bg-muted/30"><td className="px-5 py-3.5 font-medium">{sale.invoiceNumber}</td><td className="whitespace-nowrap px-5 py-3.5 text-xs text-muted-foreground">{new Date(sale.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</td><td className="px-5 py-3.5"><span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium uppercase">{sale.paymentMode}</span></td><td className="whitespace-nowrap px-5 py-3.5 text-right font-semibold">{money(Number(sale.totalAmount))}</td></tr>)}</tbody>
              </table>
            </div>
          </Card>

          <Card className="rounded-2xl border-border/70 p-5 shadow-sm sm:p-6">
            <SectionHeading title="Inventory watch" subtitle="Items that may need a restock" action={<Button variant="ghost" size="sm" onClick={() => navigate("/inventory")} className="text-xs">Inventory <ArrowRight className="ml-1 h-3.5 w-3.5" /></Button>} />
            {lowStockQuery.isLoading ? <div className="py-10 text-center text-sm text-muted-foreground">Checking stock levels…</div> : lowStock.length === 0 ? <div className="rounded-xl border border-dashed py-9 text-center"><Package className="mx-auto h-7 w-7 text-muted-foreground/40"/><p className="mt-2 text-sm font-medium">Stock levels look good</p><p className="mt-1 text-xs text-muted-foreground">No products below the 10-unit threshold.</p></div> : <div className="space-y-3">{lowStock.slice(0,5).map((product: any) => <div key={product.id} className="flex items-center justify-between gap-3 rounded-xl border border-border/70 p-3"><div className="min-w-0"><p className="truncate text-sm font-medium">{product.name}</p><p className="mt-0.5 text-[11px] text-muted-foreground">{product.category}</p></div><span className={`shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${product.stockQuantity === 0 ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300" : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"}`}>{product.stockQuantity} left</span></div>)}</div>}
          </Card>
        </section>
        <p className="pb-2 text-center text-[11px] text-muted-foreground">StoreDesk POS · Live operational figures from your connected database</p>
      </div>
    </DashboardLayout>
  );
}

