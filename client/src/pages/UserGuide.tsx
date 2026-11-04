import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowRight, Barcode, FileText, Package, ShieldCheck, ShoppingCart, UserRound, ChartNoAxesCombined } from "lucide-react";

const sections=[
  {n:"01",title:"Sign in and choose your workspace",text:"Use your store email and password. Your administrator assigns the account role. New registrations start as a standard User and do not receive cashier or admin permissions automatically."},
  {n:"02",title:"Maintain the product catalogue",text:"Open Products → Add Product. Enter product name, category, barcode, cost price, selling price, GST rate, supplier and opening stock. Use a unique barcode for scan-based checkout."},
  {n:"03",title:"Create a bill at POS",text:"Open Point of Sale. Search by product name or barcode, add items to the cart, change quantities, review GST and discount, select payment mode, then confirm checkout. The server rechecks the database price and available stock before saving."},
  {n:"04",title:"Review the invoice and sale",text:"The completed sale receives an invoice number. Sale items, invoice and stock movements are linked to the same sale record. Use Sales to inspect the transaction and print the invoice."},
  {n:"05",title:"Control inventory",text:"Inventory shows available units and stock value. Administrators can record restocks, adjustments and damaged quantities. Review low-stock products before placing a supplier order."},
  {n:"06",title:"Read the business reports",text:"Analytics and Reports summarize revenue, transaction count, category performance, top-selling products, profit/loss estimates and demand forecasts where the required source data is available."},
];

export default function UserGuide(){
 return <DashboardLayout><main className="mx-auto max-w-6xl space-y-9 p-4 sm:p-6 lg:p-8">
  <section className="rounded-3xl bg-[#17372a] p-7 text-white sm:p-10"><p className="text-xs font-semibold uppercase tracking-[.2em] text-[#b8dfc3]">StoreDesk / Help centre</p><h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">The store workflow, step by step.</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">A practical guide for administrators and cashiers—from product setup to checkout, stock movement and daily reporting.</p><div className="mt-6 flex flex-wrap gap-2"><Badge className="border-white/15 bg-white/10 text-white hover:bg-white/10">Admin guide</Badge><Badge className="border-white/15 bg-white/10 text-white hover:bg-white/10">Cashier guide</Badge><Badge className="border-white/15 bg-white/10 text-white hover:bg-white/10">Inventory guide</Badge></div></section>

  <section><div className="mb-4"><h2 className="text-xl font-semibold tracking-tight">System workflow</h2><p className="mt-1 text-sm text-muted-foreground">One connected route from product record to completed sale.</p></div><Card className="overflow-hidden rounded-2xl border-border/70 p-2 sm:p-4"><img src="/storedesk-workflow.svg" alt="StoreDesk end-to-end workflow from catalogue to analytics" className="w-full rounded-xl"/></Card></section>

  <section><div className="mb-4"><h2 className="text-xl font-semibold tracking-tight">Dashboard overview</h2><p className="mt-1 text-sm text-muted-foreground">Illustrative training image, not live store figures.</p></div><Card className="overflow-hidden rounded-2xl border-border/70 p-2 sm:p-4"><img src="/storedesk-dashboard-guide.svg" alt="StoreDesk dashboard guide preview showing sales, product count, stock and quick actions" className="w-full rounded-xl"/></Card></section>

  <section><div className="mb-5"><h2 className="text-xl font-semibold tracking-tight">Six steps to run the store</h2><p className="mt-1 text-sm text-muted-foreground">Follow the order the data moves through the application.</p></div><div className="space-y-3">{sections.map(s=><Card key={s.n} className="flex gap-4 rounded-2xl border-border/70 p-5 sm:p-6"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-sm font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">{s.n}</span><div><h3 className="font-semibold">{s.title}</h3><p className="mt-2 text-sm leading-7 text-muted-foreground">{s.text}</p></div></Card>)}</div></section>

  <section><h2 className="mb-4 text-xl font-semibold tracking-tight">Role and permission guide</h2><div className="grid gap-3 md:grid-cols-3">
    {[{icon:ShieldCheck,title:"Administrator",tasks:["Manage products and catalogue","Restock and adjust inventory","Manage user roles","Update store and GST settings","Review analytics and reports"]},{icon:ShoppingCart,title:"Cashier",tasks:["Search and scan products","Build and complete bills","Select payment method","Review permitted sales and invoices"]},{icon:UserRound,title:"Standard user",tasks:["Access only the modules granted","Review permitted store information","No role self-promotion or admin settings"]}].map(role=><Card key={role.title} className="rounded-2xl border-border/70 p-5"><role.icon className="h-5 w-5 text-emerald-700 dark:text-emerald-300"/><h3 className="mt-4 font-semibold">{role.title}</h3><ul className="mt-3 space-y-2 text-xs leading-5 text-muted-foreground">{role.tasks.map(t=><li key={t} className="flex gap-2"><span className="text-emerald-700">•</span>{t}</li>)}</ul></Card>)}
  </div></section>

  <section><h2 className="mb-4 text-xl font-semibold tracking-tight">Quick navigation</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
    {[{href:"/pos",icon:ShoppingCart,label:"Open POS"},{href:"/products",icon:Barcode,label:"Products"},{href:"/inventory",icon:Package,label:"Inventory"},{href:"/analytics",icon:ChartNoAxesCombined,label:"Analytics"},{href:"/sales",icon:FileText,label:"Sales & invoices"},{href:"/reports",icon:ChartNoAxesCombined,label:"Reports"}].map(x=><Link key={x.href} href={x.href} className="flex items-center justify-between rounded-xl border bg-card p-4 text-sm font-medium transition-colors hover:border-emerald-600/40 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20"><span className="flex items-center gap-3"><x.icon className="h-4 w-4 text-emerald-700"/>{x.label}</span><ArrowRight className="h-4 w-4 text-muted-foreground"/></Link>)}
  </div></section>

  <Card className="rounded-2xl border-amber-200 bg-amber-50/70 p-5 dark:border-amber-900 dark:bg-amber-950/20"><h3 className="font-semibold text-amber-950 dark:text-amber-100">Before using the live store</h3><p className="mt-2 text-sm leading-7 text-amber-900/80 dark:text-amber-100/75">Confirm the database connection, apply the latest migration, set up a store profile and create individual staff accounts. Demo credentials belong only in an isolated demo database—not in a production store containing real customer or transaction data.</p></Card>
 </main></DashboardLayout>;
}
