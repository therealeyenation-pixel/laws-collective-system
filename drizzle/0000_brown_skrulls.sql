CREATE TABLE `academy_courses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`houseId` int NOT NULL,
	`moduleId` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`description` text,
	`scrollTitle` varchar(200),
	`level` enum('foundational','developing','mastery') NOT NULL,
	`estimatedHours` int DEFAULT 10,
	`tokensReward` int DEFAULT 100,
	`prerequisites` json,
	`learningObjectives` json,
	`status` enum('draft','active','archived') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `academy_courses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `academy_houses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(50) NOT NULL,
	`description` text,
	`ageRange` varchar(20) NOT NULL,
	`gradeRange` varchar(20) NOT NULL,
	`ceremonialName` varchar(150),
	`iconPath` varchar(255),
	`colorTheme` varchar(50),
	`status` enum('active','inactive','coming_soon') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `academy_houses_id` PRIMARY KEY(`id`),
	CONSTRAINT `academy_houses_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `academy_languages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`nativeName` varchar(100),
	`slug` varchar(50) NOT NULL,
	`category` enum('indigenous','ancestral_flame','global_trade') NOT NULL,
	`description` text,
	`culturalContext` text,
	`iconEmoji` varchar(10),
	`status` enum('active','inactive','coming_soon') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `academy_languages_id` PRIMARY KEY(`id`),
	CONSTRAINT `academy_languages_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `academy_lessons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`courseId` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`scrollName` varchar(200),
	`content` text,
	`contentType` enum('text','video','interactive','ceremony','practice') NOT NULL,
	`orderIndex` int NOT NULL DEFAULT 0,
	`estimatedMinutes` int DEFAULT 30,
	`tokensReward` int DEFAULT 10,
	`resources` json,
	`status` enum('draft','active','archived') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `academy_lessons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
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
CREATE TABLE `audit_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requesting_user_id` varchar(255) NOT NULL,
	`target_house_ledger_id` int NOT NULL,
	`request_reason` text NOT NULL,
	`fraud_flag_id` int,
	`audit_request_status` enum('pending','approved','denied','expired','completed') DEFAULT 'pending',
	`approved_by` varchar(255),
	`approval_notes` text,
	`access_expires_at` timestamp,
	`access_started_at` timestamp,
	`access_ended_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `audit_requests_id` PRIMARY KEY(`id`)
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
CREATE TABLE `bot_actions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`botId` int NOT NULL,
	`conversationId` int,
	`userId` int NOT NULL,
	`actionType` enum('query','create','update','delete','approve','reject','notify','analyze','generate','transfer') NOT NULL,
	`targetType` varchar(50),
	`targetId` int,
	`description` text,
	`result` json,
	`status` enum('pending','completed','failed') NOT NULL DEFAULT 'completed',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bot_actions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bot_conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`botId` int NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255),
	`status` enum('active','archived','deleted') NOT NULL DEFAULT 'active',
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bot_conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bot_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`role` enum('user','assistant','system') NOT NULL,
	`content` text NOT NULL,
	`metadata` json,
	`tokenCount` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bot_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`type` enum('operations','support','education','analytics','guardian','finance','media','outreach','seo','engagement','custom') NOT NULL,
	`description` text,
	`avatar` varchar(500),
	`systemPrompt` text NOT NULL,
	`capabilities` json,
	`entityId` int,
	`isActive` boolean NOT NULL DEFAULT true,
	`isPublic` boolean NOT NULL DEFAULT false,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bots_id` PRIMARY KEY(`id`)
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
CREATE TABLE `courses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`subjectId` int NOT NULL,
	`title` varchar(150) NOT NULL,
	`level` enum('beginner','intermediate','advanced') NOT NULL,
	`ageGroup` varchar(50),
	`description` text,
	`instructor` varchar(100),
	`status` enum('draft','active','archived') DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `courses_id` PRIMARY KEY(`id`)
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
	`businessEntityId` int,
	`walletAddress` varchar(255) NOT NULL,
	`walletType` enum('luvchain','bitcoin','ethereum','solana','other') NOT NULL,
	`walletName` varchar(255),
	`balance` decimal(20,8) NOT NULL DEFAULT '0',
	`publicKey` varchar(255),
	`privateKeyHash` varchar(255),
	`status` enum('active','inactive','suspended') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crypto_wallets_id` PRIMARY KEY(`id`),
	CONSTRAINT `crypto_wallets_walletAddress_unique` UNIQUE(`walletAddress`)
);
--> statement-breakpoint
CREATE TABLE `curriculum_subjects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`category` varchar(50) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `curriculum_subjects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `departments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`managerId` int,
	`status` enum('active','inactive') DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `departments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `distribution_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`incomeEventId` int NOT NULL,
	`distributionType` enum('inter_house','intra_house','root_treasury','ancestral_treasury') NOT NULL,
	`fromHouseId` int NOT NULL,
	`toHouseId` int,
	`allocationCategory` enum('operations','inheritance','network','root_authority_reserve','circulation_pool','ancestral_treasury'),
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
CREATE TABLE `divine_stem_modules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(150) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`ceremonialTitle` varchar(200),
	`iconEmoji` varchar(10),
	`category` enum('stem','ceremonial','entrepreneurial','creative','language') NOT NULL,
	`orderIndex` int NOT NULL DEFAULT 0,
	`status` enum('active','inactive','coming_soon') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `divine_stem_modules_id` PRIMARY KEY(`id`),
	CONSTRAINT `divine_stem_modules_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
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
CREATE TABLE `fraud_flags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`house_ledger_id` int NOT NULL,
	`fraud_flag_type` enum('unusual_transaction_volume','balance_discrepancy','unauthorized_access_attempt','hash_mismatch','duplicate_transaction','suspicious_pattern','manual_report') NOT NULL,
	`fraud_severity` enum('low','medium','high','critical') DEFAULT 'medium',
	`description` text,
	`detected_at` timestamp DEFAULT (now()),
	`fraud_investigation_status` enum('pending','under_review','resolved_valid','resolved_fraud','dismissed') DEFAULT 'pending',
	`investigated_by` varchar(255),
	`resolution_notes` text,
	`resolved_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `fraud_flags_id` PRIMARY KEY(`id`)
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
CREATE TABLE `gift_activation_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`giftId` int NOT NULL,
	`userId` varchar(255) NOT NULL,
	`giftAttemptStatus` enum('approved','denied','pending') NOT NULL,
	`anniversaryMet` boolean,
	`scrollsComplete` boolean,
	`lineageVerified` boolean,
	`lockExpired` boolean,
	`resultMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gift_activation_attempts_id` PRIMARY KEY(`id`)
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
CREATE TABLE `gift_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceUserId` varchar(255) NOT NULL,
	`sourceHouseId` int NOT NULL,
	`targetUserId` varchar(255),
	`targetHouseId` int,
	`targetEmail` varchar(255),
	`targetName` varchar(255),
	`giftType` enum('mirror','adaptive','locked') NOT NULL,
	`giftValue` decimal(20,8),
	`giftDescription` text,
	`giftMessage` text,
	`requiresAnniversary` boolean DEFAULT false,
	`anniversaryDate` timestamp,
	`requiresStewardshipScrolls` boolean DEFAULT false,
	`requiredScrolls` json,
	`lockDurationDays` int,
	`lockExpiresAt` timestamp,
	`requiresLineageVerification` boolean DEFAULT false,
	`lineageVerified` boolean DEFAULT false,
	`lineageVerifiedAt` timestamp,
	`lineageVerifiedBy` varchar(255),
	`giftStatus` enum('pending','awaiting_activation','activated','claimed','expired','revoked') NOT NULL DEFAULT 'pending',
	`activatedAt` timestamp,
	`claimedAt` timestamp,
	`revokedAt` timestamp,
	`revokeReason` text,
	`giftHash` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gift_tokens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `guardian_access` (
	`id` int AUTO_INCREMENT NOT NULL,
	`guardianUserId` int NOT NULL,
	`studentProfileId` int NOT NULL,
	`accessLevel` enum('view_only','manage','full_control') NOT NULL DEFAULT 'manage',
	`notifications` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `guardian_access_id` PRIMARY KEY(`id`)
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
CREATE TABLE `house_ledger_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`house_ledger_id` int NOT NULL,
	`hl_transaction_type` enum('inflow','outflow','transfer','allocation','distribution','treasury_contribution','reserve_deposit','circulation_withdrawal') NOT NULL,
	`amount` decimal(18,2) NOT NULL,
	`from_account` varchar(255),
	`to_account` varchar(255),
	`description` text,
	`transaction_hash` varchar(64) NOT NULL,
	`previous_hash` varchar(64),
	`verified` boolean DEFAULT false,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `house_ledger_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `house_ledgers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`house_id` int NOT NULL,
	`ledger_name` varchar(255) NOT NULL,
	`ledger_hash` varchar(64) NOT NULL,
	`ledger_status` enum('active','suspended','archived','under_audit') DEFAULT 'active',
	`total_balance` decimal(18,2) DEFAULT '0.00',
	`reserve_balance` decimal(18,2) DEFAULT '0.00',
	`circulation_balance` decimal(18,2) DEFAULT '0.00',
	`treasury_contribution` decimal(18,2) DEFAULT '0.00',
	`house_retained` decimal(18,2) DEFAULT '0.00',
	`transaction_count` int DEFAULT 0,
	`last_sync_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `house_ledgers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `house_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`houseId` int NOT NULL,
	`userId` int NOT NULL,
	`memberType` enum('bloodline','non_bloodline') NOT NULL DEFAULT 'bloodline',
	`lineageStatus` enum('source_flame','direct_descendant','aligned_member') DEFAULT 'direct_descendant',
	`publicAlias` varchar(100),
	`realNameProtected` boolean NOT NULL DEFAULT true,
	`imageProtected` boolean NOT NULL DEFAULT true,
	`locationProtected` boolean NOT NULL DEFAULT true,
	`voiceLikenessProtected` boolean NOT NULL DEFAULT true,
	`role` enum('trustee','beneficiary','successor_trustee','advisor','custodial_flame') NOT NULL,
	`ownershipPercentage` decimal(5,2) NOT NULL DEFAULT '0',
	`votingRights` boolean NOT NULL DEFAULT false,
	`distributionEligible` boolean NOT NULL DEFAULT true,
	`canTransferTokens` boolean NOT NULL DEFAULT false,
	`canInitiateHouse` boolean NOT NULL DEFAULT false,
	`successionEligible` boolean NOT NULL DEFAULT false,
	`status` enum('active','inactive','pending') NOT NULL DEFAULT 'pending',
	`addedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `house_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `houses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`publicAlias` varchar(255),
	`houseType` enum('root','bloodline','mirrored','adaptive') NOT NULL,
	`legacyHouseType` enum('root','family','business','community'),
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
	`rootAuthorityReserve` decimal(20,2) NOT NULL DEFAULT '0',
	`circulationPool` decimal(20,2) NOT NULL DEFAULT '0',
	`ancestralTreasury` decimal(20,2) NOT NULL DEFAULT '0',
	`successionStatus` enum('stable','interim','pending_confirmation') DEFAULT 'stable',
	`interimCustodianId` int,
	`successionStartedAt` timestamp,
	`status` enum('forming','active','suspended','dissolved') NOT NULL DEFAULT 'forming',
	`generation` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `houses_id` PRIMARY KEY(`id`)
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
CREATE TABLE `language_lessons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`languageId` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`level` enum('beginner','intermediate','advanced') NOT NULL,
	`lessonType` enum('vocabulary','pronunciation','conversation','ceremony','story','chant') NOT NULL,
	`content` json,
	`audioUrl` varchar(500),
	`orderIndex` int NOT NULL DEFAULT 0,
	`tokensReward` int DEFAULT 15,
	`status` enum('draft','active','archived') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `language_lessons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ledger_access_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`house_ledger_id` int NOT NULL,
	`accessed_by_user_id` varchar(255) NOT NULL,
	`ledger_access_type` enum('view','export','audit','fraud_investigation') NOT NULL,
	`access_reason` text,
	`access_approved_by` varchar(255),
	`ip_address` varchar(45),
	`access_granted` boolean DEFAULT false,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `ledger_access_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `living_scrolls` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentProfileId` int NOT NULL,
	`scrollType` enum('voice_scroll','house_lexicon','translation_book','mastery_scroll') NOT NULL,
	`title` varchar(200) NOT NULL,
	`languageId` int,
	`content` json,
	`entriesCount` int DEFAULT 0,
	`isPublic` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `living_scrolls_id` PRIMARY KEY(`id`)
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
CREATE TABLE `main_house_ledger` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ledger_name` varchar(255) DEFAULT 'Root Authority Ledger',
	`total_treasury_balance` decimal(18,2) DEFAULT '0.00',
	`total_houses_connected` int DEFAULT 0,
	`total_transactions_processed` int DEFAULT 0,
	`last_aggregation_at` timestamp,
	`aggregation_hash` varchar(64),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `main_house_ledger_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mastery_certificates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentProfileId` int NOT NULL,
	`certificateType` enum('course_completion','house_graduation','language_mastery','stem_mastery','sovereign_diploma') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`courseId` int,
	`houseId` int,
	`languageId` int,
	`level` varchar(50),
	`blockchainHash` varchar(255),
	`verificationCode` varchar(100),
	`issuedAt` timestamp NOT NULL DEFAULT (now()),
	`metadata` json,
	CONSTRAINT `mastery_certificates_id` PRIMARY KEY(`id`),
	CONSTRAINT `mastery_certificates_verificationCode_unique` UNIQUE(`verificationCode`)
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
CREATE TABLE `notification_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`emailEnabled` boolean NOT NULL DEFAULT true,
	`pushEnabled` boolean NOT NULL DEFAULT true,
	`operationAlerts` boolean NOT NULL DEFAULT true,
	`tokenAlerts` boolean NOT NULL DEFAULT true,
	`academyAlerts` boolean NOT NULL DEFAULT true,
	`documentAlerts` boolean NOT NULL DEFAULT true,
	`approvalAlerts` boolean NOT NULL DEFAULT true,
	`systemAlerts` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `notification_preferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('system','operation','token','academy','document','approval','alert','success','info') NOT NULL DEFAULT 'info',
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`entityId` int,
	`referenceType` varchar(50),
	`referenceId` int,
	`actionUrl` varchar(500),
	`isRead` boolean NOT NULL DEFAULT false,
	`isPriority` boolean NOT NULL DEFAULT false,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`readAt` timestamp,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
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
--> statement-breakpoint
CREATE TABLE `scheduled_bot_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`botId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`taskType` enum('daily_report','weekly_audit','monthly_analysis','content_schedule','engagement_check','seo_audit','token_report','operation_review','custom') NOT NULL,
	`prompt` text NOT NULL,
	`schedule` varchar(50) NOT NULL,
	`lastRunAt` timestamp,
	`nextRunAt` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdBy` int NOT NULL,
	`notifyOnComplete` boolean NOT NULL DEFAULT true,
	`resultHistory` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scheduled_bot_tasks_id` PRIMARY KEY(`id`)
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
CREATE TABLE `scroll_seal_status` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(255) NOT NULL,
	`houseId` int NOT NULL,
	`scrollNumber` int NOT NULL,
	`scrollTitle` varchar(255),
	`isSealed` boolean NOT NULL DEFAULT false,
	`sealedAt` timestamp,
	`sealedBy` varchar(255),
	`sealHash` varchar(64),
	`verificationMethod` enum('manual','automatic','gpt_audit','course_completion') DEFAULT 'manual',
	`courseId` int,
	`moduleId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scroll_seal_status_id` PRIMARY KEY(`id`)
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
--> statement-breakpoint
CREATE TABLE `simulator_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`simulatorType` enum('business_setup','financial_management','entity_operations','grant_creation') NOT NULL,
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
CREATE TABLE `staff_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`departmentId` int NOT NULL,
	`role` enum('manager','administrator','admin_lead','teacher','staff') NOT NULL,
	`title` varchar(100),
	`status` enum('active','inactive','on_leave') DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `staff_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `student_enrollments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`courseId` int NOT NULL,
	`status` enum('enrolled','in_progress','completed','dropped') DEFAULT 'enrolled',
	`progressPercentage` int DEFAULT 0,
	`enrolledAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `student_enrollments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `student_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`guardianUserId` int,
	`houseId` int,
	`displayName` varchar(100),
	`gradeLevel` varchar(10),
	`birthYear` int,
	`primaryLanguageId` int,
	`selectedLanguages` json,
	`ceremonialPath` varchar(100),
	`preferences` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `student_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `student_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentProfileId` int NOT NULL,
	`courseId` int,
	`lessonId` int,
	`languageLessonId` int,
	`progressType` enum('course','lesson','language') NOT NULL,
	`status` enum('not_started','in_progress','completed','mastered') NOT NULL DEFAULT 'not_started',
	`progressPercentage` int DEFAULT 0,
	`score` int,
	`tokensEarned` int DEFAULT 0,
	`timeSpentMinutes` int DEFAULT 0,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `student_progress_id` PRIMARY KEY(`id`)
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
CREATE TABLE `token_activation_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`houseId` int NOT NULL,
	`userId` varchar(255) NOT NULL,
	`attemptTokenType` enum('mirror','gift','spark','house','crown') NOT NULL,
	`attemptStatus` enum('approved','denied','pending') NOT NULL,
	`expectedToken` varchar(50),
	`scrollsRequired` json,
	`scrollsSealed` json,
	`scrollsMissing` json,
	`resultMessage` text,
	`currentChain` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `token_activation_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `token_chain_states` (
	`id` int AUTO_INCREMENT NOT NULL,
	`houseId` int NOT NULL,
	`userId` varchar(255) NOT NULL,
	`currentTokenIndex` int NOT NULL DEFAULT 0,
	`activatedTokens` json,
	`mirrorActivatedAt` timestamp,
	`giftActivatedAt` timestamp,
	`sparkActivatedAt` timestamp,
	`houseActivatedAt` timestamp,
	`mirrorScrollsSealed` json,
	`giftScrollsSealed` json,
	`sparkScrollsSealed` json,
	`houseScrollsSealed` json,
	`chainStatus` enum('pending','in_progress','completed','blocked') NOT NULL DEFAULT 'pending',
	`blockReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `token_chain_states_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `token_expansions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceTokenId` int NOT NULL,
	`sourceHouseId` int NOT NULL,
	`sourceUserId` varchar(255) NOT NULL,
	`targetHouseId` int,
	`targetUserId` varchar(255),
	`expansionType` enum('bloodline','mirrored','adaptive') NOT NULL,
	`requiredScrollsComplete` boolean NOT NULL DEFAULT false,
	`requiredTimeElapsed` boolean NOT NULL DEFAULT false,
	`minimumDaysRequired` int DEFAULT 365,
	`expansionStatus` enum('pending','approved','rejected','completed','frozen') NOT NULL DEFAULT 'pending',
	`approvedBy` varchar(255),
	`approvedAt` timestamp,
	`rejectionReason` text,
	`enforcementActive` boolean NOT NULL DEFAULT true,
	`enforcementViolations` int NOT NULL DEFAULT 0,
	`frozenAt` timestamp,
	`freezeReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `token_expansions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `token_locks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tokenId` int NOT NULL,
	`tokenType` enum('mirror','gift','spark','house','crown') NOT NULL,
	`houseId` int NOT NULL,
	`userId` varchar(255) NOT NULL,
	`lockType` enum('time_based','scroll_based','lineage_based','manual') NOT NULL,
	`lockDurationDays` int,
	`lockStartedAt` timestamp NOT NULL DEFAULT (now()),
	`lockExpiresAt` timestamp,
	`requiredScrolls` json,
	`sealedScrolls` json,
	`requiresLineageVerification` boolean DEFAULT false,
	`lineageVerifiedAt` timestamp,
	`lineageVerifiedBy` varchar(255),
	`lockStatus` enum('active','unlocked','expired','violated') NOT NULL DEFAULT 'active',
	`unlockedAt` timestamp,
	`unlockReason` text,
	`violationCount` int NOT NULL DEFAULT 0,
	`lastViolationAt` timestamp,
	`violationDetails` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `token_locks_id` PRIMARY KEY(`id`)
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
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
