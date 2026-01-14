CREATE TABLE `blockchain_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recordType` enum('transaction','certificate','entity_creation','trust_update','allocation_change') NOT NULL,
	`referenceId` int NOT NULL,
	`blockchainHash` varchar(255) NOT NULL,
	`previousHash` varchar(255),
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`data` json,
	CONSTRAINT `blockchain_records_id` PRIMARY KEY(`id`),
	CONSTRAINT `blockchain_records_blockchainHash_unique` UNIQUE(`blockchainHash`)
);
--> statement-breakpoint
CREATE TABLE `business_entities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`entityType` enum('trust','llc','corporation','collective') NOT NULL,
	`status` enum('draft','active','paused','archived') NOT NULL DEFAULT 'draft',
	`trustLevel` int NOT NULL DEFAULT 1,
	`description` text,
	`financialStructure` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `business_entities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `certificates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`simulatorSessionId` int NOT NULL,
	`certificateType` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`issuedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	`certificateHash` varchar(255) NOT NULL,
	`verificationUrl` text,
	CONSTRAINT `certificates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `luv_ledger_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`businessEntityId` int,
	`accountType` enum('personal','entity','collective','trust') NOT NULL,
	`accountName` varchar(255) NOT NULL,
	`balance` decimal(18,8) NOT NULL DEFAULT '0',
	`allocationPercentage` decimal(5,2) NOT NULL DEFAULT '0',
	`status` enum('active','frozen','archived') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `luv_ledger_accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `luv_ledger_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fromAccountId` int NOT NULL,
	`toAccountId` int NOT NULL,
	`amount` decimal(18,8) NOT NULL,
	`transactionType` enum('income','allocation','distribution','fee','adjustment') NOT NULL,
	`description` text,
	`blockchainHash` varchar(255),
	`status` enum('pending','confirmed','failed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`confirmedAt` timestamp,
	CONSTRAINT `luv_ledger_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `simulator_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`simulatorType` enum('business_setup','financial_management','entity_operations') NOT NULL,
	`currentTurn` int NOT NULL DEFAULT 0,
	`totalTurns` int NOT NULL DEFAULT 12,
	`status` enum('in_progress','completed','abandoned') NOT NULL DEFAULT 'in_progress',
	`score` int NOT NULL DEFAULT 0,
	`gameState` json,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `simulator_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trust_relationships` (
	`id` int AUTO_INCREMENT NOT NULL,
	`parentUserId` int NOT NULL,
	`childUserId` int NOT NULL,
	`parentEntityId` int,
	`childEntityId` int,
	`trustLevel` int NOT NULL,
	`permissions` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trust_relationships_id` PRIMARY KEY(`id`)
);
