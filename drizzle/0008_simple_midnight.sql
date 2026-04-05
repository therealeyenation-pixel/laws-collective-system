CREATE TABLE `bot_actions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`botId` int NOT NULL,
	`conversationId` int,
	`userId` int NOT NULL,
	`actionType` enum('query','create','update','delete','approve','reject','notify','analyze','generate','transfer') NOT NULL,
	`targetType` varchar(50),
	`targetId` int,
	`description` text,
	`result` json,
	`status` enum('pending','completed','failed') NOT NULL DEFAULT 'completed',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bot_actions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bot_conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`botId` int NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255),
	`status` enum('active','archived','deleted') NOT NULL DEFAULT 'active',
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bot_conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bot_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`role` enum('user','assistant','system') NOT NULL,
	`content` text NOT NULL,
	`metadata` json,
	`tokenCount` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bot_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`type` enum('operations','support','education','analytics','guardian','finance','media','custom') NOT NULL,
	`description` text,
	`avatar` varchar(500),
	`systemPrompt` text NOT NULL,
	`capabilities` json,
	`entityId` int,
	`isActive` boolean NOT NULL DEFAULT true,
	`isPublic` boolean NOT NULL DEFAULT false,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bots_id` PRIMARY KEY(`id`)
);
