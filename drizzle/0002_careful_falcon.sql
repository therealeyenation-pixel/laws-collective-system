CREATE TABLE `iptv_channel_follows` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`channelId` int NOT NULL,
	`followDate` timestamp DEFAULT (now()),
	`notifications` boolean DEFAULT true,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `iptv_channel_follows_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `iptv_channels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100) NOT NULL,
	`logoUrl` text,
	`bannerUrl` text,
	`isActive` boolean DEFAULT true,
	`isLive` boolean DEFAULT false,
	`currentViewers` int DEFAULT 0,
	`totalViewers` int DEFAULT 0,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `iptv_channels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `iptv_epg_schedule` (
	`id` int AUTO_INCREMENT NOT NULL,
	`channelId` int NOT NULL,
	`programTitle` varchar(255) NOT NULL,
	`description` text,
	`startTime` timestamp NOT NULL,
	`endTime` timestamp NOT NULL,
	`duration` int,
	`genre` varchar(100),
	`rating` varchar(10),
	`isLive` boolean DEFAULT false,
	`recordingEnabled` boolean DEFAULT false,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `iptv_epg_schedule_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `iptv_playback_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`contentId` int,
	`channelId` int,
	`playbackPosition` int DEFAULT 0,
	`duration` int,
	`watchedAt` timestamp DEFAULT (now()),
	`completionPercentage` decimal(5,2) DEFAULT 0,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `iptv_playback_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `iptv_playlist_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`playlistId` int NOT NULL,
	`contentId` int,
	`channelId` int,
	`position` int NOT NULL,
	`addedAt` timestamp DEFAULT (now()),
	CONSTRAINT `iptv_playlist_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `iptv_playlists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`isPublic` boolean DEFAULT false,
	`itemCount` int DEFAULT 0,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `iptv_playlists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `iptv_recordings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`epgScheduleId` int NOT NULL,
	`recordingUrl` text,
	`fileSize` bigint,
	`status` varchar(50) DEFAULT 'scheduled',
	`startTime` timestamp,
	`endTime` timestamp,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `iptv_recordings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `iptv_stream_quality_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`resolution` varchar(50) NOT NULL,
	`bitrate` int NOT NULL,
	`fps` int DEFAULT 30,
	`codec` varchar(50) NOT NULL,
	`isDefault` boolean DEFAULT false,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `iptv_stream_quality_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `iptv_streams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`channelId` int NOT NULL,
	`streamUrl` text NOT NULL,
	`streamKey` varchar(255) NOT NULL,
	`bitrate` int,
	`resolution` varchar(50),
	`codec` varchar(50),
	`isActive` boolean DEFAULT false,
	`startTime` timestamp,
	`endTime` timestamp,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `iptv_streams_id` PRIMARY KEY(`id`),
	CONSTRAINT `iptv_streams_streamKey_unique` UNIQUE(`streamKey`)
);
--> statement-breakpoint
CREATE TABLE `iptv_vod_content` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100) NOT NULL,
	`thumbnailUrl` text,
	`videoUrl` text NOT NULL,
	`duration` int,
	`releaseDate` date,
	`rating` decimal(3,1),
	`viewCount` int DEFAULT 0,
	`isPublished` boolean DEFAULT false,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `iptv_vod_content_id` PRIMARY KEY(`id`)
);
