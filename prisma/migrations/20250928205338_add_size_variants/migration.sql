/*
  Warnings:

  - You are about to drop the column `apiBaseUrl` on the `brand` table. All the data in the column will be lost.
  - You are about to drop the column `apiConfig` on the `brand` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `brand` DROP COLUMN `apiBaseUrl`,
    DROP COLUMN `apiConfig`,
    ADD COLUMN `apiProductDetailsUrl` VARCHAR(191) NULL,
    ADD COLUMN `apiProductsUrl` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `passwordresettoken` ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `verificationtoken` ADD PRIMARY KEY (`id`);

-- CreateTable
CREATE TABLE `SizeVariants` (
    `id` VARCHAR(191) NOT NULL,
    `size` VARCHAR(191) NOT NULL,
    `availability` ENUM('IN_STOCK', 'OUT_OF_STOCK', 'PRE_ORDER') NOT NULL DEFAULT 'IN_STOCK',
    `isSelected` BOOLEAN NOT NULL DEFAULT false,
    `originalOrder` INTEGER NULL,
    `colorVariantId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `size_variants_colorVariantId_fkey`(`colorVariantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SizeVariants` ADD CONSTRAINT `SizeVariants_colorVariantId_fkey` FOREIGN KEY (`colorVariantId`) REFERENCES `ColorVariants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
