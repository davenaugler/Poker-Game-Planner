/*
  Warnings:

  - Added the required column `city` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zipCode` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Game` ADD COLUMN `city` VARCHAR(191) NOT NULL,
    ADD COLUMN `state` VARCHAR(191) NOT NULL,
    ADD COLUMN `zipCode` VARCHAR(191) NOT NULL;

-- RenameIndex
ALTER TABLE `Game` RENAME INDEX `Game_hostId_fkey` TO `Game_hostId_idx`;
