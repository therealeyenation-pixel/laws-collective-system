CREATE TABLE `allocation_pots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`houseId` int NOT NULL,
	`potType` enum('root_authority_reserve','circulation_pool','house_operational','steward_compensation','commercial_operating','future_crown','ancestral_treasury') NOT NULL,
	`balance` decimal(20,8) NOT NULL DEFAULT '0',
	`targetPercentage` decimal(5,2) NOT NULL,
	`isShareable` boolean NOT NULL DEFAULT false,
	`requiresApproval` boolean NOT NULL DEFAULT true,
	`minimumBalance` decimal(20,8) NOT NULL DEFAULT '0',
	`lastSyncAt` timestamp,
	`potStatus` enum('active','frozen','depleted') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `allocation_pots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `allocation_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceHouseId` int NOT NULL,
	`sourceAccountId` int,
	`grossAmount` decimal(20,8) NOT NULL,
	`treasuryAmount` decimal(20,8) NOT NULL,
	`houseAmount` decimal(20,8) NOT NULL,
	`reserveAmount` decimal(20,8) NOT NULL,
	`circulationAmount` decimal(20,8) NOT NULL,
	`allocationType` enum('income_allocation','distribution','inter_house_transfer','pot_rebalance','manual_adjustment') NOT NULL,
	`description` text,
	`referenceId` varchar(255),
	`validationStatus` enum('pending','validated','failed','manual_review') NOT NULL DEFAULT 'pending',
	`validationErrors` json,
	`blockchainHash` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`processedAt` timestamp,
	CONSTRAINT `allocation_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `economic_health_indicators` (
	`id` int AUTO_INCREMENT NOT NULL,
	`houseId` int,
	`indicatorType` enum('liquidity_ratio','allocation_accuracy','sync_success_rate','transaction_volume','pot_balance_health','gift_sale_compliance','error_rate') NOT NULL,
	`currentValue` decimal(20,8) NOT NULL,
	`targetValue` decimal(20,8),
	`thresholdMin` decimal(20,8),
	`thresholdMax` decimal(20,8),
	`healthStatus` enum('healthy','warning','critical','unknown') NOT NULL DEFAULT 'unknown',
	`measurementPeriod` enum('hourly','daily','weekly','monthly') NOT NULL,
	`measuredAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `economic_health_indicators_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `financial_errors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`errorCode` varchar(20) NOT NULL,
	`errorCategory` enum('luvledger','allocation','gift_sale','sync','validation','system') NOT NULL,
	`errorSeverity` enum('info','warning','error','critical') NOT NULL,
	`houseId` int,
	`transactionId` int,
	`syncCycleId` int,
	`message` text NOT NULL,
	`details` json,
	`stackTrace` text,
	`errorStatus` enum('open','acknowledged','investigating','resolved','ignored') NOT NULL DEFAULT 'open',
	`resolvedById` int,
	`resolvedAt` timestamp,
	`resolution` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `financial_errors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gift_sale_ratios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`houseId` int NOT NULL,
	`totalGiftsIssued` int NOT NULL DEFAULT 0,
	`totalSalesCompleted` int NOT NULL DEFAULT 0,
	`currentRatio` decimal(10,4) NOT NULL DEFAULT '0',
	`globalRatioTarget` decimal(5,2) NOT NULL DEFAULT '3.00',
	`houseRatioTarget` decimal(5,2) NOT NULL DEFAULT '2.00',
	`isCompliant` boolean NOT NULL DEFAULT true,
	`lastViolationAt` timestamp,
	`violationCount` int NOT NULL DEFAULT 0,
	`giftingBlocked` boolean NOT NULL DEFAULT false,
	`blockReason` text,
	`lastUpdatedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gift_sale_ratios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inflow_capture` (
	`id` int AUTO_INCREMENT NOT NULL,
	`houseId` int NOT NULL,
	`sourceType` enum('sale','gift_received','investment_return','grant','donation','royalty','interest','other') NOT NULL,
	`grossAmount` decimal(20,8) NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'USD',
	`sourceDescription` text,
	`externalReference` varchar(255),
	`inflowStatus` enum('pending','validated','allocated','failed','manual_review') NOT NULL DEFAULT 'pending',
	`allocationTransactionId` int,
	`receivedAt` timestamp NOT NULL DEFAULT (now()),
	`processedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inflow_capture_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sync_cycles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cycleType` enum('hourly','daily','weekly','monthly','quarterly','annual') NOT NULL,
	`houseId` int,
	`scheduledAt` timestamp NOT NULL,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`cycleStatus` enum('scheduled','running','completed','failed','skipped') NOT NULL DEFAULT 'scheduled',
	`transactionsProcessed` int NOT NULL DEFAULT 0,
	`allocationsCreated` int NOT NULL DEFAULT 0,
	`errorsEncountered` int NOT NULL DEFAULT 0,
	`summary` json,
	`errorLog` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sync_cycles_id` PRIMARY KEY(`id`)
);
