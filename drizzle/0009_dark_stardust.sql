CREATE TABLE `emergency_alert_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`region` varchar(100),
	`country` varchar(100),
	`alertTypes` json,
	`notificationMethod` enum('push','email','sms','all') NOT NULL DEFAULT 'push',
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `emergency_alert_subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emergency_broadcasts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contentId` int NOT NULL,
	`alertType` enum('weather','health','security','infrastructure','civil','other') NOT NULL,
	`severity` enum('info','warning','critical') NOT NULL,
	`affectedRegions` json,
	`affectedCountries` json,
	`issuedAt` timestamp NOT NULL,
	`expiresAt` timestamp,
	`cancelledAt` timestamp,
	`headline` varchar(255) NOT NULL,
	`details` text,
	`actionRequired` text,
	`broadcastChannels` json,
	`notificationsSent` int DEFAULT 0,
	`source` varchar(100),
	`sourceUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `emergency_broadcasts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `epg_schedule` (
	`id` int AUTO_INCREMENT NOT NULL,
	`channelId` int NOT NULL,
	`programTitle` varchar(255) NOT NULL,
	`description` text,
	`genre` varchar(100),
	`startTime` timestamp NOT NULL,
	`endTime` timestamp NOT NULL,
	`duration` int,
	`rating` varchar(10),
	`isRepeat` boolean DEFAULT false,
	`isClosed` boolean DEFAULT false,
	`externalProgramId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `epg_schedule_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `playlist_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`playlistId` int NOT NULL,
	`contentId` int NOT NULL,
	`position` int NOT NULL,
	`addedAt` timestamp NOT NULL DEFAULT (now()),
	`addedBy` int,
	CONSTRAINT `playlist_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `streaming_content` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contentType` enum('tv_channel','radio_station','music_track','podcast','emergency_broadcast') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100) NOT NULL,
	`subcategory` varchar(100),
	`genre` varchar(100),
	`streamUrl` text,
	`thumbnailUrl` text,
	`logoUrl` text,
	`artist` varchar(255),
	`album` varchar(255),
	`duration` int,
	`bitrate` int,
	`language` varchar(50) DEFAULT 'en',
	`isLive` boolean DEFAULT false,
	`scheduledStartTime` timestamp,
	`scheduledEndTime` timestamp,
	`currentViewers` int DEFAULT 0,
	`totalViews` int DEFAULT 0,
	`rating` decimal(3,2) DEFAULT '0',
	`emergencyLevel` enum('info','warning','critical','none') DEFAULT 'none',
	`emergencyCategory` varchar(100),
	`dataSource` varchar(100),
	`externalId` varchar(255),
	`status` enum('active','archived','offline','maintenance') NOT NULL DEFAULT 'active',
	`isVerified` boolean DEFAULT false,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `streaming_content_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `streaming_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`contentId` int NOT NULL,
	`sessionId` varchar(100) NOT NULL,
	`startTime` timestamp NOT NULL,
	`endTime` timestamp,
	`durationSeconds` int DEFAULT 0,
	`playbackPosition` int DEFAULT 0,
	`completionPercentage` int DEFAULT 0,
	`wasCompleted` boolean DEFAULT false,
	`deviceType` varchar(50),
	`streamQuality` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `streaming_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `streaming_playlists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`playlistType` enum('custom','system','shared') NOT NULL DEFAULT 'custom',
	`coverImageUrl` text,
	`isPublic` boolean DEFAULT false,
	`totalDuration` int DEFAULT 0,
	`itemCount` int DEFAULT 0,
	`shareToken` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `streaming_playlists_id` PRIMARY KEY(`id`),
	CONSTRAINT `streaming_playlists_shareToken_unique` UNIQUE(`shareToken`)
);
--> statement-breakpoint
CREATE TABLE `streaming_recommendations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`contentId` int NOT NULL,
	`recommendationType` enum('personalized','trending','similar','new_release','emergency') NOT NULL,
	`score` decimal(5,2),
	`reason` text,
	`wasClicked` boolean DEFAULT false,
	`clickedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	CONSTRAINT `streaming_recommendations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `streaming_shares` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`contentId` int NOT NULL,
	`shareToken` varchar(100) NOT NULL,
	`shareType` enum('link','social_media','email','embed') NOT NULL,
	`platform` varchar(50),
	`viewCount` int DEFAULT 0,
	`clickCount` int DEFAULT 0,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `streaming_shares_id` PRIMARY KEY(`id`),
	CONSTRAINT `streaming_shares_shareToken_unique` UNIQUE(`shareToken`)
);
--> statement-breakpoint
CREATE TABLE `user_streaming_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`contentId` int NOT NULL,
	`isFavorite` boolean DEFAULT false,
	`isBlocked` boolean DEFAULT false,
	`customLabel` varchar(100),
	`lastPlayedAt` timestamp,
	`playCount` int DEFAULT 0,
	`totalMinutesWatched` int DEFAULT 0,
	`notificationsEnabled` boolean DEFAULT true,
	`autoPlayNext` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_streaming_preferences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `emergency_alert_subscriptions` ADD CONSTRAINT `emergency_alert_subscriptions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `emergency_broadcasts` ADD CONSTRAINT `emergency_broadcasts_contentId_streaming_content_id_fk` FOREIGN KEY (`contentId`) REFERENCES `streaming_content`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `epg_schedule` ADD CONSTRAINT `epg_schedule_channelId_streaming_content_id_fk` FOREIGN KEY (`channelId`) REFERENCES `streaming_content`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `playlist_items` ADD CONSTRAINT `playlist_items_playlistId_streaming_playlists_id_fk` FOREIGN KEY (`playlistId`) REFERENCES `streaming_playlists`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `playlist_items` ADD CONSTRAINT `playlist_items_contentId_streaming_content_id_fk` FOREIGN KEY (`contentId`) REFERENCES `streaming_content`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `playlist_items` ADD CONSTRAINT `playlist_items_addedBy_users_id_fk` FOREIGN KEY (`addedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `streaming_history` ADD CONSTRAINT `streaming_history_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `streaming_history` ADD CONSTRAINT `streaming_history_contentId_streaming_content_id_fk` FOREIGN KEY (`contentId`) REFERENCES `streaming_content`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `streaming_playlists` ADD CONSTRAINT `streaming_playlists_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `streaming_recommendations` ADD CONSTRAINT `streaming_recommendations_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `streaming_recommendations` ADD CONSTRAINT `streaming_recommendations_contentId_streaming_content_id_fk` FOREIGN KEY (`contentId`) REFERENCES `streaming_content`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `streaming_shares` ADD CONSTRAINT `streaming_shares_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `streaming_shares` ADD CONSTRAINT `streaming_shares_contentId_streaming_content_id_fk` FOREIGN KEY (`contentId`) REFERENCES `streaming_content`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_streaming_preferences` ADD CONSTRAINT `user_streaming_preferences_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_streaming_preferences` ADD CONSTRAINT `user_streaming_preferences_contentId_streaming_content_id_fk` FOREIGN KEY (`contentId`) REFERENCES `streaming_content`(`id`) ON DELETE cascade ON UPDATE no action;