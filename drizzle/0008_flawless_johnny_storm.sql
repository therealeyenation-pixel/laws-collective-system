CREATE TABLE `conference_participants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`role` enum('host','presenter','attendee') NOT NULL,
	`status` enum('invited','joined','left','declined') NOT NULL DEFAULT 'invited',
	`joinedAt` timestamp,
	`leftAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `conference_participants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conference_rooms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`capacity` int NOT NULL,
	`status` enum('available','in_use','maintenance') NOT NULL DEFAULT 'available',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `conference_rooms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conference_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roomId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`topic` varchar(255) NOT NULL,
	`startTime` timestamp NOT NULL,
	`endTime` timestamp NOT NULL,
	`status` enum('scheduled','active','completed','cancelled') NOT NULL DEFAULT 'scheduled',
	`startedAt` timestamp,
	`endedAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `conference_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emergency_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('medical','security','fire','natural_disaster','other') NOT NULL,
	`location` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`severity` enum('critical','high','medium','low') NOT NULL,
	`status` enum('active','resolved','cancelled') NOT NULL DEFAULT 'active',
	`resolution` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `emergency_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emergency_contacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`email` varchar(320) NOT NULL,
	`relationship` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `emergency_contacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emergency_responses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`alertId` int NOT NULL,
	`contactId` int NOT NULL,
	`status` enum('notified','acknowledged','responded','failed') NOT NULL,
	`notifiedAt` timestamp,
	`acknowledgedAt` timestamp,
	`respondedAt` timestamp,
	CONSTRAINT `emergency_responses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `media_playlists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`isPublic` boolean NOT NULL DEFAULT false,
	`trackCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `media_playlists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `media_tracks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`playlistId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`artist` varchar(255) NOT NULL,
	`duration` int NOT NULL,
	`url` varchar(1024) NOT NULL,
	`type` enum('music','podcast','audiobook') NOT NULL,
	`addedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `media_tracks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `playback_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`trackId` int NOT NULL,
	`duration` int NOT NULL,
	`position` int NOT NULL,
	`playedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `playback_history_id` PRIMARY KEY(`id`)
);
