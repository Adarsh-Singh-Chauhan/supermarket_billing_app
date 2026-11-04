import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Settings, ShieldCheck } from "lucide-react";

type SettingsForm = { storeName:string; storeAddress:string; gstin:string; phoneNumber:string; email:string; lowStockThreshold:number };
const empty:SettingsForm = {storeName:"",storeAddress:"",gstin:"",phoneNumber:"",email:"",lowStockThreshold:10};

export default function AdminSettings() {
  const { user } = useAuth();
  const query=trpc.settings.get.useQuery();
  const mutation=trpc.settings.update.useMutation({onSuccess:async()=>{toast.success("Store settings saved");await query.refetch();},onError:e=>toast.error(e.message)});
  const [form,setForm]=useState<SettingsForm>(empty);
  useEffect(()=>{if(query.data)setForm({storeName:query.data.storeName||"",storeAddress:query.data.storeAddress||"",gstin:query.data.gstin||"",phoneNumber:query.data.phoneNumber||"",email:query.data.email||"",lowStockThreshold:query.data.lowStockThreshold||10});},[query.data]);
  const set=(key:keyof SettingsForm,value:string)=>setForm(current=>({...current,[key]:key==="lowStockThreshold"?Math.max(1,Number(value)||1):value}));
  if(user?.role!=="admin")return <DashboardLayout><div className="mx-auto max-w-3xl p-8"><Card className="p-8"><ShieldCheck className="h-8 w-8 text-amber-600"/><h1 className="mt-4 text-2xl font-semibold">Administrator access required</h1></Card></div></DashboardLayout>;
  return <DashboardLayout><div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6 lg:p-8"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-emerald-700 dark:text-emerald-300">Administration / Configuration</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Store settings</h1><p className="mt-2 text-sm text-muted-foreground">Keep the store identity and inventory alert threshold up to date.</p></div>
    <Card className="rounded-2xl p-6"><div className="mb-6 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"><Settings size={18}/></span><div><h2 className="font-semibold">Business profile</h2><p className="text-xs text-muted-foreground">Used in the invoice header and store workspace.</p></div></div>
      <form className="grid gap-5 sm:grid-cols-2" onSubmit={event=>{event.preventDefault();mutation.mutate(form);}}>
        <label className="space-y-2 text-sm font-medium">Store name<Input value={form.storeName} onChange={e=>set("storeName",e.target.value)} required maxLength={255}/></label>
        <label className="space-y-2 text-sm font-medium">GSTIN<Input value={form.gstin} onChange={e=>set("gstin",e.target.value.toUpperCase())} maxLength={20}/></label>
        <label className="space-y-2 text-sm font-medium">Phone number<Input value={form.phoneNumber} onChange={e=>set("phoneNumber",e.target.value)} maxLength={20}/></label>
        <label className="space-y-2 text-sm font-medium">Contact email<Input type="email" value={form.email} onChange={e=>set("email",e.target.value)} maxLength={320}/></label>
        <label className="space-y-2 text-sm font-medium sm:col-span-2">Store address<textarea className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.storeAddress} onChange={e=>set("storeAddress",e.target.value)}/></label>
        <label className="space-y-2 text-sm font-medium">Low-stock threshold<Input type="number" min={1} max={100000} value={form.lowStockThreshold} onChange={e=>set("lowStockThreshold",e.target.value)}/><span className="block text-xs font-normal text-muted-foreground">Products at or below this quantity are flagged for review.</span></label>
        <div className="flex items-end justify-end sm:col-span-2"><Button type="submit" disabled={mutation.isPending}>{mutation.isPending?"Saving…":"Save store settings"}</Button></div>
      </form>
    </Card>
  </div></DashboardLayout>;
}
