import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Download, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export default function Reports() {
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [forecastDays, setForecastDays] = useState(30);

  const productsQuery = trpc.products.list.useQuery();
  const inventoryInsightsQuery = trpc.analytics.getInventoryInsights.useQuery();
  const forecastsQuery = trpc.analytics.getLatestForecasts.useQuery({ limit: 10 });
  const generateForecastMutation = trpc.analytics.generateDemandForecast.useMutation();

  const products = productsQuery.data || [];
  const inventoryInsights = inventoryInsightsQuery.data;
  const forecasts = forecastsQuery.data || [];

  const handleGenerateForecast = async () => {
    if (!selectedProductId) {
      toast.error("Please select a product");
      return;
    }

    try {
      const result = await generateForecastMutation.mutateAsync({
        productId: selectedProductId,
        forecastDays,
      });
      toast.success("Forecast generated successfully");
      forecastsQuery.refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to generate forecast");
    }
  };

  const handleDownloadReport = (reportType: string) => {
    toast.success(`${reportType} report ready for download`);
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="section-title">Smart Reports & Forecasting</h1>
        </div>

        {/* Inventory Insights */}
        {inventoryInsights && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-6">
              <div className="text-sm text-muted-foreground mb-2">Total Products</div>
              <div className="text-3xl font-bold text-accent">{inventoryInsights.totalProducts}</div>
            </Card>
            <Card className="p-6">
              <div className="text-sm text-muted-foreground mb-2">Stock Value</div>
              <div className="text-3xl font-bold text-accent">
                ₹{inventoryInsights.totalStockValue.toFixed(2)}
              </div>
            </Card>
            <Card className="p-6">
              <div className="text-sm text-muted-foreground mb-2">Low Stock Items</div>
              <div className="text-3xl font-bold text-yellow-600">{inventoryInsights.lowStockProducts}</div>
            </Card>
            <Card className="p-6">
              <div className="text-sm text-muted-foreground mb-2">Out of Stock</div>
              <div className="text-3xl font-bold text-destructive">{inventoryInsights.outOfStockProducts}</div>
            </Card>
          </div>
        )}

        {/* Demand Forecasting */}
        <Card className="p-6 mb-6">
          <h2 className="subsection-title mb-4">AI-Powered Demand Forecasting</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label">Select Product</label>
                <select
                  value={selectedProductId || ""}
                  onChange={(e) => setSelectedProductId(parseInt(e.target.value) || null)}
                  className="form-select"
                >
                  <option value="">Choose a product...</option>
                  {products.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Forecast Days</label>
                <Input
                  type="number"
                  value={forecastDays}
                  onChange={(e) => setForecastDays(parseInt(e.target.value) || 30)}
                  min="7"
                  max="90"
                  className="form-input"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleGenerateForecast}
                  disabled={!selectedProductId || generateForecastMutation.isPending}
                  className="w-full bg-accent text-accent-foreground hover:opacity-90"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  {generateForecastMutation.isPending ? "Generating..." : "Generate Forecast"}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Latest Forecasts */}
        <Card className="p-6 mb-6">
          <h2 className="subsection-title mb-4">Latest Forecasts</h2>
          <div className="overflow-x-auto">
            <table className="invoice-table w-full">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Predicted Demand</th>
                  <th>Confidence</th>
                  <th>Recommended Stock</th>
                  <th>Current Stock</th>
                  <th>Forecast Type</th>
                </tr>
              </thead>
              <tbody>
                {forecasts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      No forecasts available yet
                    </td>
                  </tr>
                ) : (
                  forecasts.map((forecast: any) => (
                    <tr key={forecast.id} className="table-row-hover">
                      <td className="font-medium">{forecast.productName}</td>
                      <td>{forecast.predictedDemand} units</td>
                      <td>
                        <span className={`badge ${forecast.confidence >= 75 ? "badge-success" : forecast.confidence >= 50 ? "badge-warning" : "badge-danger"}`}>
                          {forecast.confidence}%
                        </span>
                      </td>
                      <td>{forecast.recommendedStock} units</td>
                      <td>{forecast.currentStock} units</td>
                      <td className="capitalize">{forecast.forecastType}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Report Downloads */}
        <Card className="p-6">
          <h2 className="subsection-title mb-4">Generate Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => handleDownloadReport("Sales Analytics")}
              variant="outline"
              className="border-border flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Sales Analytics Report
            </Button>
            <Button
              onClick={() => handleDownloadReport("Inventory")}
              variant="outline"
              className="border-border flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Inventory Report
            </Button>
            <Button
              onClick={() => handleDownloadReport("Profit & Loss")}
              variant="outline"
              className="border-border flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Profit & Loss Report
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
