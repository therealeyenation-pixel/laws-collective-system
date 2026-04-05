CREATE TABLE `document_access` (
	`id` int AUTO_INCREMENT NOT NULL,
	`documentId` int NOT NULL,
	`userId` int,
	`entityId` int,
	`role` enum('viewer','editor','admin') NOT NULL DEFAULT 'viewer',
	`canDownload` boolean DEFAULT true,
	`canShare` boolean DEFAULT false,
	`expiresAt` timestamp,
	`grantedBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `document_access_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `document_access_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`documentId` int NOT NULL,
	`userId` int NOT NULL,
	`action` enum('view','download','edit','share','delete','restore') NOT NULL,
	`ipAddress` varchar(50),
	`userAgent` varchar(500),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `document_access_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `document_folders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`entityId` int,
	`parentFolderId` int,
	`name` varchar(100) NOT NULL,
	`description` varchar(500),
	`color` varchar(20),
	`icon` varchar(50),
	`accessLevel` enum('owner_only','entity_members','authorized_users') NOT NULL DEFAULT 'owner_only',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `document_folders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `document_versions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`documentId` int NOT NULL,
	`version` int NOT NULL,
	`content` text,
	`fileUrl` varchar(500),
	`changeNotes` text,
	`createdBy` int NOT NULL,
	`blockchainHash` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `document_versions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `secure_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`entityId` int,
	`folderId` int,
	`documentType` enum('business_plan','grant_application','financial_statement','legal_document','contract','certificate','report','template','other') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`fileName` varchar(255),
	`fileUrl` varchar(500),
	`fileSize` int,
	`mimeType` varchar(100),
	`content` text,
	`version` int NOT NULL DEFAULT 1,
	`status` enum('draft','final','archived') NOT NULL DEFAULT 'draft',
	`isTemplate` boolean DEFAULT false,
	`accessLevel` enum('owner_only','entity_members','authorized_users','public') NOT NULL DEFAULT 'owner_only',
	`blockchainHash` varchar(100),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `secure_documents_id` PRIMARY KEY(`id`)
);
