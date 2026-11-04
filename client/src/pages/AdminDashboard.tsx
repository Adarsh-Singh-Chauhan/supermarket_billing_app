import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { Activity, ArrowRight, Package, Settings, ShieldCheck, Users, Warehouse } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const users = trpc.users.list.useQuery();
  const inventory = trpc.analytics.getInventoryInsights.useQuery();
  const settings = trpc.settings.get.useQuery();
  const items = [
    { href: "/admin/users", icon: Users, title: "Team & permissions", text: "Review accounts and assign cashier or admin access.", count: users.data?.length ?? 0, label: "registered users" },
    { href: "/admin/settings", icon: Settings, title: "Store settings", text: "Update store identity, GSTIN, contact details and stock threshold.", count: settings.data ? 1 : 0, label: "store profile" },
    { href: "/inventory", icon: Warehouse, title: "Inventory health", text: "Monitor low-stock and out-of-stock catalogue items.", count: inventory.data?.lowStockProducts ?? 0, label: "low-stock items" },
    { href: "/analytics", icon: Activity, title: "Business intelligence", text: "Explore sales, profit/loss and demand forecast reports.", count: "→", label: "open analytics" },
  ];

  if (user?.role !== "admin") return <DashboardLayout><div className="mx-auto max-w-3xl p-8"><Card className="p-8"><ShieldCheck className="h-8 w-8 text-amber-600"/><h1 className="mt-4 text-2xl font-semibold">Administrator access required</h1><p className="mt-2 text-sm text-muted-foreground">This area is restricted to store administrators.</p></Card></div></DashboardLayout>;

  return <DashboardLayout><div className="mx-auto max-w-7xl space-y-7 p-4 sm:p-6 lg:p-8">
    <section className="rounded-3xl bg-[#17372a] p-7 text-white sm:p-9">
      <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#b8dfc3]">StoreDesk / Administration</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-5"><div><h1 className="text-3xl font-semibold tracking-tight">Store administration</h1><p className="mt-2 max-w-xl text-sm leading-6 text-white/65">Manage the team, configure the store and keep an eye on operational health.</p></div><span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs">Signed in as {user.name || "Administrator"}</span></div>
    </section>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(({href,icon:Icon,title,text,count,label})=><Link key={href} href={href}><Card className="group h-full rounded-2xl p-5 transition-all hover:-translate-y-1 hover:shadow-md"><div className="flex items-center justify-between"><span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"><Icon size={19}/></span><ArrowRight size={16} className="text-muted-foreground transition-transform group-hover:translate-x-1"/></div><h2 className="mt-5 font-semibold">{title}</h2><p className="mt-2 min-h-12 text-xs leading-5 text-muted-foreground">{text}</p><div className="mt-4 border-t pt-4"><span className="text-2xl font-semibold tabular-nums">{count}</span><span className="ml-2 text-xs text-muted-foreground">{label}</span></div></Card></Link>)}
    </section>
    <Card className="rounded-2xl p-5 sm:p-6"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-700 dark:text-emerald-300"/><div><h2 className="font-semibold">Permission model</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">New sign-ups receive the standard User role. Administrators can promote a team member to Cashier or Admin. Role checks are enforced by the API, not just by hiding navigation links.</p></div></div></Card>
  </div></DashboardLayout>;
}
