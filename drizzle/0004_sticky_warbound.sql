CREATE TABLE `broadcast_channel_follows` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`channelId` int NOT NULL,
	`followedAt` timestamp DEFAULT (now()),
	CONSTRAINT `broadcast_channel_follows_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `broadcast_playback_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`channelId` int NOT NULL,
	`startTime` timestamp DEFAULT (now()),
	`endTime` timestamp,
	`duration` int,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `broadcast_playback_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `broadcast_radio_channels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`type` enum('radio','podcast','audiobook','stream') NOT NULL,
	`category` varchar(100) NOT NULL,
	`subcategory` varchar(100),
	`logoUrl` text,
	`bannerUrl` text,
	`streamUrl` text NOT NULL,
	`country` varchar(100),
	`language` varchar(50),
	`contentRating` enum('G','PG','PG-13','R','NC-17','X','UNRATED') NOT NULL DEFAULT 'G',
	`isAdultContent` boolean DEFAULT false,
	`accessLevel` enum('public','members','verified_18','verified_21','premium') NOT NULL DEFAULT 'public',
	`isActive` boolean DEFAULT true,
	`isLive` boolean DEFAULT false,
	`currentListeners` int DEFAULT 0,
	`totalListeners` int DEFAULT 0,
	`importBatchId` varchar(100),
	`externalId` varchar(255),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `broadcast_radio_channels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `podcast_episodes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`channelId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`episodeNumber` int,
	`seasonNumber` int,
	`audioUrl` text NOT NULL,
	`duration` int,
	`releaseDate` timestamp,
	`isPublished` boolean DEFAULT false,
	`playCount` int DEFAULT 0,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `podcast_episodes_id` PRIMARY KEY(`id`)
);
