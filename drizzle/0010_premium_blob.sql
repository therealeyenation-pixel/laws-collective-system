CREATE TABLE `scheduled_bot_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`botId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`taskType` enum('daily_report','weekly_audit','monthly_analysis','content_schedule','engagement_check','seo_audit','token_report','operation_review','custom') NOT NULL,
	`prompt` text NOT NULL,
	`schedule` varchar(50) NOT NULL,
	`lastRunAt` timestamp,
	`nextRunAt` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdBy` int NOT NULL,
	`notifyOnComplete` boolean NOT NULL DEFAULT true,
	`resultHistory` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scheduled_bot_tasks_id` PRIMARY KEY(`id`)
);
