CREATE TABLE `app_integration_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`appId` int NOT NULL,
	`action` enum('connected','disconnected','synced','error','updated') NOT NULL,
	`details` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `app_integration_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `available_apps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`category` enum('investment','music_movies','ai_assistant','banking','business','education','health','social','other') NOT NULL,
	`description` text,
	`logoUrl` varchar(500),
	`website` varchar(500),
	`authType` enum('oauth','api_key','username_password','none') NOT NULL DEFAULT 'oauth',
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `available_apps_id` PRIMARY KEY(`id`),
	CONSTRAINT `available_apps_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `user_app_connections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`appId` int NOT NULL,
	`status` enum('connected','disconnected','error','pending') NOT NULL DEFAULT 'connected',
	`encryptedCredentials` text,
	`metadata` json,
	`lastSyncedAt` timestamp,
	`errorMessage` text,
	`connectedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_app_connections_id` PRIMARY KEY(`id`)
);
