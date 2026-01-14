CREATE TABLE `achievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`achievementType` varchar(100) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`tokensReward` decimal(20,8) NOT NULL DEFAULT '0',
	`unlockedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `achievements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `activity_audit_trail` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`activityType` varchar(100) NOT NULL,
	`entityType` varchar(100),
	`entityId` int,
	`action` varchar(100) NOT NULL,
	`details` json,
	`blockchainHash` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activity_audit_trail_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `autonomous_operations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessEntityId` int NOT NULL,
	`operationType` varchar(100) NOT NULL,
	`decision` json NOT NULL,
	`reasoning` text,
	`outcome` json,
	`status` enum('pending','executed','reviewed','rejected') NOT NULL DEFAULT 'pending',
	`reviewedBy` int,
	`reviewedAt` timestamp,
	`reviewNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `autonomous_operations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crypto_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`walletId` int NOT NULL,
	`transactionHash` varchar(255) NOT NULL,
	`amount` decimal(20,8) NOT NULL,
	`transactionType` enum('deposit','withdrawal','payment','transfer') NOT NULL,
	`status` enum('pending','confirmed','failed') NOT NULL DEFAULT 'pending',
	`confirmations` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`confirmedAt` timestamp,
	CONSTRAINT `crypto_transactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `crypto_transactions_transactionHash_unique` UNIQUE(`transactionHash`)
);
--> statement-breakpoint
CREATE TABLE `crypto_wallets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`walletAddress` varchar(255) NOT NULL,
	`walletType` enum('bitcoin','ethereum','solana','other') NOT NULL,
	`balance` decimal(20,8) NOT NULL DEFAULT '0',
	`publicKey` varchar(255),
	`status` enum('active','inactive','suspended') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crypto_wallets_id` PRIMARY KEY(`id`),
	CONSTRAINT `crypto_wallets_walletAddress_unique` UNIQUE(`walletAddress`)
);
--> statement-breakpoint
CREATE TABLE `game_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`simulatorId` int NOT NULL,
	`gameType` varchar(100) NOT NULL,
	`difficulty` enum('beginner','intermediate','advanced') NOT NULL,
	`score` int NOT NULL DEFAULT 0,
	`tokensEarned` decimal(20,8) NOT NULL DEFAULT '0',
	`status` enum('in_progress','completed','abandoned') NOT NULL DEFAULT 'in_progress',
	`gameState` json,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `game_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `generated_curriculum` (
	`id` int AUTO_INCREMENT NOT NULL,
	`courseId` int NOT NULL,
	`generationVersion` int NOT NULL DEFAULT 1,
	`generatedBy` varchar(100) NOT NULL DEFAULT 'ai',
	`contentData` json NOT NULL,
	`difficulty` enum('beginner','intermediate','advanced') NOT NULL,
	`status` enum('draft','active','archived') NOT NULL DEFAULT 'draft',
	`generatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `generated_curriculum_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sync_queue` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`operationType` varchar(100) NOT NULL,
	`data` json NOT NULL,
	`status` enum('pending','synced','failed') NOT NULL DEFAULT 'pending',
	`retryCount` int NOT NULL DEFAULT 0,
	`lastError` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`syncedAt` timestamp,
	CONSTRAINT `sync_queue_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `token_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tokenBalance` decimal(20,8) NOT NULL DEFAULT '0',
	`totalEarned` decimal(20,8) NOT NULL DEFAULT '0',
	`totalSpent` decimal(20,8) NOT NULL DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `token_accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `token_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`amount` decimal(20,8) NOT NULL,
	`transactionType` enum('earned','spent','transferred','converted','reward') NOT NULL,
	`source` varchar(255),
	`description` text,
	`blockchainHash` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `token_transactions_id` PRIMARY KEY(`id`)
);
