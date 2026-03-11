import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ShoppingCart, Package, BarChart3, FileText, Settings, LogOut } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold text-foreground mb-4">POS System</h1>
          <p className="text-muted-foreground mb-8">
            Supermarket Billing & Inventory Management
          </p>
          <Button
            onClick={() => window.location.href = getLoginUrl()}
            className="w-full"
            size="lg"
          >
            Login to Continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">POS System</h1>
            <p className="text-sm text-muted-foreground">Welcome, {user?.name || user?.email}</p>
          </div>
          <Button
            variant="outline"
            onClick={logout}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* POS Card */}
          <div
            onClick={() => navigate("/pos")}
            className="bg-card border border-border rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Point of Sale</h2>
              <ShoppingCart className="w-8 h-8 text-primary" />
            </div>
            <p className="text-muted-foreground mb-4">
              Process sales, scan barcodes, and generate invoices
            </p>
            <Button variant="default" className="w-full">
              Open POS
            </Button>
          </div>

          {/* Products Card */}
          <div
            onClick={() => navigate("/products")}
            className="bg-card border border-border rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Products</h2>
              <Package className="w-8 h-8 text-primary" />
            </div>
            <p className="text-muted-foreground mb-4">
              Manage product catalog, pricing, and barcodes
            </p>
            <Button variant="default" className="w-full">
              Manage Products
            </Button>
          </div>

          {/* Inventory Card */}
          <div
            onClick={() => navigate("/inventory")}
            className="bg-card border border-border rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Inventory</h2>
              <Package className="w-8 h-8 text-primary" />
            </div>
            <p className="text-muted-foreground mb-4">
              Track stock levels and low-stock alerts
            </p>
            <Button variant="default" className="w-full">
              View Inventory
            </Button>
          </div>

          {/* Analytics Card */}
          <div
            onClick={() => navigate("/analytics")}
            className="bg-card border border-border rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Analytics</h2>
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
            <p className="text-muted-foreground mb-4">
              View sales trends and revenue analytics
            </p>
            <Button variant="default" className="w-full">
              View Analytics
            </Button>
          </div>

          {/* Reports Card */}
          <div
            onClick={() => navigate("/reports")}
            className="bg-card border border-border rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Reports</h2>
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <p className="text-muted-foreground mb-4">
              AI-powered demand forecasting and smart reports
            </p>
            <Button variant="default" className="w-full">
              View Reports
            </Button>
          </div>

          {/* Settings Card */}
          <div
            onClick={() => navigate("/admin/settings")}
            className="bg-card border border-border rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Settings</h2>
              <Settings className="w-8 h-8 text-primary" />
            </div>
            <p className="text-muted-foreground mb-4">
              Configure store settings and system preferences
            </p>
            <Button variant="default" className="w-full">
              Open Settings
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Products</p>
            <p className="text-2xl font-bold text-foreground">10</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Today's Sales</p>
            <p className="text-2xl font-bold text-foreground">₹0</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Inventory Value</p>
            <p className="text-2xl font-bold text-foreground">₹0</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Low Stock Items</p>
            <p className="text-2xl font-bold text-foreground">0</p>
          </div>
        </div>
      </main>
    </div>
  );
}
