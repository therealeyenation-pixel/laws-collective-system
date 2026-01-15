CREATE TABLE `contact_submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`email` varchar(255) NOT NULL,
	`phone` varchar(20),
	`subject` varchar(200),
	`message` text NOT NULL,
	`source` varchar(50) DEFAULT 'landing_page',
	`status` enum('new','read','replied','archived') NOT NULL DEFAULT 'new',
	`repliedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contact_submissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_sends` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`templateId` int,
	`botId` int,
	`recipientEmail` varchar(255) NOT NULL,
	`recipientName` varchar(100),
	`subject` varchar(200) NOT NULL,
	`status` enum('pending','sent','delivered','opened','clicked','bounced','failed') NOT NULL DEFAULT 'pending',
	`externalId` varchar(100),
	`openedAt` timestamp,
	`clickedAt` timestamp,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_sends_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`subject` varchar(200) NOT NULL,
	`htmlContent` text NOT NULL,
	`textContent` text,
	`category` enum('notification','marketing','transactional','newsletter') NOT NULL DEFAULT 'notification',
	`variables` json,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `social_media_integrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`platform` enum('twitter','facebook','instagram','linkedin','tiktok') NOT NULL,
	`accountName` varchar(100),
	`accountId` varchar(100),
	`accessToken` text,
	`refreshToken` text,
	`tokenExpiresAt` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`lastPostAt` timestamp,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `social_media_integrations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `social_media_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`integrationId` int NOT NULL,
	`botId` int,
	`content` text NOT NULL,
	`mediaUrls` json,
	`hashtags` json,
	`scheduledFor` timestamp,
	`publishedAt` timestamp,
	`status` enum('draft','scheduled','published','failed') NOT NULL DEFAULT 'draft',
	`platformPostId` varchar(100),
	`engagement` json,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `social_media_posts_id` PRIMARY KEY(`id`)
);
