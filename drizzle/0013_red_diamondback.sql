CREATE TABLE `distribution_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`incomeEventId` int NOT NULL,
	`distributionType` enum('inter_house','intra_house') NOT NULL,
	`fromHouseId` int NOT NULL,
	`toHouseId` int,
	`allocationCategory` enum('operations','inheritance','network'),
	`amount` decimal(20,2) NOT NULL,
	`percentage` decimal(5,2) NOT NULL,
	`description` text,
	`status` enum('pending','executed','verified') NOT NULL DEFAULT 'pending',
	`executedAt` timestamp,
	`blockchainHash` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `distribution_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `distribution_rules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`houseId` int NOT NULL,
	`ruleName` varchar(255) NOT NULL,
	`ruleType` enum('threshold','schedule','event','conditional') NOT NULL,
	`triggerCondition` json NOT NULL,
	`distributionAction` json NOT NULL,
	`priority` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`lastTriggered` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `distribution_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `house_businesses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`houseId` int NOT NULL,
	`businessEntityId` int NOT NULL,
	`ownershipPercentage` decimal(5,2) NOT NULL DEFAULT '100.00',
	`incomeContributionRate` decimal(5,2) NOT NULL DEFAULT '100.00',
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`linkedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `house_businesses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `house_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`houseId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('trustee','beneficiary','successor_trustee','advisor') NOT NULL,
	`ownershipPercentage` decimal(5,2) NOT NULL DEFAULT '0',
	`votingRights` boolean NOT NULL DEFAULT false,
	`distributionEligible` boolean NOT NULL DEFAULT true,
	`status` enum('active','inactive','pending') NOT NULL DEFAULT 'pending',
	`addedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `house_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `houses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`houseType` enum('root','family','business','community') NOT NULL,
	`parentHouseId` int,
	`ownerUserId` int NOT NULL,
	`trustName` varchar(255),
	`trustType` enum('living','revocable','irrevocable','dynasty') DEFAULT 'living',
	`trustEIN` varchar(20),
	`interHouseSplit` decimal(5,2) NOT NULL DEFAULT '60.00',
	`interHouseDistribution` decimal(5,2) NOT NULL DEFAULT '40.00',
	`intraHouseOperations` decimal(5,2) NOT NULL DEFAULT '70.00',
	`intraHouseInheritance` decimal(5,2) NOT NULL DEFAULT '30.00',
	`totalAssets` decimal(20,2) NOT NULL DEFAULT '0',
	`totalIncome` decimal(20,2) NOT NULL DEFAULT '0',
	`totalDistributed` decimal(20,2) NOT NULL DEFAULT '0',
	`operationsBalance` decimal(20,2) NOT NULL DEFAULT '0',
	`inheritanceReserve` decimal(20,2) NOT NULL DEFAULT '0',
	`status` enum('forming','active','suspended','dissolved') NOT NULL DEFAULT 'forming',
	`generation` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `houses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `income_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceType` enum('business','investment','grant','donation','other') NOT NULL,
	`sourceId` int,
	`houseId` int NOT NULL,
	`grossAmount` decimal(20,2) NOT NULL,
	`netAmount` decimal(20,2) NOT NULL,
	`description` text,
	`incomeDate` timestamp NOT NULL DEFAULT (now()),
	`status` enum('pending','processed','distributed') NOT NULL DEFAULT 'pending',
	`blockchainHash` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `income_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inheritance_queue` (
	`id` int AUTO_INCREMENT NOT NULL,
	`houseId` int NOT NULL,
	`beneficiaryUserId` int NOT NULL,
	`amount` decimal(20,2) NOT NULL,
	`vestingDate` timestamp,
	`status` enum('accumulating','vested','distributed','forfeited') NOT NULL DEFAULT 'accumulating',
	`distributionEventId` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inheritance_queue_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `network_houses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceHouseId` int NOT NULL,
	`targetHouseId` int NOT NULL,
	`allocationPercentage` decimal(5,2) NOT NULL,
	`relationship` enum('child','sibling','partner','community') NOT NULL,
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `network_houses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `system_audit_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventType` enum('income_received','distribution_executed','house_created','member_added','business_linked','rule_triggered','inheritance_vested','manual_override') NOT NULL,
	`entityType` varchar(50) NOT NULL,
	`entityId` int NOT NULL,
	`actorType` enum('system','user','admin') NOT NULL,
	`actorId` int,
	`beforeState` json,
	`afterState` json,
	`description` text,
	`blockchainHash` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `system_audit_log_id` PRIMARY KEY(`id`)
);
