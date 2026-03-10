import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { AlertTriangle, Edit2 } from "lucide-react";
import { toast } from "sonner";

export default function Inventory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newStock, setNewStock] = useState(0);

  const productsQuery = trpc.products.list.useQuery();
  const updateStockMutation = trpc.inventory.updateStock.useMutation();

  const allProducts = productsQuery.data || [];
  const lowStockProducts = allProducts.filter((p: any) => p.stockQuantity <= 10);

  const filteredProducts = searchQuery
    ? allProducts.filter(
        (p: any) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allProducts;

  const handleUpdateStock = async (productId: number) => {
    try {
      await updateStockMutation.mutateAsync({
        productId,
        quantity: newStock,
        reason: "adjustment",
      });
      toast.success("Stock updated successfully");
      setEditingId(null);
      setNewStock(0);
      productsQuery.refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to update stock");
    }
  };

  const getTotalStockValue = () => {
    return allProducts.reduce((sum: number, product: any) => {
      return sum + (Number(product.sellingPrice) * product.stockQuantity);
    }, 0);
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: "Out of Stock", color: "text-destructive", bg: "bg-destructive/10" };
    if (quantity <= 10) return { label: "Low Stock", color: "text-yellow-600", bg: "bg-yellow-600/10" };
    return { label: "In Stock", color: "text-green-600", bg: "bg-green-600/10" };
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="section-title">Inventory Management</h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-6">
            <div className="text-sm text-muted-foreground mb-2">Total Products</div>
            <div className="text-3xl font-bold text-accent">{allProducts.length}</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-muted-foreground mb-2">Total Stock Value</div>
            <div className="text-3xl font-bold text-accent">₹{getTotalStockValue().toFixed(2)}</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-muted-foreground mb-2">Low Stock Items</div>
            <div className="text-3xl font-bold text-yellow-600">{lowStockProducts.length}</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-muted-foreground mb-2">Out of Stock</div>
            <div className="text-3xl font-bold text-destructive">
              {allProducts.filter((p: any) => p.stockQuantity === 0).length}
            </div>
          </Card>
        </div>

        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <Card className="p-6 mb-6 border-yellow-600/20 bg-yellow-600/5">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-yellow-600 mb-2">Low Stock Alert</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {lowStockProducts.length} product(s) have low stock levels. Consider reordering.
                </p>
                <div className="space-y-1">
                  {(lowStockProducts as any[]).slice(0, 5).map((product: any) => (
                    <div key={product.id} className="text-sm">
                      <span className="font-medium">{product.name}</span>
                      <span className="text-muted-foreground"> - {product.stockQuantity} units</span>
                    </div>
                  ))}
                  {lowStockProducts.length > 5 && (
                    <div className="text-sm text-muted-foreground">
                      +{lowStockProducts.length - 5} more...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Search */}
        <Card className="p-6 mb-6">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input flex-1"
            />
          </div>
        </Card>

        {/* Inventory Table */}
        <Card className="p-6 overflow-x-auto">
          <table className="invoice-table w-full">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Unit Price</th>
                <th>Current Stock</th>
                <th>Stock Value</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(filteredProducts as any[]).length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground">
                    No products found
                  </td>
                </tr>
              ) : (
                (filteredProducts as any[]).map((product: any) => {
                  const status = getStockStatus(product.stockQuantity);
                  const stockValue = Number(product.sellingPrice) * product.stockQuantity;

                  return (
                    <tr key={product.id} className="table-row-hover">
                      <td className="font-medium">{product.name}</td>
                      <td>{product.category}</td>
                      <td>₹{Number(product.sellingPrice).toFixed(2)}</td>
                      <td>
                        {editingId === product.id ? (
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              value={newStock}
                              onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
                              className="form-input w-24"
                              min="0"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStock(product.id)}
                              className="bg-green-600 text-white hover:opacity-90"
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingId(null);
                                setNewStock(0);
                              }}
                              className="border-border"
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <span>{product.stockQuantity}</span>
                        )}
                      </td>
                      <td>₹{stockValue.toFixed(2)}</td>
                      <td>
                        <span className={`badge ${status.bg} ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td>
                        {editingId !== product.id && (
                          <button
                            onClick={() => {
                              setEditingId(product.id);
                              setNewStock(product.stockQuantity);
                            }}
                            className="p-2 hover:bg-muted rounded transition-colors"
                            title="Update stock"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </DashboardLayout>
  );
}
