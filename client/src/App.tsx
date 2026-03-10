import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import POS from "./pages/POS";
import Products from "./pages/Products";
import Inventory from "./pages/Inventory";
import Sales from "./pages/Sales";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/pos"} component={POS} />
      <Route path={"/products"} component={Products} />
      <Route path={"/dashboard"} component={Home} />
      <Route path={"/inventory"} component={Inventory} />
      <Route path={"/sales"} component={Sales} />
      <Route path={"/analytics"} component={Analytics} />
      <Route path={"/reports"} component={Reports} />
      <Route path={"/admin"} component={Home} />
      <Route path={"/admin/users"} component={Home} />
      <Route path={"/admin/settings"} component={Home} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
