ALTER TABLE `streaming_content` MODIFY COLUMN `status` enum('active','archived','offline','maintenance') NOT NULL DEFAULT 'active';--> statement-breakpoint
ALTER TABLE `streaming_content` ADD `approvalStatus` enum('pending','approved','rejected') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `streaming_content` ADD `approvedBy` int;--> statement-breakpoint
ALTER TABLE `streaming_content` ADD `approvedAt` timestamp;