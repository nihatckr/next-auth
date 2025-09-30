/*
  Warnings:

  - You are about to drop the `color_variants` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `brand` DROP FOREIGN KEY `brand_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `brand` DROP FOREIGN KEY `brand_updatedById_fkey`;

-- DropForeignKey
ALTER TABLE `category` DROP FOREIGN KEY `category_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `category` DROP FOREIGN KEY `category_updatedById_fkey`;

-- DropForeignKey
ALTER TABLE `color_variants` DROP FOREIGN KEY `color_variants_productId_fkey`;

-- DropForeignKey
ALTER TABLE `product` DROP FOREIGN KEY `product_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `product` DROP FOREIGN KEY `product_updatedById_fkey`;

-- DropTable
DROP TABLE `color_variants`;

-- CreateTable
CREATE TABLE `ColorVariants` (
    `id` VARCHAR(191) NOT NULL,
    `colorName` VARCHAR(191) NOT NULL,
    `colorCode` VARCHAR(191) NULL,
    `price` VARCHAR(191) NULL,
    `hexColor` VARCHAR(191) NULL,
    `availability` ENUM('IN_STOCK', 'OUT_OF_STOCK', 'PRE_ORDER') NOT NULL DEFAULT 'IN_STOCK',
    `sku` VARCHAR(191) NULL,
    `productId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `color_variants_productId_fkey`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Brand` ADD CONSTRAINT `Brand_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Brand` ADD CONSTRAINT `Brand_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ColorVariants` ADD CONSTRAINT `ColorVariants_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
