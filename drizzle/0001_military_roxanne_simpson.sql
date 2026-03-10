CREATE TABLE `dailySalesSummary` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` datetime NOT NULL,
	`totalSales` int NOT NULL,
	`totalRevenue` decimal(12,2) NOT NULL,
	`totalTax` decimal(10,2) NOT NULL,
	`totalDiscount` decimal(10,2) DEFAULT '0',
	`transactionCount` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dailySalesSummary_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `forecastingResults` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`forecastDate` datetime NOT NULL,
	`predictedDemand` int NOT NULL,
	`confidence` decimal(5,2) NOT NULL,
	`recommendedStock` int NOT NULL,
	`forecastType` enum('daily','weekly','monthly') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `forecastingResults_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`saleId` int NOT NULL,
	`invoiceNumber` varchar(50) NOT NULL,
	`gstin` varchar(20),
	`storeName` varchar(255),
	`storeAddress` text,
	`invoiceDate` datetime NOT NULL,
	`items` json,
	`subtotal` decimal(12,2) NOT NULL,
	`cgst` decimal(10,2) DEFAULT '0',
	`sgst` decimal(10,2) DEFAULT '0',
	`totalTax` decimal(10,2) NOT NULL,
	`totalAmount` decimal(12,2) NOT NULL,
	`qrCode` text,
	`isPrinted` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoices_saleId_unique` UNIQUE(`saleId`),
	CONSTRAINT `invoices_invoiceNumber_unique` UNIQUE(`invoiceNumber`)
);
--> statement-breakpoint
CREATE TABLE `productSalesAnalytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`date` datetime NOT NULL,
	`quantitySold` int NOT NULL,
	`revenue` decimal(12,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `productSalesAnalytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` varchar(100) NOT NULL,
	`barcode` varchar(100),
	`costPrice` decimal(10,2) NOT NULL,
	`sellingPrice` decimal(10,2) NOT NULL,
	`gstPercentage` decimal(5,2) DEFAULT '0',
	`stockQuantity` int NOT NULL DEFAULT 0,
	`supplier` varchar(255),
	`imageUrl` text,
	`description` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_barcode_unique` UNIQUE(`barcode`)
);
--> statement-breakpoint
CREATE TABLE `saleItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`saleId` int NOT NULL,
	`productId` int NOT NULL,
	`quantity` int NOT NULL,
	`unitPrice` decimal(10,2) NOT NULL,
	`gstPercentage` decimal(5,2) NOT NULL,
	`gstAmount` decimal(10,2) NOT NULL,
	`totalPrice` decimal(10,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `saleItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sales` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoiceNumber` varchar(50) NOT NULL,
	`cashierId` int NOT NULL,
	`totalAmount` decimal(12,2) NOT NULL,
	`subtotal` decimal(12,2) NOT NULL,
	`discountAmount` decimal(10,2) DEFAULT '0',
	`taxAmount` decimal(10,2) NOT NULL,
	`cgst` decimal(10,2) DEFAULT '0',
	`sgst` decimal(10,2) DEFAULT '0',
	`paymentMode` enum('cash','card','upi','cheque') NOT NULL,
	`status` enum('completed','pending','cancelled') NOT NULL DEFAULT 'completed',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sales_id` PRIMARY KEY(`id`),
	CONSTRAINT `sales_invoiceNumber_unique` UNIQUE(`invoiceNumber`)
);
--> statement-breakpoint
CREATE TABLE `stockHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`previousQuantity` int NOT NULL,
	`newQuantity` int NOT NULL,
	`changeReason` enum('sale','restock','adjustment','damage') NOT NULL,
	`quantity` int NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stockHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `systemSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeName` varchar(255) NOT NULL,
	`storeAddress` text,
	`gstin` varchar(20),
	`phoneNumber` varchar(20),
	`email` varchar(320),
	`logoUrl` text,
	`lowStockThreshold` int NOT NULL DEFAULT 10,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `systemSettings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('admin','cashier','user') NOT NULL DEFAULT 'user';