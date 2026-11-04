import { Link } from "wouter";
import {
  ArrowRight, BarChart3, Barcode, Boxes, CheckCircle2, FileText,
  IndianRupee, PackageCheck, ShieldCheck, ShoppingCart, TrendingUp, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const features = [
  { icon: ShoppingCart, title: "Fast point of sale", text: "Search products, scan barcodes, adjust quantities and complete a bill with cash, card, UPI or cheque." },
  { icon: FileText, title: "GST-aware invoices", text: "Calculate tax from catalogue rates, split CGST and SGST, and keep each invoice linked to its sale." },
  { icon: Boxes, title: "Inventory control", text: "Track stock movement, restocks, adjustments, damage and low-stock products." },
  { icon: BarChart3, title: "Sales intelligence", text: "Review revenue trends, top products, category performance, tax collected and margin estimates." },
  { icon: TrendingUp, title: "Demand forecasting", text: "Generate model-assisted demand estimates from available sales history and review the suggested stock level." },
  { icon: ShieldCheck, title: "Role-based workspace", text: "Separate store administration from cashier checkout access and standard user access." },
];

const steps = [
  ["01", "Set up the catalogue", "Add products, barcode, selling price, cost, GST rate and opening stock."],
  ["02", "Scan and build a bill", "Search or scan items, adjust quantities and review tax and discount totals."],
  ["03", "Complete checkout", "Record payment mode. The backend validates prices and stock before saving the sale."],
  ["04", "Close the loop", "Invoice, sale items and stock movements stay connected for reports and reconciliation."],
];

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f6f7f4] text-[#1d2b26] dark:bg-[#101815] dark:text-[#edf4ee]">
      <header className="sticky top-0 z-40 border-b border-[#dce5dc] bg-[#f6f7f4]/90 backdrop-blur-xl dark:border-white/10 dark:bg-[#101815]/90">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#1f5c43] text-white"><IndianRupee size={18}/></span>
            <span className="text-lg font-semibold tracking-tight">StoreDesk<span className="text-[#2e8c62]">.</span></span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-[#5b6c61] md:flex dark:text-[#aab8ad]">
            <a href="#workflow" className="hover:text-[#1f694a]">Workflow</a>
            <a href="#features" className="hover:text-[#1f694a]">Features</a>
            <a href="#roles" className="hover:text-[#1f694a]">Team access</a>
            <Link href="/guide" className="hover:text-[#1f694a]">User guide</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden rounded-lg px-3 py-2 text-sm font-medium hover:bg-black/5 sm:inline-flex dark:hover:bg-white/5">Sign in</Link>
            <Button asChild className="rounded-xl bg-[#1f5c43] px-4 text-white hover:bg-[#174934]">
              <Link href="/signup">Get started <ArrowRight className="ml-2 h-4 w-4"/></Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-20 lg:grid-cols-[1.02fr_.98fr] lg:px-8 lg:pb-28 lg:pt-28">
        <div className="pointer-events-none absolute -left-40 top-8 h-96 w-96 rounded-full bg-[#c7e5d0]/50 blur-3xl dark:bg-[#1f694a]/10"/>
        <div className="relative">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#cfe1d3] bg-white/70 px-3 py-1.5 text-xs font-semibold tracking-wide text-[#2b704e] dark:border-white/10 dark:bg-white/5 dark:text-[#a6d5b4]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#3d9b69]"/> RETAIL OPERATIONS WORKSPACE
          </div>
          <h1 className="max-w-2xl text-[clamp(3.2rem,6vw,5.7rem)] font-semibold leading-[.98] tracking-[-.065em]">
            Retail, without the <span className="text-[#2d8058] dark:text-[#8fcca5]">friction.</span>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-8 text-[#65746a] dark:text-[#aab8ad]">
            One connected workspace for checkout, GST billing, product catalogue, inventory control and store performance. Built for the daily rhythm of a retail counter.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-12 rounded-xl bg-[#1f5c43] px-6 text-white hover:bg-[#174934]"><Link href="/signup">Create store account <ArrowRight className="ml-2 h-4 w-4"/></Link></Button>
            <Button asChild variant="outline" size="lg" className="h-12 rounded-xl border-[#ccd9ce] bg-white/60 px-6 dark:border-white/15 dark:bg-white/5"><Link href="/guide">Explore the user guide</Link></Button>
          </div>
          <div className="mt-11 flex flex-wrap gap-x-7 gap-y-3 border-t border-[#dce5dc] pt-6 text-xs text-[#718077] dark:border-white/10 dark:text-[#aab8ad]">
            <span className="inline-flex items-center gap-2"><CheckCircle2 size={15} className="text-[#3d9464]"/> MySQL-backed records</span>
            <span className="inline-flex items-center gap-2"><CheckCircle2 size={15} className="text-[#3d9464]"/> Role-based access</span>
            <span className="inline-flex items-center gap-2"><CheckCircle2 size={15} className="text-[#3d9464]"/> GST billing workflow</span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-[#cde9d5] via-transparent to-[#dfe9dd] opacity-80 blur-2xl dark:from-[#255b43]/30 dark:to-[#23402f]/20"/>
          <Card className="relative overflow-hidden rounded-[1.6rem] border-[#dce5dc] bg-white p-0 shadow-[0_32px_90px_rgba(29,55,39,.13)] dark:border-white/10 dark:bg-[#17231c]">
            <div className="flex items-center justify-between border-b border-[#e8eee8] px-5 py-4 dark:border-white/10">
              <div><p className="text-xs font-semibold text-[#809087]">STORE OVERVIEW</p><p className="mt-1 text-sm font-semibold">Monday, 04 November</p></div>
              <span className="rounded-full bg-[#e6f4e9] px-2.5 py-1 text-[10px] font-semibold text-[#2d8058] dark:bg-[#234832] dark:text-[#a6d5b4]">Demo preview</span>
            </div>
            <div className="grid grid-cols-2 gap-3 p-5">
              <div className="rounded-xl bg-[#f5f8f4] p-4 dark:bg-white/5"><span className="text-[10px] font-semibold text-[#809087]">GROSS SALES</span><p className="mt-2 text-2xl font-semibold tracking-tight">₹48,650</p><span className="text-[10px] text-[#3b9867]">+ 8.4% this week</span></div>
              <div className="rounded-xl bg-[#f5f8f4] p-4 dark:bg-white/5"><span className="text-[10px] font-semibold text-[#809087]">TRANSACTIONS</span><p className="mt-2 text-2xl font-semibold tracking-tight">126</p><span className="text-[10px] text-[#809087]">Across the period</span></div>
              <div className="rounded-xl bg-[#f5f8f4] p-4 dark:bg-white/5"><span className="text-[10px] font-semibold text-[#809087]">ACTIVE PRODUCTS</span><p className="mt-2 text-2xl font-semibold tracking-tight">248</p><span className="text-[10px] text-[#809087]">Catalogue items</span></div>
              <div className="rounded-xl bg-[#f5f8f4] p-4 dark:bg-white/5"><span className="text-[10px] font-semibold text-[#809087]">LOW STOCK</span><p className="mt-2 text-2xl font-semibold tracking-tight">08</p><span className="text-[10px] text-amber-700 dark:text-amber-300">Needs attention</span></div>
            </div>
            <div className="px-5 pb-5">
              <div className="mb-3 flex items-center justify-between"><p className="text-xs font-semibold">Weekly sales</p><span className="text-[10px] text-[#8a998e]">Illustrative preview</span></div>
              <div className="flex h-32 items-end gap-3 rounded-xl bg-[#f6f8f5] px-5 pb-4 pt-3 dark:bg-white/5">
                {[42,58,49,76,64,88,70].map((height,index)=><div key={index} className="flex flex-1 flex-col items-center gap-2"><div className={`w-full rounded-t-md ${index===5?"bg-[#287c56]":"bg-[#b8d8c1] dark:bg-[#315a42]"}`} style={{height:`${height}%`}}/><span className="text-[9px] text-[#87958b]">{["M","T","W","T","F","S","S"][index]}</span></div>)}
              </div>
            </div>
          </Card>
          <div className="absolute -bottom-5 -left-4 hidden rounded-xl border border-[#dce5dc] bg-white px-4 py-3 shadow-lg sm:flex sm:items-center sm:gap-3 dark:border-white/10 dark:bg-[#1d2d23]">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#e3f3e7] text-[#287c56] dark:bg-[#294d36] dark:text-[#b4e2bf]"><PackageCheck size={18}/></span>
            <div><p className="text-xs font-semibold">Stock movement linked</p><p className="mt-0.5 text-[10px] text-muted-foreground">Sales update inventory history</p></div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#e3e9e2] bg-white/65 py-7 dark:border-white/10 dark:bg-white/[.025]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-5 text-center sm:grid-cols-4 lg:px-8">
          {[["01","Point of sale"],["02","Product catalogue"],["03","Inventory control"],["04","Sales intelligence"]].map(([number,label])=><div key={number}><p className="text-xs font-semibold text-[#2d8058]">{number}</p><p className="mt-1 text-sm font-medium">{label}</p></div>)}
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <div className="mb-12 max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[.2em] text-[#2d8058]">The workspace</p><h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Everything connected to the counter.</h2><p className="mt-4 text-sm leading-7 text-[#6d7b72] dark:text-[#aab8ad]">Reduce repeated work between checkout, stock updates and reporting. Each module fits into one consistent retail workflow.</p></div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {features.map(({icon:Icon,title,text},index)=><Card key={title} className="group rounded-2xl border-[#e0e8df] bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-[#17231c]"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#e9f4eb] text-[#287c56] transition-colors group-hover:bg-[#287c56] group-hover:text-white dark:bg-[#244331] dark:text-[#b5e0c0]"><Icon size={20}/></span><p className="mt-6 text-[10px] font-semibold tracking-[.16em] text-[#98a69c]">0{index+1}</p><h3 className="mt-2 text-lg font-semibold">{title}</h3><p className="mt-2 text-sm leading-7 text-[#748279] dark:text-[#aab8ad]">{text}</p></Card>)}
        </div>
      </section>

      <section id="workflow" className="bg-[#eaf1e9] py-24 dark:bg-[#14231a]">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6"><div><p className="text-xs font-semibold uppercase tracking-[.2em] text-[#2d8058]">A practical flow</p><h2 className="mt-3 text-4xl font-semibold tracking-tight">From shelf to sale record.</h2></div><p className="max-w-md text-sm leading-7 text-[#718078] dark:text-[#aab8ad]">The order matters: product data drives checkout, checkout records the sale, the sale records stock movement and the invoice is tied back to that transaction.</p></div>
          <div className="grid gap-3 md:grid-cols-4">{steps.map(([number,title,text],index)=><div key={number} className="relative rounded-2xl border border-[#d4e1d4] bg-white/80 p-6 dark:border-white/10 dark:bg-white/[.035]"><span className="text-xs font-semibold text-[#2d8058]">{number}</span><h3 className="mt-5 text-base font-semibold">{title}</h3><p className="mt-2 text-sm leading-7 text-[#77857b] dark:text-[#aab8ad]">{text}</p>{index<3&&<ArrowRight className="absolute -right-3 top-1/2 z-10 hidden h-6 w-6 -translate-y-1/2 rounded-full bg-[#287c56] p-1 text-white md:block"/>}</div>)}</div>
        </div>
      </section>

      <section id="roles" className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <div className="mb-10"><p className="text-xs font-semibold uppercase tracking-[.2em] text-[#2d8058]">People & permissions</p><h2 className="mt-3 text-4xl font-semibold tracking-tight">The right access for every role.</h2></div>
        <div className="grid gap-4 md:grid-cols-3">
          {[{icon:ShieldCheck,title:"Administrator",text:"Maintain the catalogue, manage user roles, update store settings and review business performance."},{icon:Barcode,title:"Cashier",text:"Find products, build carts, complete checkout and access sales and invoices."},{icon:Users,title:"Standard user",text:"Use permitted store views and operational information assigned by the administrator."}].map(({icon:Icon,title,text})=><Card key={title} className="rounded-2xl border-[#e0e8df] p-6 dark:border-white/10 dark:bg-[#17231c]"><Icon className="h-6 w-6 text-[#2d8058]"/><h3 className="mt-5 text-lg font-semibold">{title}</h3><p className="mt-2 text-sm leading-7 text-muted-foreground">{text}</p></Card>)}
        </div>
      </section>

      <section className="mx-auto mb-20 max-w-7xl px-5 lg:px-8">
        <div className="flex flex-col justify-between gap-6 rounded-[2rem] bg-[#17372a] p-8 text-white sm:p-12 md:flex-row md:items-center">
          <div><p className="text-xs font-semibold uppercase tracking-[.2em] text-[#b8dfc3]">Bring the store together</p><h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">Spend less time reconciling. More time running your store.</h2><p className="mt-3 max-w-lg text-sm leading-7 text-white/65">Create an account or follow the guided walkthrough before using the workspace.</p></div>
          <div className="flex shrink-0 flex-wrap gap-3"><Button asChild className="h-11 rounded-xl bg-white px-5 text-[#17372a] hover:bg-[#e8f2e8]"><Link href="/signup">Create account</Link></Button><Button asChild variant="outline" className="h-11 rounded-xl border-white/25 bg-transparent text-white hover:bg-white/10"><Link href="/guide">Read user guide</Link></Button></div>
        </div>
      </section>
      <footer className="border-t border-[#dce5dc] py-8 text-center text-xs text-[#819087] dark:border-white/10"><span className="font-semibold text-[#345e45] dark:text-[#b8dfc3]">StoreDesk.</span> · Retail billing and inventory workspace · Built for everyday operations.</footer>
    </main>
  );
}
