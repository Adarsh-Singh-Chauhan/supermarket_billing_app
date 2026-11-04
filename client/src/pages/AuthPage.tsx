import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { isOAuthConfigured, getLoginUrl } from "@/const";

type AuthMode = "login" | "signup";
type AuthStatus = {
  databaseConfigured: boolean;
  sessionSecretConfigured: boolean;
  emailPasswordAuthAvailable: boolean;
  demoMode: boolean;
};

export default function AuthPage({ mode }: { mode: AuthMode }) {
  const [, navigate] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<AuthStatus | null>(null);
  const isSignup = mode === "signup";

  useEffect(() => {
    let active = true;
    fetch("/api/auth/status")
      .then(response => response.json())
      .then((data: AuthStatus) => { if (active) setStatus(data); })
      .catch(() => {
        if (active) setStatus({
          databaseConfigured: false,
          sessionSecretConfigured: false,
          emailPasswordAuthAvailable: false,
          demoMode: false,
        });
      });
    return () => { active = false; };
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (isSignup && password.length < 12) {
      setError("Use at least 12 characters for your password.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(isSignup ? "/api/auth/register" : "/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(isSignup ? { name, email, password } : { email, password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to authenticate. Please try again.");
      navigate("/dashboard");
      window.location.assign("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to authenticate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const ready = status?.emailPasswordAuthAvailable === true;
  return (
    <main className="min-h-screen bg-[#f6f7f4] text-[#1d2b26] dark:bg-[#101815] dark:text-[#eef4ef]">
      <div className="mx-auto grid min-h-screen max-w-[1440px] lg:grid-cols-[1.05fr_.95fr]">
        <section className="relative hidden overflow-hidden bg-[#142d25] p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
          <div className="pointer-events-none absolute -right-48 -top-40 h-[600px] w-[600px] rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-24 -top-16 h-[450px] w-[450px] rounded-full border border-white/10" />
          <Link href="/" className="relative inline-flex w-fit items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#b9e4c6] text-[#17352a]"><Store size={22}/></span>
            <span className="text-lg font-semibold tracking-tight">StoreDesk<span className="text-[#b9e4c6]">.</span></span>
          </Link>
          <div className="relative max-w-xl">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[.22em] text-[#b9e4c6]">Retail operations, in rhythm</p>
            <h1 className="text-5xl font-semibold leading-[1.08] tracking-[-.045em] xl:text-6xl">A clearer view of your store.</h1>
            <p className="mt-6 max-w-lg text-base leading-8 text-white/70">Billing, products, inventory and sales insight in one dependable workspace—built around the way retail teams work.</p>
            <div className="mt-12 grid grid-cols-3 gap-4 border-t border-white/15 pt-6">
              <div><b className="text-2xl font-semibold">01</b><p className="mt-1 text-xs text-white/60">Checkout</p></div>
              <div><b className="text-2xl font-semibold">02</b><p className="mt-1 text-xs text-white/60">Stock control</p></div>
              <div><b className="text-2xl font-semibold">03</b><p className="mt-1 text-xs text-white/60">Business insight</p></div>
            </div>
          </div>
          <p className="relative text-xs text-white/45">StoreDesk · Retail workspace</p>
        </section>

        <section className="flex items-center justify-center px-5 py-10 sm:px-10">
          <div className="w-full max-w-md">
            <Link href="/" className="mb-10 inline-flex items-center gap-2 text-sm font-semibold lg:hidden">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#d9eee0] text-[#214535]"><Store size={19}/></span>
              StoreDesk<span className="text-emerald-700">.</span>
            </Link>
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[.18em] text-emerald-700 dark:text-emerald-300">{isSignup ? "Create your workspace account" : "Welcome back"}</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">{isSignup ? "Create an account" : "Sign in to StoreDesk"}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{isSignup ? "Start with your store team workspace. An administrator can assign cashier or admin access." : "Use your store account to continue to the dashboard."}</p>
            </div>

            {!ready && (
              <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
                <b>Account setup pending.</b>
                <p className="mt-1">Email sign-in requires a connected MySQL database and a session secret. Configure <code>DATABASE_URL</code> and <code>JWT_SECRET</code> in the server environment, then apply the database migration.</p>
              </div>
            )}

            <Card className="rounded-2xl border-border/70 p-6 shadow-sm sm:p-8">
              <form onSubmit={submit} className="space-y-5">
                {isSignup && <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Full name</label>
                  <Input id="name" autoComplete="name" value={name} onChange={event => setName(event.target.value)} placeholder="Enter your name" required minLength={2} maxLength={80} />
                </div>}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email address</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                    <Input id="email" className="pl-10" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@company.com" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">Password</label>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                    <Input id="password" className="pl-10 pr-10" type={showPassword ? "text" : "password"} autoComplete={isSignup ? "new-password" : "current-password"} value={password} onChange={event => setPassword(event.target.value)} placeholder={isSignup ? "At least 12 characters" : "Enter your password"} required minLength={isSignup ? 12 : 1} maxLength={128} />
                    <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(value => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
                  </div>
                  {isSignup && <p className="text-xs text-muted-foreground">Use 12–128 characters. This demo does not send an email verification link.</p>}
                </div>
                {error && <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</div>}
                <Button type="submit" disabled={!ready || loading} className="h-11 w-full rounded-xl bg-[#1e5b43] text-white hover:bg-[#174a36]">
                  {loading ? "Please wait…" : isSignup ? "Create account" : "Sign in"}
                  {!loading && <ArrowRight className="ml-2 h-4 w-4"/>}
                </Button>
              </form>
              {isOAuthConfigured() && <div className="mt-5 border-t pt-5">
                <Button variant="outline" className="w-full" onClick={() => { window.location.href = getLoginUrl(); }}>Continue with Manus sign-in</Button>
              </div>}
            </Card>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {isSignup ? "Already have an account?" : "New to StoreDesk?"}{" "}
              <Link href={isSignup ? "/login" : "/signup"} className="font-semibold text-emerald-800 hover:underline dark:text-emerald-300">{isSignup ? "Sign in" : "Create an account"}</Link>
            </p>
            <p className="mt-8 text-center text-xs text-muted-foreground"><Link href="/" className="hover:underline">← Back to StoreDesk home</Link></p>
          </div>
        </section>
      </div>
    </main>
  );
}
