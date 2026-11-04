import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { ShieldCheck, Users } from "lucide-react";

type Role = "admin" | "cashier" | "user";

export default function AdminUsers() {
  const { user } = useAuth();
  const query = trpc.users.list.useQuery();
  const utils = trpc.useUtils();
  const mutation = trpc.users.updateRole.useMutation({
    onSuccess: async () => { toast.success("User role updated"); await utils.users.list.invalidate(); },
    onError: error => toast.error(error.message),
  });
  const [pendingRole, setPendingRole] = useState<Record<number, Role>>({});

  if (user?.role !== "admin") return <DashboardLayout><div className="mx-auto max-w-3xl p-8"><Card className="p-8"><ShieldCheck className="h-8 w-8 text-amber-600"/><h1 className="mt-4 text-2xl font-semibold">Administrator access required</h1></Card></div></DashboardLayout>;

  const users = query.data ?? [];
  return <DashboardLayout><div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
    <div><p className="text-xs font-semibold uppercase tracking-[.18em] text-emerald-700 dark:text-emerald-300">Administration / Team</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Team & permissions</h1><p className="mt-2 text-sm text-muted-foreground">Manage the access level assigned to each account.</p></div>
    <div className="grid gap-3 sm:grid-cols-3"><Card className="p-5"><p className="text-xs text-muted-foreground">Total accounts</p><p className="mt-2 text-3xl font-semibold">{users.length}</p></Card><Card className="p-5"><p className="text-xs text-muted-foreground">Administrators</p><p className="mt-2 text-3xl font-semibold">{users.filter(u=>u.role==="admin").length}</p></Card><Card className="p-5"><p className="text-xs text-muted-foreground">Cashiers</p><p className="mt-2 text-3xl font-semibold">{users.filter(u=>u.role==="cashier").length}</p></Card></div>
    <Card className="overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between border-b p-5"><div className="flex items-center gap-3"><Users className="h-5 w-5 text-emerald-700"/><div><h2 className="font-semibold">Registered users</h2><p className="text-xs text-muted-foreground">Role changes take effect on the next API request.</p></div></div></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-sm"><thead className="bg-muted/40 text-left text-xs text-muted-foreground"><tr><th className="px-5 py-3">USER</th><th className="px-5 py-3">SIGN-IN METHOD</th><th className="px-5 py-3">JOINED</th><th className="px-5 py-3">ROLE</th><th className="px-5 py-3">ACTION</th></tr></thead><tbody>{users.map(account=><tr key={account.id} className="border-t"><td className="px-5 py-4"><p className="font-medium">{account.name || "Unnamed user"}</p><p className="mt-1 text-xs text-muted-foreground">{account.email || "No email on record"}</p></td><td className="px-5 py-4 text-muted-foreground">{account.loginMethod || "Unknown"}</td><td className="px-5 py-4 text-muted-foreground">{new Date(account.createdAt).toLocaleDateString("en-IN")}</td><td className="px-5 py-4"><span className="rounded-full bg-muted px-2.5 py-1 text-xs capitalize">{account.role}</span></td><td className="px-5 py-4"><div className="flex items-center gap-2"><select aria-label={`Role for ${account.name || account.email}`} className="h-9 rounded-lg border bg-background px-2 text-xs" value={pendingRole[account.id] ?? account.role} onChange={event=>setPendingRole(current=>({...current,[account.id]:event.target.value as Role}))} disabled={account.id===user?.id || mutation.isPending}><option value="user">User</option><option value="cashier">Cashier</option><option value="admin">Admin</option></select><Button size="sm" variant="outline" disabled={account.id===user?.id || mutation.isPending || (pendingRole[account.id] ?? account.role)===account.role} onClick={()=>mutation.mutate({userId:account.id,role:pendingRole[account.id] ?? account.role})}>Save</Button></div></td></tr>)}</tbody></table></div>
      {users.length===0 && <div className="p-12 text-center text-sm text-muted-foreground">No user accounts found.</div>}
    </Card>
  </div></DashboardLayout>;
}
