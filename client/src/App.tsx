import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import UserGuide from "./pages/UserGuide";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminSettings from "./pages/AdminSettings";
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
      <Route path={"/"} component={LandingPage} />
      <Route path={"/login"}>{() => <AuthPage mode="login" />}</Route>
      <Route path={"/signup"}>{() => <AuthPage mode="signup" />}</Route>
      <Route path={"/guide"} component={UserGuide} />
      <Route path={"/dashboard"} component={Home} />
      <Route path={"/pos"} component={POS} />
      <Route path={"/products"} component={Products} />
      <Route path={"/inventory"} component={Inventory} />
      <Route path={"/sales"} component={Sales} />
      <Route path={"/analytics"} component={Analytics} />
      <Route path={"/reports"} component={Reports} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/admin/users"} component={AdminUsers} />
      <Route path={"/admin/settings"} component={AdminSettings} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
