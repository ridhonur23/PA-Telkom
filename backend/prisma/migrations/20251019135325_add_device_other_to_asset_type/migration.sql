-- AlterTable
ALTER TABLE `categories` MODIFY `type` ENUM('VEHICLE', 'ROOM_KEY', 'DEVICE', 'OTHER') NOT NULL;
