CREATE TABLE `user_favorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`contentId` int NOT NULL,
	`contentType` enum('channel','station','track') NOT NULL,
	`isFavorite` boolean NOT NULL DEFAULT true,
	`addedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_favorites_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_content_unique` UNIQUE(`userId`,`contentId`)
);
--> statement-breakpoint
CREATE TABLE `user_playback_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`contentId` int NOT NULL,
	`contentType` enum('channel','station','track') NOT NULL,
	`lastPlayedAt` timestamp NOT NULL DEFAULT (now()),
	`playDurationSeconds` int,
	`totalPlayCount` int NOT NULL DEFAULT 1,
	`progressSeconds` int,
	`totalDurationSeconds` int,
	`progressPercentage` decimal(5,2),
	`isCompleted` boolean DEFAULT false,
	`rating` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_playback_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_playlists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`isPublic` boolean DEFAULT false,
	`itemCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_playlists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `user_favorites` ADD CONSTRAINT `user_favorites_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_favorites` ADD CONSTRAINT `user_favorites_contentId_streaming_content_id_fk` FOREIGN KEY (`contentId`) REFERENCES `streaming_content`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_playback_history` ADD CONSTRAINT `user_playback_history_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_playback_history` ADD CONSTRAINT `user_playback_history_contentId_streaming_content_id_fk` FOREIGN KEY (`contentId`) REFERENCES `streaming_content`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_playlists` ADD CONSTRAINT `user_playlists_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;