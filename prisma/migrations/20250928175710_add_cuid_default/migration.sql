/*
  Warnings:

  - The primary key for the `account` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `passwordresettoken` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `verificationtoken` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE `account` DROP PRIMARY KEY;

-- AlterTable
ALTER TABLE `passwordresettoken` DROP PRIMARY KEY;

-- AlterTable
ALTER TABLE `verificationtoken` DROP PRIMARY KEY;
