-- AlterTable
ALTER TABLE `loans` ADD COLUMN `isThirdParty` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `thirdPartyAddress` VARCHAR(191) NULL,
    ADD COLUMN `thirdPartyContact` VARCHAR(191) NULL,
    ADD COLUMN `thirdPartyName` VARCHAR(191) NULL;
