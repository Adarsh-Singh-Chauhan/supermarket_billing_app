import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

interface ProductForm {
  name: string;
  category: string;
  barcode: string;
  costPrice: number;
  sellingPrice: number;
  gstPercentage: number;
  stockQuantity: number;
  supplier: string;
  description: string;
}

const initialForm: ProductForm = {
  name: "",
  category: "",
  barcode: "",
  costPrice: 0,
  sellingPrice: 0,
  gstPercentage: 0,
  stockQuantity: 0,
  supplier: "",
  description: "",
};

export default function Products() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ProductForm>(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  const productsQuery = trpc.products.list.useQuery();
  const searchQuery_hook = trpc.products.search.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 0 }
  );
  const createProductMutation = trpc.products.create.useMutation();
  const updateProductMutation = trpc.products.update.useMutation();
  const deleteProductMutation = trpc.products.delete.useMutation();

  const displayedProducts = searchQuery ? searchQuery_hook.data || [] : productsQuery.data || [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name.includes("Price") || name === "gstPercentage" || name === "stockQuantity"
        ? parseFloat(value) || 0
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.category || form.sellingPrice <= 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingId) {
        await updateProductMutation.mutateAsync({
          id: editingId,
          ...form,
        });
        toast.success("Product updated successfully");
      } else {
        await createProductMutation.mutateAsync(form);
        toast.success("Product created successfully");
      }

      setForm(initialForm);
      setEditingId(null);
      setShowForm(false);
      productsQuery.refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to save product");
    }
  };

  const handleEdit = (product: any) => {
    setForm({
      name: product.name,
      category: product.category,
      barcode: product.barcode || "",
      costPrice: Number(product.costPrice),
      sellingPrice: Number(product.sellingPrice),
      gstPercentage: Number(product.gstPercentage),
      stockQuantity: product.stockQuantity,
      supplier: product.supplier || "",
      description: product.description || "",
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await deleteProductMutation.mutateAsync({ id });
      toast.success("Product deleted successfully");
      productsQuery.refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete product");
    }
  };

  const handleCancel = () => {
    setForm(initialForm);
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="section-title">Products</h1>
          <Button onClick={() => setShowForm(true)} className="bg-accent text-accent-foreground hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Form Section */}
        {showForm && (
          <Card className="p-6 mb-6">
            <h2 className="subsection-title">
              {editingId ? "Edit Product" : "Add New Product"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <Input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    placeholder="Enter product name"
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <Input
                    type="text"
                    name="category"
                    value={form.category}
                    onChange={handleInputChange}
                    placeholder="Enter category"
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Barcode</label>
                  <Input
                    type="text"
                    name="barcode"
                    value={form.barcode}
                    onChange={handleInputChange}
                    placeholder="Enter barcode (auto-generated if empty)"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Supplier</label>
                  <Input
                    type="text"
                    name="supplier"
                    value={form.supplier}
                    onChange={handleInputChange}
                    placeholder="Enter supplier name"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Cost Price *</label>
                  <Input
                    type="number"
                    name="costPrice"
                    value={form.costPrice}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Selling Price *</label>
                  <Input
                    type="number"
                    name="sellingPrice"
                    value={form.sellingPrice}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">GST %</label>
                  <Input
                    type="number"
                    name="gstPercentage"
                    value={form.gstPercentage}
                    onChange={handleInputChange}
                    placeholder="0"
                    step="0.01"
                    min="0"
                    max="100"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock Quantity</label>
                  <Input
                    type="number"
                    name="stockQuantity"
                    value={form.stockQuantity}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  placeholder="Enter product description"
                  className="form-textarea"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-accent text-accent-foreground hover:opacity-90">
                  {editingId ? "Update Product" : "Create Product"}
                </Button>
                <Button type="button" onClick={handleCancel} variant="outline" className="border-border">
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Search Section */}
        <Card className="p-6 mb-6">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input flex-1"
            />
            <Search className="w-5 h-5 text-muted-foreground" />
          </div>
        </Card>

        {/* Products Table */}
        <Card className="p-6 overflow-x-auto">
          <table className="invoice-table w-full">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Barcode</th>
                <th>Cost Price</th>
                <th>Selling Price</th>
                <th>GST %</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-muted-foreground">
                    No products found
                  </td>
                </tr>
              ) : (
                displayedProducts.map((product: any) => (
                  <tr key={product.id} className="table-row-hover">
                    <td className="font-medium">{product.name}</td>
                    <td>{product.category}</td>
                    <td className="text-sm text-muted-foreground">{product.barcode || "-"}</td>
                    <td>₹{Number(product.costPrice).toFixed(2)}</td>
                    <td>₹{Number(product.sellingPrice).toFixed(2)}</td>
                    <td>{Number(product.gstPercentage)}%</td>
                    <td>
                      <span
                        className={`badge ${
                          product.stockQuantity === 0
                            ? "badge-danger"
                            : product.stockQuantity <= 10
                            ? "badge-warning"
                            : "badge-success"
                        }`}
                      >
                        {product.stockQuantity}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 hover:bg-muted rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 hover:bg-destructive/10 text-destructive rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
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
