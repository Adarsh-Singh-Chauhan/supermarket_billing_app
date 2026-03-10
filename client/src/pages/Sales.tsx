import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Eye, Download } from "lucide-react";
import { toast } from "sonner";

export default function Sales() {
  const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null);

  const salesQuery = trpc.sales.list.useQuery();
  const invoiceQuery = trpc.invoices.getById.useQuery(
    { id: selectedSaleId || 0 },
    { enabled: !!selectedSaleId }
  );

  const sales = salesQuery.data || [];

  const handleDownloadInvoice = (invoiceNumber: string) => {
    toast.success(`Invoice ${invoiceNumber} ready for download`);
    // In a real app, this would trigger a PDF download
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="section-title">Sales Transactions</h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-6">
            <div className="text-sm text-muted-foreground mb-2">Total Sales</div>
            <div className="text-3xl font-bold text-accent">{sales.length}</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-muted-foreground mb-2">Total Revenue</div>
            <div className="text-3xl font-bold text-accent">
              ₹{sales.reduce((sum: number, s: any) => sum + Number(s.totalAmount), 0).toFixed(2)}
            </div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-muted-foreground mb-2">Total Tax Collected</div>
            <div className="text-3xl font-bold text-accent">
              ₹{sales.reduce((sum: number, s: any) => sum + Number(s.taxAmount), 0).toFixed(2)}
            </div>
          </Card>
        </div>

        {/* Sales Table */}
        <Card className="p-6 overflow-x-auto">
          <table className="invoice-table w-full">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Date & Time</th>
                <th>Payment Mode</th>
                <th>Items</th>
                <th>Subtotal</th>
                <th>Tax</th>
                <th>Discount</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-muted-foreground">
                    No sales found
                  </td>
                </tr>
              ) : (
                sales.map((sale: any) => (
                  <tr key={sale.id} className="table-row-hover">
                    <td className="font-medium">{sale.invoiceNumber}</td>
                    <td className="text-sm">{formatDate(sale.createdAt)}</td>
                    <td>
                      <span className="badge badge-primary">
                        {sale.paymentMode.toUpperCase()}
                      </span>
                    </td>
                    <td>{sale.itemCount || 0}</td>
                    <td>₹{(Number(sale.totalAmount) - Number(sale.taxAmount)).toFixed(2)}</td>
                    <td>₹{Number(sale.taxAmount).toFixed(2)}</td>
                    <td>₹{Number(sale.discountAmount).toFixed(2)}</td>
                    <td className="font-bold text-accent">₹{Number(sale.totalAmount).toFixed(2)}</td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedSaleId(sale.id)}
                          className="p-2 hover:bg-muted rounded transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadInvoice(sale.invoiceNumber)}
                          className="p-2 hover:bg-muted rounded transition-colors"
                          title="Download invoice"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>

        {/* Sale Details Modal */}
        {selectedSaleId && invoiceQuery.data && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-96 overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Invoice Details</h2>
                  <button
                    onClick={() => setSelectedSaleId(null)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Invoice Number</div>
                      <div className="font-semibold">{invoiceQuery.data.invoiceNumber}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Date</div>
                      <div className="font-semibold">{formatDate(invoiceQuery.data.createdAt)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Store Name</div>
                      <div className="font-semibold">{invoiceQuery.data.storeName || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Invoice Date</div>
                      <div className="font-semibold">{formatDate(invoiceQuery.data.invoiceDate)}</div>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <h3 className="font-semibold mb-2">Items</h3>
                    <div className="space-y-2 text-sm">
                      {/* Items would be fetched separately */}
                      <div className="text-muted-foreground">Items details loading...</div>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{Number(invoiceQuery.data.subtotal).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CGST:</span>
                      <span>₹{Number(invoiceQuery.data.cgst || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SGST:</span>
                      <span>₹{Number(invoiceQuery.data.sgst || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t border-border pt-2">
                      <span>Total:</span>
                      <span className="text-accent">₹{(Number(invoiceQuery.data.subtotal) + Number(invoiceQuery.data.cgst || 0) + Number(invoiceQuery.data.sgst || 0)).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
