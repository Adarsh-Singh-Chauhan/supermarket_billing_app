import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const connection = await mysql.createConnection(process.env.DATABASE_URL);

async function seedDatabase() {
  try {
    console.log("Starting database seeding...");

    // Clear existing data
    await connection.execute("DELETE FROM stockHistory");
    await connection.execute("DELETE FROM saleItems");
    await connection.execute("DELETE FROM invoices");
    await connection.execute("DELETE FROM sales");
    await connection.execute("DELETE FROM forecastingResults");
    await connection.execute("DELETE FROM products");
    await connection.execute("DELETE FROM systemSettings");

    // Insert demo products
    const products = [
      ["Basmati Rice", "Grains", "RICE001", 40, 60, 5, 100, "Rice Mills Co", "Premium basmati rice"],
      ["Whole Wheat Flour", "Grains", "FLOUR001", 25, 40, 5, 150, "Flour Mills", "Whole wheat flour 1kg"],
      ["Cooking Oil", "Oils", "OIL001", 120, 180, 5, 50, "Oil Refinery", "Refined cooking oil 1L"],
      ["Sugar", "Sweeteners", "SUGAR001", 35, 50, 5, 200, "Sugar Mills", "White sugar 1kg"],
      ["Salt", "Condiments", "SALT001", 10, 20, 5, 300, "Salt Works", "Iodized salt 1kg"],
      ["Milk Powder", "Dairy", "MILK001", 250, 350, 5, 75, "Dairy Co", "Full cream milk powder 500g"],
      ["Bread", "Bakery", "BREAD001", 30, 50, 5, 120, "Bakery Fresh", "White bread loaf"],
      ["Eggs", "Dairy", "EGGS001", 4, 6, 5, 500, "Poultry Farm", "Fresh brown eggs"],
      ["Tomato Sauce", "Condiments", "SAUCE001", 20, 35, 5, 80, "Sauce Factory", "Tomato sauce 500ml"],
      ["Biscuits", "Snacks", "BISCUIT001", 15, 25, 5, 200, "Biscuit Factory", "Digestive biscuits 250g"],
    ];

    for (const product of products) {
      await connection.execute(
        `INSERT INTO products (name, category, barcode, costPrice, sellingPrice, gstPercentage, stockQuantity, supplier, description, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        product
      );
    }

    console.log("✅ Seeded 10 demo products");

    // Insert system settings
    try {
      await connection.execute(
        `INSERT INTO systemSettings (storeName, storeAddress, gstin, phoneNumber, email, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        ["SuperMart Retail Store", "123 Main Street, City Center", "27AABCU9603R1Z0", "+91-9876543210", "info@supermart.com"]
      );
      console.log("✅ Seeded system settings");
    } catch (e) {
      console.log("⚠️  System settings already exist");
    }

    // Insert sample sales transactions
    for (let i = 0; i < 3; i++) {
      const now = new Date();
      now.setDate(now.getDate() - i);

      const invoiceNumber = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(i + 1).padStart(4, "0")}`;

      const subtotal = 500 + i * 100;
      const taxAmount = 50 + i * 10;
      const totalAmount = subtotal + taxAmount;
      const cgst = taxAmount / 2;
      const sgst = taxAmount / 2;

      const result = await connection.execute(
        `INSERT INTO sales (cashierId, invoiceNumber, totalAmount, subtotal, taxAmount, discountAmount, cgst, sgst, paymentMode, status, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [1, invoiceNumber, totalAmount, subtotal, taxAmount, 0, cgst, sgst, "cash", "completed", now, now]
      );

      const saleId = result[0].insertId;

      // Add sample sale items
      const productId = 1 + (i % 5);
      const itemQty = 2;
      const itemPrice = 60;
      const itemGst = 5;
      const itemGstAmount = itemPrice * itemQty * (itemGst / 100);
      const itemTotal = itemPrice * itemQty + itemGstAmount;

      await connection.execute(
        `INSERT INTO saleItems (saleId, productId, quantity, unitPrice, gstPercentage, gstAmount, totalPrice, createdAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [saleId, productId, itemQty, itemPrice, itemGst, itemGstAmount, itemTotal, now]
      );

      // Create invoice
      const invoiceSubtotal = itemPrice * itemQty;
      const invoiceCgst = invoiceSubtotal * 0.09;
      const invoiceSgst = invoiceSubtotal * 0.09;
      const invoiceTotalTax = invoiceCgst + invoiceSgst;
      const invoiceTotalAmount = invoiceSubtotal + invoiceTotalTax;

      await connection.execute(
        `INSERT INTO invoices (saleId, invoiceNumber, gstin, storeName, storeAddress, invoiceDate, subtotal, cgst, sgst, totalTax, totalAmount, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [saleId, invoiceNumber, "27AABCU9603R1Z0", "SuperMart Retail Store", "123 Main Street, City Center", now, invoiceSubtotal, invoiceCgst, invoiceSgst, invoiceTotalTax, invoiceTotalAmount, now, now]
      );
    }

    console.log("✅ Seeded sample sales transactions");
    console.log("\n✨ Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seedDatabase();
