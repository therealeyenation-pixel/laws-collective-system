CREATE TABLE `approvals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requestId` int NOT NULL,
	`approverId` int NOT NULL,
	`stage` enum('manager','finance','executive','board') NOT NULL,
	`decision` enum('pending','approve','reject','override','defer') NOT NULL DEFAULT 'pending',
	`comment` text,
	`decidedAt` timestamp,
	`signatureHash` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `approvals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `assets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assetType` enum('laptop','server','monitor','sat_phone','hotspot','vehicle','pod','license','furniture','other') NOT NULL,
	`makeModel` varchar(255),
	`serialOrVin` varchar(255),
	`ownerEntity` enum('trust','business','academy','subsidiary') NOT NULL DEFAULT 'trust',
	`ownerEntityId` int,
	`assignedToUserId` int,
	`assignedToSiteId` int,
	`assignedAt` timestamp,
	`purchaseDate` timestamp,
	`purchasePrice` decimal(20,2),
	`warrantyExpiry` timestamp,
	`maintenanceIntervalDays` int,
	`lastMaintenanceDate` timestamp,
	`assetStatus` enum('in_stock','assigned','maintenance','retired','disposed') NOT NULL DEFAULT 'in_stock',
	`ledgerRef` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `incidents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`incidentType` enum('security_breach','data_loss','system_outage','compliance_violation','financial_irregularity','safety_incident','other') NOT NULL,
	`incidentSeverity` enum('low','medium','high','critical') NOT NULL,
	`reportedById` int NOT NULL,
	`reportedAt` timestamp NOT NULL DEFAULT (now()),
	`assignedToId` int,
	`rootCause` text,
	`resolution` text,
	`resolvedAt` timestamp,
	`preventiveMeasures` text,
	`incidentStatus` enum('reported','investigating','resolved','closed') NOT NULL DEFAULT 'reported',
	`ledgerRef` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `incidents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`metricCategory` enum('financial','operational','program','hr','compliance','impact') NOT NULL,
	`targetValue` decimal(20,4),
	`actualValue` decimal(20,4),
	`unit` varchar(50),
	`periodStart` timestamp NOT NULL,
	`periodEnd` timestamp NOT NULL,
	`departmentId` int,
	`programId` int,
	`metricStatus` enum('on_track','at_risk','off_track','achieved') NOT NULL DEFAULT 'on_track',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `parcels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`addressLegalDesc` text NOT NULL,
	`parcelNumber` varchar(100),
	`acquisitionDate` timestamp,
	`acquisitionPrice` decimal(20,2),
	`currentValue` decimal(20,2),
	`useType` enum('hub','academy','community','storage','agricultural','residential','commercial','mixed') NOT NULL,
	`improvements` text,
	`acreage` decimal(10,4),
	`parcelOwnership` enum('trust','subsidiary','house') NOT NULL DEFAULT 'trust',
	`ownershipEntityId` int,
	`ledgerRef` varchar(255),
	`parcelStatus` enum('active','pending_sale','sold','transferred') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `parcels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requesterId` int NOT NULL,
	`departmentId` int,
	`category` enum('equipment','software','vehicle','service','facility','training') NOT NULL,
	`itemSpec` varchar(500) NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`justification` text NOT NULL,
	`costEstimate` decimal(20,2),
	`neededBy` timestamp,
	`status` enum('draft','pending_manager','pending_finance','pending_executive','approved','fulfilled','closed','rejected') NOT NULL DEFAULT 'draft',
	`blockchainRef` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `risks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`riskCategory` enum('financial','operational','legal','compliance','reputational','strategic','technology','security') NOT NULL,
	`likelihood` enum('rare','unlikely','possible','likely','almost_certain') NOT NULL,
	`impact` enum('insignificant','minor','moderate','major','catastrophic') NOT NULL,
	`riskScore` int,
	`mitigationStrategy` text,
	`mitigationStatus` enum('not_started','in_progress','implemented','monitoring') NOT NULL DEFAULT 'not_started',
	`ownerId` int,
	`reviewDate` timestamp,
	`riskStatus` enum('open','mitigated','accepted','closed') NOT NULL DEFAULT 'open',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `risks_id` PRIMARY KEY(`id`)
);
