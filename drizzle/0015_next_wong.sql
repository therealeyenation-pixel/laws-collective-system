CREATE TABLE `audit_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`auditType` enum('quarterly_house','annual_system','lineage_seven_year','corrective','external_witness') NOT NULL,
	`houseId` int,
	`auditPeriodStart` timestamp NOT NULL,
	`auditPeriodEnd` timestamp NOT NULL,
	`totalInflow` decimal(20,2),
	`totalOutflow` decimal(20,2),
	`giftTokenDistribution` decimal(20,2),
	`rootReserveLevel` decimal(20,2),
	`sustainabilityScore` decimal(5,2),
	`triggersActivated` json,
	`correctiveActionsRequired` boolean NOT NULL DEFAULT false,
	`correctiveActionsCompleted` boolean NOT NULL DEFAULT false,
	`flameOfAccountPerformed` boolean NOT NULL DEFAULT false,
	`custodialFlameSignature` varchar(255),
	`houseLedgerSealHash` varchar(255),
	`witnessHouseIds` json,
	`status` enum('scheduled','in_progress','completed','requires_correction') NOT NULL DEFAULT 'scheduled',
	`completedAt` timestamp,
	`blockchainHash` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `audit_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `integrity_triggers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`triggerType` enum('gift_to_sale_disproportion','treasury_depletion','unauthorized_transfer','misalignment_detection','continuity_beacon') NOT NULL,
	`houseId` int NOT NULL,
	`severity` enum('warning','critical','emergency') NOT NULL DEFAULT 'warning',
	`thresholdValue` decimal(20,2),
	`actualValue` decimal(20,2),
	`description` text,
	`autoFreezeActivated` boolean NOT NULL DEFAULT false,
	`ceremonialWarningIssued` boolean NOT NULL DEFAULT false,
	`realignmentRequired` boolean NOT NULL DEFAULT false,
	`resolvedAt` timestamp,
	`resolvedByUserId` int,
	`resolutionNotes` text,
	`status` enum('active','acknowledged','resolved','escalated') NOT NULL DEFAULT 'active',
	`blockchainHash` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `integrity_triggers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mirror_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tokenCode` varchar(64) NOT NULL,
	`ownerUserId` int NOT NULL,
	`houseId` int,
	`status` enum('available','locked','used','transferred') NOT NULL DEFAULT 'available',
	`lockExpiresAt` timestamp,
	`usedForHouseId` int,
	`usedAt` timestamp,
	`previousOwnerId` int,
	`transferredAt` timestamp,
	`transferBlockchainHash` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mirror_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `mirror_tokens_tokenCode_unique` UNIQUE(`tokenCode`)
);
--> statement-breakpoint
CREATE TABLE `spark_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tokenCode` varchar(64) NOT NULL,
	`ownerUserId` int NOT NULL,
	`earnedFrom` enum('course_completion','certification','mentorship','community_contribution','lineage_gift') NOT NULL,
	`sourceReferenceId` int,
	`status` enum('active','redeemed','expired') NOT NULL DEFAULT 'active',
	`redeemedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `spark_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `spark_tokens_tokenCode_unique` UNIQUE(`tokenCode`)
);
--> statement-breakpoint
CREATE TABLE `succession_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`houseId` int NOT NULL,
	`outgoingCustodianId` int NOT NULL,
	`incomingCustodianId` int NOT NULL,
	`interimCustodianId` int,
	`reason` enum('voluntary_transfer','incapacitation','death','removal_by_majority','generational_transition') NOT NULL,
	`initiatedAt` timestamp NOT NULL DEFAULT (now()),
	`interimStartedAt` timestamp,
	`interimEndsAt` timestamp,
	`alignmentStatementDueAt` timestamp,
	`alignmentStatementReceivedAt` timestamp,
	`alignmentStatementHash` varchar(255),
	`confirmation1At` timestamp,
	`confirmation1ByUserId` int,
	`confirmation2At` timestamp,
	`confirmation2ByUserId` int,
	`confirmation3At` timestamp,
	`confirmation3ByUserId` int,
	`status` enum('initiated','interim_period','awaiting_alignment','awaiting_confirmations','completed','rejected','reverted') NOT NULL DEFAULT 'initiated',
	`completedAt` timestamp,
	`blockchainHash` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `succession_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `house_members` MODIFY COLUMN `role` enum('trustee','beneficiary','successor_trustee','advisor','custodial_flame') NOT NULL;--> statement-breakpoint
ALTER TABLE `houses` MODIFY COLUMN `houseType` enum('root','bloodline','mirrored','adaptive') NOT NULL;--> statement-breakpoint
ALTER TABLE `house_members` ADD `memberType` enum('bloodline','non_bloodline') DEFAULT 'bloodline' NOT NULL;--> statement-breakpoint
ALTER TABLE `house_members` ADD `lineageStatus` enum('source_flame','direct_descendant','aligned_member') DEFAULT 'direct_descendant';--> statement-breakpoint
ALTER TABLE `house_members` ADD `publicAlias` varchar(100);--> statement-breakpoint
ALTER TABLE `house_members` ADD `realNameProtected` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `house_members` ADD `imageProtected` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `house_members` ADD `locationProtected` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `house_members` ADD `voiceLikenessProtected` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `house_members` ADD `canTransferTokens` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `house_members` ADD `canInitiateHouse` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `house_members` ADD `successionEligible` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `houses` ADD `publicAlias` varchar(255);--> statement-breakpoint
ALTER TABLE `houses` ADD `legacyHouseType` enum('root','family','business','community');--> statement-breakpoint
ALTER TABLE `houses` ADD `rootAuthorityReserve` decimal(20,2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE `houses` ADD `circulationPool` decimal(20,2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE `houses` ADD `ancestralTreasury` decimal(20,2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE `houses` ADD `successionStatus` enum('stable','interim','pending_confirmation') DEFAULT 'stable';--> statement-breakpoint
ALTER TABLE `houses` ADD `interimCustodianId` int;--> statement-breakpoint
ALTER TABLE `houses` ADD `successionStartedAt` timestamp;