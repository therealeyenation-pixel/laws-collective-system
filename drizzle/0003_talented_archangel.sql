CREATE TABLE `user_content_access` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`accessLevel` enum('verified_18','verified_21','premium') NOT NULL,
	`verificationMethod` varchar(100),
	`verificationDate` timestamp,
	`expiresAt` timestamp,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_content_access_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `iptv_channels` ADD `subcategory` varchar(100);--> statement-breakpoint
ALTER TABLE `iptv_channels` ADD `streamUrl` text;--> statement-breakpoint
ALTER TABLE `iptv_channels` ADD `country` varchar(100);--> statement-breakpoint
ALTER TABLE `iptv_channels` ADD `language` varchar(50);--> statement-breakpoint
ALTER TABLE `iptv_channels` ADD `contentRating` enum('G','PG','PG-13','R','NC-17','X','UNRATED') DEFAULT 'G' NOT NULL;--> statement-breakpoint
ALTER TABLE `iptv_channels` ADD `requiresAgeVerification` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `iptv_channels` ADD `isAdultContent` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `iptv_channels` ADD `accessLevel` enum('public','members','verified_18','verified_21','premium') DEFAULT 'public' NOT NULL;--> statement-breakpoint
ALTER TABLE `iptv_channels` ADD `importBatchId` varchar(100);--> statement-breakpoint
ALTER TABLE `iptv_channels` ADD `externalId` varchar(255);