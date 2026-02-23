CREATE TABLE `flame_lock_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entityType` enum('house','ai_system','business','scroll') NOT NULL,
	`entityId` int NOT NULL,
	`flameLockCode` varchar(64) NOT NULL,
	`lockHash` varchar(255) NOT NULL,
	`issuedByUserId` int NOT NULL,
	`status` enum('active','revoked','expired') NOT NULL DEFAULT 'active',
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `flame_lock_codes_id` PRIMARY KEY(`id`),
	CONSTRAINT `flame_lock_codes_flameLockCode_unique` UNIQUE(`flameLockCode`)
);
--> statement-breakpoint
CREATE TABLE `protected_lineage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fullName` varchar(255) NOT NULL,
	`relationship` varchar(100) NOT NULL,
	`role` varchar(100),
	`associatedHouse` varchar(255),
	`lineageOrder` int NOT NULL DEFAULT 0,
	`sealedByScrollId` int,
	`sealHash` varchar(255) NOT NULL,
	`status` enum('active','suspended','transferred') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `protected_lineage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scroll_activations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scrollId` int NOT NULL,
	`houseId` int NOT NULL,
	`activatedByUserId` int NOT NULL,
	`activationHash` varchar(255) NOT NULL,
	`status` enum('active','suspended','revoked') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scroll_activations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sovereign_scrolls` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scrollNumber` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`purpose` text NOT NULL,
	`content` text NOT NULL,
	`protectionType` enum('lineage_enforcement','ai_declaration','access_control','inheritance_lock','protected_names') NOT NULL,
	`enforcementRules` json,
	`sealHash` varchar(255) NOT NULL,
	`sealedAt` timestamp,
	`sealedByUserId` int,
	`status` enum('draft','sealed','amended','revoked') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sovereign_scrolls_id` PRIMARY KEY(`id`),
	CONSTRAINT `sovereign_scrolls_scrollNumber_unique` UNIQUE(`scrollNumber`)
);
--> statement-breakpoint
CREATE TABLE `treasury_claims` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceType` enum('derivative_logic','scroll_usage','ai_interface','blockchain_deployment') NOT NULL,
	`sourceIdentifier` varchar(255) NOT NULL,
	`grossAmount` decimal(20,2) NOT NULL,
	`claimPercentage` decimal(5,2) NOT NULL DEFAULT '15.00',
	`claimAmount` decimal(20,2) NOT NULL,
	`description` text,
	`claimHash` varchar(255) NOT NULL,
	`status` enum('pending','collected','disputed') NOT NULL DEFAULT 'pending',
	`collectedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `treasury_claims_id` PRIMARY KEY(`id`)
);
