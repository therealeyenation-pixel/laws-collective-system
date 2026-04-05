CREATE TABLE `notification_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`emailEnabled` boolean NOT NULL DEFAULT true,
	`pushEnabled` boolean NOT NULL DEFAULT true,
	`operationAlerts` boolean NOT NULL DEFAULT true,
	`tokenAlerts` boolean NOT NULL DEFAULT true,
	`academyAlerts` boolean NOT NULL DEFAULT true,
	`documentAlerts` boolean NOT NULL DEFAULT true,
	`approvalAlerts` boolean NOT NULL DEFAULT true,
	`systemAlerts` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `notification_preferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('system','operation','token','academy','document','approval','alert','success','info') NOT NULL DEFAULT 'info',
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`entityId` int,
	`referenceType` varchar(50),
	`referenceId` int,
	`actionUrl` varchar(500),
	`isRead` boolean NOT NULL DEFAULT false,
	`isPriority` boolean NOT NULL DEFAULT false,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`readAt` timestamp,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
