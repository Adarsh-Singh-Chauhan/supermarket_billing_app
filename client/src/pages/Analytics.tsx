import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Calendar } from "lucide-react";
import { toast } from "sonner";

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

export default function Analytics() {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

  const overviewQuery = trpc.analytics.getSalesOverview.useQuery({
    startDate: new Date(startDate),
    endDate: new Date(endDate),
  });

  const dailyDataQuery = trpc.analytics.getDailySalesData.useQuery({
    startDate: new Date(startDate),
    endDate: new Date(endDate),
  });

  const topProductsQuery = trpc.analytics.getTopSellingProducts.useQuery({
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    limit: 5,
  });

  const categoryWiseQuery = trpc.analytics.getCategoryWiseSales.useQuery({
    startDate: new Date(startDate),
    endDate: new Date(endDate),
  });

  const profitLossQuery = trpc.analytics.getProfitLossAnalysis.useQuery({
    startDate: new Date(startDate),
    endDate: new Date(endDate),
  });

  const overview = overviewQuery.data;
  const dailyData = dailyDataQuery.data || [];
  const topProducts = topProductsQuery.data || [];
  const categoryWise = categoryWiseQuery.data || [];
  const profitLoss = profitLossQuery.data;

  const handleGenerateForecast = async () => {
    toast.info("Forecast generation requires selecting a product");
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="section-title">Sales Analytics</h1>
        </div>

        {/* Date Range Filter */}
        <Card className="p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="form-label">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="form-input"
              />
            </div>
            <Button className="bg-accent text-accent-foreground hover:opacity-90">
              <Calendar className="w-4 h-4 mr-2" />
              Apply
            </Button>
          </div>
        </Card>

        {/* Summary Cards */}
        {overview && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card className="p-6">
              <div className="text-sm text-muted-foreground mb-2">Total Revenue</div>
              <div className="text-2xl font-bold text-accent">
                ₹{overview.totalRevenue.toFixed(2)}
              </div>
            </Card>
            <Card className="p-6">
              <div className="text-sm text-muted-foreground mb-2">Total Tax</div>
              <div className="text-2xl font-bold text-accent">
                ₹{overview.totalTax.toFixed(2)}
              </div>
            </Card>
            <Card className="p-6">
              <div className="text-sm text-muted-foreground mb-2">Discount Given</div>
              <div className="text-2xl font-bold text-accent">
                ₹{overview.totalDiscount.toFixed(2)}
              </div>
            </Card>
            <Card className="p-6">
              <div className="text-sm text-muted-foreground mb-2">Transactions</div>
              <div className="text-2xl font-bold text-accent">{overview.totalTransactions}</div>
            </Card>
            <Card className="p-6">
              <div className="text-sm text-muted-foreground mb-2">Avg Transaction</div>
              <div className="text-2xl font-bold text-accent">
                ₹{overview.averageTransactionValue.toFixed(2)}
              </div>
            </Card>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Daily Sales Chart */}
          <Card className="p-6">
            <h3 className="subsection-title mb-4">Daily Sales Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="Revenue" />
                <Line type="monotone" dataKey="tax" stroke="#ef4444" name="Tax" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Category Wise Sales */}
          <Card className="p-6">
            <h3 className="subsection-title mb-4">Sales by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryWise}
                  dataKey="revenue"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {categoryWise.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Top Products & Profit/Loss */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Top Products */}
          <Card className="p-6">
            <h3 className="subsection-title mb-4">Top Selling Products</h3>
            <div className="space-y-3">
              {topProducts.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">No data available</div>
              ) : (
                topProducts.map((product: any, index: number) => (
                  <div key={product.productId} className="flex items-center justify-between border-b border-border pb-2">
                    <div>
                      <div className="font-medium">{index + 1}. {product.productName}</div>
                      <div className="text-sm text-muted-foreground">
                        {product.quantity} units sold
                      </div>
                    </div>
                    <div className="font-bold text-accent">₹{product.revenue.toFixed(2)}</div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Profit & Loss */}
          {profitLoss && (
            <Card className="p-6">
              <h3 className="subsection-title mb-4">Profit & Loss Analysis</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="text-muted-foreground">Total Revenue</span>
                  <span className="font-bold">₹{profitLoss.totalRevenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="text-muted-foreground">Total Cost</span>
                  <span className="font-bold">₹{profitLoss.totalCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="text-muted-foreground">Profit Margin</span>
                  <span className="font-bold text-green-600">{profitLoss.profitMargin.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center pt-2 bg-accent/10 px-4 py-3 rounded-lg">
                  <span className="font-semibold">Net Profit</span>
                  <span className={`text-2xl font-bold ${profitLoss.profit >= 0 ? "text-green-600" : "text-destructive"}`}>
                    ₹{profitLoss.profit.toFixed(2)}
                  </span>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Category Details Table */}
        <Card className="p-6">
          <h3 className="subsection-title mb-4">Category-wise Breakdown</h3>
          <table className="invoice-table w-full">
            <thead>
              <tr>
                <th>Category</th>
                <th>Revenue</th>
                <th>Quantity Sold</th>
                <th>Avg Price</th>
              </tr>
            </thead>
            <tbody>
              {categoryWise.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-muted-foreground">
                    No data available
                  </td>
                </tr>
              ) : (
                categoryWise.map((category: any) => (
                  <tr key={category.category} className="table-row-hover">
                    <td className="font-medium">{category.category}</td>
                    <td>₹{category.revenue.toFixed(2)}</td>
                    <td>{category.quantity}</td>
                    <td>₹{(category.revenue / category.quantity).toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </DashboardLayout>
  );
}
