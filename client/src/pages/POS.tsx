import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Trash2, Plus, Minus, Search, ShoppingCart, X } from "lucide-react";
import { toast } from "sonner";

interface CartItem {
  productId: number;
  name: string;
  quantity: number;
  unitPrice: number;
  gstPercentage: number;
  total: number;
}

export default function POS() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentMode, setPaymentMode] = useState<"cash" | "card" | "upi" | "cheque">("cash");
  const [discountAmount, setDiscountAmount] = useState(0);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  const productsQuery = trpc.products.list.useQuery();
  const searchProductsQuery = trpc.products.search.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 0, staleTime: 0 }
  );
  const createSaleMutation = trpc.sales.create.useMutation();

  const displayedProducts = searchQuery ? searchProductsQuery.data || [] : productsQuery.data || [];

  // Handle barcode scan
  // Handle barcode scan with proper async query
  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    try {
      // Use the query utils to fetch directly
      const utils = trpc.useUtils();
      const product = await utils.products.getByBarcode.fetch({ barcode: barcodeInput });
      addToCart(product);
      setBarcodeInput("");
      barcodeInputRef.current?.focus();
    } catch (error) {
      toast.error("Product not found");
      setBarcodeInput("");
    }
  };

  // Add product to cart
  const addToCart = (product: any) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.productId === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                total: (item.quantity + 1) * item.unitPrice * (1 + item.gstPercentage / 100),
              }
            : item
        );
      }
      return [
        ...prevCart,
        {
          productId: product.id,
          name: product.name,
          quantity: 1,
          unitPrice: Number(product.sellingPrice),
          gstPercentage: Number(product.gstPercentage),
          total: Number(product.sellingPrice) * (1 + Number(product.gstPercentage) / 100),
        },
      ];
    });
    toast.success(`${product.name} added to cart`);
  };

  // Update quantity
  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity,
              total: quantity * item.unitPrice * (1 + item.gstPercentage / 100),
            }
          : item
      )
    );
  };

  // Remove from cart
  const removeFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.productId !== productId));
  };

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const totalTax = cart.reduce(
    (sum, item) => sum + (item.quantity * item.unitPrice * item.gstPercentage) / 100,
    0
  );
  const cgst = totalTax / 2;
  const sgst = totalTax / 2;
  const total = subtotal + totalTax - discountAmount;

  // Handle checkout
  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    try {
      const saleItems = cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      const result = await createSaleMutation.mutateAsync({
        items: saleItems,
        discountAmount,
        paymentMode,
      });

      toast.success(`Sale completed! Invoice: ${result.invoiceNumber}`);
      setCart([]);
      setDiscountAmount(0);
      setPaymentMode("cash");
    } catch (error: any) {
      toast.error(error.message || "Failed to complete sale");
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="section-title">Point of Sale</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Barcode Scanner */}
            <Card className="p-6">
              <h2 className="subsection-title">Barcode Scanner</h2>
              <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
                <Input
                  ref={barcodeInputRef}
                  type="text"
                  placeholder="Scan barcode..."
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  className="form-input"
                  autoFocus
                />
                <Button type="submit" className="bg-accent text-accent-foreground hover:opacity-90">
                  Scan
                </Button>
              </form>
            </Card>

            {/* Product Search */}
            <Card className="p-6">
              <h2 className="subsection-title">Search Products</h2>
              <div className="flex gap-2 mb-4">
                <Input
                  type="text"
                  placeholder="Search by product name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input"
                />
                <Search className="w-5 h-5 text-muted-foreground" />
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {displayedProducts.map((product: any) => (
                  <div
                    key={product.id}
                    className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => addToCart(product)}
                  >
                    <div className="text-sm font-medium truncate">{product.name}</div>
                    <div className="text-xs text-muted-foreground mb-2">{product.category}</div>
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-accent">
                        ₹{Number(product.sellingPrice).toFixed(2)}
                      </div>
                      <div className="text-xs bg-muted px-2 py-1 rounded">
                        {product.stockQuantity} in stock
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Cart Section */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingCart className="w-5 h-5" />
                <h2 className="text-lg font-bold">Cart ({cart.length})</h2>
              </div>

              {/* Cart Items */}
              <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <p>Cart is empty</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.productId} className="border border-border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-sm font-medium truncate">{item.name}</div>
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="text-destructive hover:bg-destructive/10 p-1 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="p-1 hover:bg-muted rounded"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(item.productId, parseInt(e.target.value) || 1)
                          }
                          className="w-12 text-center border border-border rounded px-2 py-1 text-sm"
                        />
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="p-1 hover:bg-muted rounded"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ₹{item.total.toFixed(2)}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Totals */}
              <div className="border-t border-border pt-4 space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>CGST (50%):</span>
                  <span>₹{cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>SGST (50%):</span>
                  <span>₹{sgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Discount:</span>
                  <input
                    type="number"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Math.max(0, Number(e.target.value)))}
                    className="w-20 border border-border rounded px-2 py-1 text-right text-sm"
                  />
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                  <span>Total:</span>
                  <span className="text-accent">₹{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Mode */}
              <div className="mb-4">
                <label className="form-label">Payment Mode</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as any)}
                  className="form-select"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              {/* Checkout Button */}
              <Button
                onClick={handleCheckout}
                disabled={cart.length === 0 || createSaleMutation.isPending}
                className="w-full bg-green-600 text-white hover:opacity-90 disabled:opacity-50"
              >
                {createSaleMutation.isPending ? "Processing..." : "Checkout"}
              </Button>

              {/* Clear Cart */}
              <Button
                onClick={() => setCart([])}
                variant="outline"
                className="w-full mt-2 border-border"
              >
                Clear Cart
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
