CREATE TABLE `course_completion_certificates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`walletId` int NOT NULL,
	`courseType` enum('business_setup','business_plan','grant_writing','financial_literacy','trust_formation','contracts','blockchain_crypto','operations') NOT NULL,
	`certificateHash` varchar(66) NOT NULL,
	`transactionHash` varchar(66) NOT NULL,
	`tokenId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`issuerName` varchar(255) NOT NULL DEFAULT 'L.A.W.S. Collective',
	`recipientName` varchar(255) NOT NULL,
	`completionDate` timestamp NOT NULL,
	`tokensEarned` int NOT NULL DEFAULT 0,
	`courseData` json,
	`metadata` json,
	`imageUrl` varchar(500),
	`verificationUrl` varchar(500),
	`isRevoked` boolean NOT NULL DEFAULT false,
	`revokedAt` timestamp,
	`revokedReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `course_completion_certificates_id` PRIMARY KEY(`id`),
	CONSTRAINT `course_completion_certificates_certificateHash_unique` UNIQUE(`certificateHash`)
);
--> statement-breakpoint
CREATE TABLE `course_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`courseType` enum('business_setup','business_plan','grant_writing','financial_literacy','trust_formation','contracts','blockchain_crypto','operations') NOT NULL,
	`currentModule` int NOT NULL DEFAULT 0,
	`totalModules` int NOT NULL,
	`completedModules` json,
	`worksheetData` json,
	`quizScores` json,
	`tokensEarned` int NOT NULL DEFAULT 0,
	`status` enum('not_started','in_progress','completed') NOT NULL DEFAULT 'not_started',
	`startedAt` timestamp,
	`completedAt` timestamp,
	`certificateId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `course_progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `luvchain_blocks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`blockNumber` int NOT NULL,
	`blockHash` varchar(66) NOT NULL,
	`previousHash` varchar(66) NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`nonce` int NOT NULL DEFAULT 0,
	`difficulty` int NOT NULL DEFAULT 1,
	`merkleRoot` varchar(66),
	`transactionCount` int NOT NULL DEFAULT 0,
	`size` int NOT NULL DEFAULT 0,
	`validator` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `luvchain_blocks_id` PRIMARY KEY(`id`),
	CONSTRAINT `luvchain_blocks_blockNumber_unique` UNIQUE(`blockNumber`),
	CONSTRAINT `luvchain_blocks_blockHash_unique` UNIQUE(`blockHash`)
);
--> statement-breakpoint
CREATE TABLE `luvchain_smart_contracts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contractAddress` varchar(66) NOT NULL,
	`creatorWalletId` int NOT NULL,
	`contractType` enum('certificate','token_transfer','trust_distribution','grant_allocation','entity_creation','escrow','subscription','custom') NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`code` text,
	`abi` json,
	`state` json,
	`isActive` boolean NOT NULL DEFAULT true,
	`deployedAt` timestamp NOT NULL DEFAULT (now()),
	`lastExecutedAt` timestamp,
	`executionCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `luvchain_smart_contracts_id` PRIMARY KEY(`id`),
	CONSTRAINT `luvchain_smart_contracts_contractAddress_unique` UNIQUE(`contractAddress`)
);
--> statement-breakpoint
CREATE TABLE `luvchain_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`transactionHash` varchar(66) NOT NULL,
	`blockId` int,
	`fromWalletId` int NOT NULL,
	`toWalletId` int,
	`contractId` int,
	`transactionType` enum('transfer','contract_deploy','contract_call','certificate_mint','entity_register','trust_setup','grant_disburse','reward') NOT NULL,
	`amount` decimal(20,8) NOT NULL DEFAULT '0',
	`gasUsed` int NOT NULL DEFAULT 0,
	`gasFee` decimal(20,8) NOT NULL DEFAULT '0',
	`data` json,
	`status` enum('pending','confirmed','failed') NOT NULL DEFAULT 'pending',
	`confirmations` int NOT NULL DEFAULT 0,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`confirmedAt` timestamp,
	CONSTRAINT `luvchain_transactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `luvchain_transactions_transactionHash_unique` UNIQUE(`transactionHash`)
);
--> statement-breakpoint
CREATE TABLE `trust_distribution_contracts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contractId` int NOT NULL,
	`trustName` varchar(255) NOT NULL,
	`trustType` enum('revocable','irrevocable','family','asset_protection','living','testamentary','98_trust','foreign_trust') NOT NULL,
	`grantorWalletId` int NOT NULL,
	`splitType` enum('60_40','70_30','custom') NOT NULL,
	`beneficiaries` json NOT NULL,
	`assets` json,
	`conditions` json,
	`isActive` boolean NOT NULL DEFAULT true,
	`activatedAt` timestamp,
	`lastDistributionAt` timestamp,
	`totalDistributed` decimal(20,8) NOT NULL DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trust_distribution_contracts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `crypto_wallets` MODIFY COLUMN `walletType` enum('luvchain','bitcoin','ethereum','solana','other') NOT NULL;--> statement-breakpoint
ALTER TABLE `crypto_wallets` ADD `businessEntityId` int;--> statement-breakpoint
ALTER TABLE `crypto_wallets` ADD `walletName` varchar(255);--> statement-breakpoint
ALTER TABLE `crypto_wallets` ADD `privateKeyHash` varchar(255);