CREATE TABLE `alert_escalation_rules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`fromSeverity` enum('info','warning') NOT NULL,
	`toSeverity` enum('warning','critical') NOT NULL,
	`hoursUntilEscalation` int NOT NULL,
	`notifyOnEscalation` boolean NOT NULL DEFAULT true,
	`notifyRoles` json,
	`notifyEmails` json,
	`appliesToDepartments` json,
	`appliesToAlertTypes` json,
	`isEnabled` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `alert_escalation_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `article_assignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`articleId` int NOT NULL,
	`assignedToUserId` int NOT NULL,
	`assignedByUserId` int NOT NULL,
	`priority` enum('low','normal','high','urgent') NOT NULL DEFAULT 'normal',
	`dueDate` timestamp,
	`message` text,
	`status` enum('pending','in_progress','completed','overdue') NOT NULL DEFAULT 'pending',
	`startedAt` timestamp,
	`completedAt` timestamp,
	`timeSpent` int,
	`acknowledged` boolean NOT NULL DEFAULT false,
	`acknowledgedAt` timestamp,
	`acknowledgmentNotes` text,
	`remindersSent` int NOT NULL DEFAULT 0,
	`lastReminderAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `article_assignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `article_reading_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`articleId` int NOT NULL,
	`userId` int NOT NULL,
	`progressPercent` int NOT NULL DEFAULT 0,
	`lastPosition` int NOT NULL DEFAULT 0,
	`totalTimeSpent` int NOT NULL DEFAULT 0,
	`sessionsCount` int NOT NULL DEFAULT 0,
	`isCompleted` boolean NOT NULL DEFAULT false,
	`completedAt` timestamp,
	`firstAccessedAt` timestamp NOT NULL DEFAULT (now()),
	`lastAccessedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `article_reading_progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `articles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`summary` text,
	`category` varchar(100),
	`tags` json,
	`entityId` int,
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`publishedAt` timestamp,
	`publishedBy` int,
	`isRequired` boolean NOT NULL DEFAULT false,
	`requiredForRoles` json,
	`requiredForDepartments` json,
	`dueDate` timestamp,
	`estimatedReadTime` int,
	`attachments` json,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `articles_id` PRIMARY KEY(`id`),
	CONSTRAINT `articles_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `biometric_credentials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`credentialId` varchar(512) NOT NULL,
	`publicKey` text NOT NULL,
	`name` varchar(255) NOT NULL,
	`deviceType` enum('platform','cross-platform') NOT NULL,
	`deviceInfo` varchar(255),
	`counter` bigint NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`lastUsedAt` timestamp,
	CONSTRAINT `biometric_credentials_id` PRIMARY KEY(`id`),
	CONSTRAINT `biometric_credentials_credentialId_unique` UNIQUE(`credentialId`)
);
--> statement-breakpoint
CREATE TABLE `compliance_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`alertType` enum('below_target','approaching_deadline','overdue_spike','target_achieved','escalated') NOT NULL,
	`severity` enum('info','warning','critical') NOT NULL,
	`department` varchar(100) NOT NULL,
	`title` varchar(500) NOT NULL,
	`message` text NOT NULL,
	`currentValue` decimal(10,2),
	`thresholdValue` decimal(10,2),
	`metadata` json,
	`acknowledgedAt` timestamp,
	`acknowledgedBy` int,
	`escalatedAt` timestamp,
	`escalatedFrom` enum('info','warning'),
	`originalAlertId` int,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `compliance_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `consulting_bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerEmail` varchar(320) NOT NULL,
	`customerName` varchar(255) NOT NULL,
	`customerPhone` varchar(50),
	`userId` int,
	`productId` varchar(100) NOT NULL,
	`productName` varchar(255) NOT NULL,
	`sessionDuration` int NOT NULL,
	`amount` varchar(20) NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'USD',
	`stripeSessionId` varchar(255),
	`stripePaymentIntentId` varchar(255),
	`paymentStatus` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`sessionStatus` enum('pending_payment','pending_scheduling','scheduled','completed','cancelled','no_show') NOT NULL DEFAULT 'pending_payment',
	`scheduledAt` timestamp,
	`meetingLink` varchar(500),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `consulting_bookings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `course_completions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`purchaseId` int NOT NULL,
	`customerEmail` varchar(320) NOT NULL,
	`userId` int,
	`courseId` varchar(100) NOT NULL,
	`courseName` varchar(255) NOT NULL,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	`certificateIssued` boolean NOT NULL DEFAULT false,
	`certificateUrl` varchar(500),
	`upsellOffered` boolean NOT NULL DEFAULT false,
	`upsellAccepted` boolean NOT NULL DEFAULT false,
	`upsellProductId` varchar(100),
	CONSTRAINT `course_completions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `course_purchases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerEmail` varchar(320) NOT NULL,
	`customerName` varchar(255),
	`userId` int,
	`productId` varchar(100) NOT NULL,
	`productName` varchar(255) NOT NULL,
	`productType` varchar(50) NOT NULL DEFAULT 'course',
	`amount` varchar(20) NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'USD',
	`stripeSessionId` varchar(255),
	`stripePaymentIntentId` varchar(255),
	`paymentStatus` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`accessGranted` boolean NOT NULL DEFAULT false,
	`accessExpiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `course_purchases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `delegation_escalations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`delegationId` varchar(100) NOT NULL,
	`originalApproverId` int NOT NULL,
	`originalApproverName` varchar(255) NOT NULL,
	`escalatedToId` int NOT NULL,
	`escalatedToName` varchar(255) NOT NULL,
	`escalationLevel` int NOT NULL DEFAULT 1,
	`reason` enum('timeout','manual','priority_change','approver_unavailable') NOT NULL,
	`thresholdHours` int NOT NULL,
	`status` enum('escalated','resolved','further_escalated') NOT NULL DEFAULT 'escalated',
	`escalatedAt` timestamp NOT NULL DEFAULT (now()),
	`resolvedAt` timestamp,
	CONSTRAINT `delegation_escalations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `delegation_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`delegationId` varchar(100) NOT NULL,
	`action` enum('created','accepted','declined','completed','approval_requested','approved','rejected','escalated','cancelled','reassigned') NOT NULL,
	`actorId` int NOT NULL,
	`actorName` varchar(255) NOT NULL,
	`details` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `delegation_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notification_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`notificationType` enum('compliance_alert','signature_reminder','weekly_digest','escalation_notice','system_notification') NOT NULL,
	`channel` enum('email','in_app','push','sms') NOT NULL,
	`recipientUserId` int,
	`recipientEmail` varchar(320),
	`recipientDepartment` varchar(100),
	`subject` varchar(500) NOT NULL,
	`body` text NOT NULL,
	`relatedAlertId` int,
	`relatedRequestId` int,
	`status` enum('pending','sent','delivered','failed','bounced') NOT NULL DEFAULT 'pending',
	`sentAt` timestamp,
	`deliveredAt` timestamp,
	`failedAt` timestamp,
	`failureReason` text,
	`retryCount` int NOT NULL DEFAULT 0,
	`nextRetryAt` timestamp,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notification_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `purchased_course_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`purchaseId` int NOT NULL,
	`customerEmail` varchar(320) NOT NULL,
	`userId` int,
	`courseId` varchar(100) NOT NULL,
	`moduleId` varchar(50) NOT NULL,
	`lessonIndex` int NOT NULL,
	`lessonTitle` varchar(255) NOT NULL,
	`completed` boolean NOT NULL DEFAULT false,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `purchased_course_progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scheduled_compliance_checks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`checkType` enum('daily_threshold','weekly_digest','escalation_check','reminder_processing') NOT NULL,
	`cronExpression` varchar(100),
	`intervalMinutes` int,
	`lastRunAt` timestamp,
	`lastRunStatus` enum('success','partial','failed'),
	`lastRunDuration` int,
	`lastRunResults` json,
	`nextRunAt` timestamp,
	`isEnabled` boolean NOT NULL DEFAULT true,
	`config` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scheduled_compliance_checks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `signature_request_signers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requestId` int NOT NULL,
	`userId` int,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`role` varchar(100),
	`signingOrder` int NOT NULL DEFAULT 1,
	`status` enum('pending','notified','viewed','signed','declined') NOT NULL DEFAULT 'pending',
	`notifiedAt` timestamp,
	`viewedAt` timestamp,
	`signedAt` timestamp,
	`declinedAt` timestamp,
	`signatureType` enum('drawn','typed','uploaded','digital'),
	`signatureData` text,
	`signatureHash` varchar(255),
	`declineReason` text,
	`ipAddress` varchar(45),
	`userAgent` text,
	`remindersSent` int NOT NULL DEFAULT 0,
	`lastReminderAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `signature_request_signers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `translation_contributors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`userName` varchar(255) NOT NULL,
	`totalSuggestions` int NOT NULL DEFAULT 0,
	`approvedSuggestions` int NOT NULL DEFAULT 0,
	`rejectedSuggestions` int NOT NULL DEFAULT 0,
	`totalVotesReceived` int NOT NULL DEFAULT 0,
	`score` int NOT NULL DEFAULT 0,
	`rank` enum('beginner','contributor','expert','master') NOT NULL DEFAULT 'beginner',
	`languages` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `translation_contributors_id` PRIMARY KEY(`id`),
	CONSTRAINT `translation_contributors_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `translation_suggestions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`translationKey` varchar(255) NOT NULL,
	`namespace` varchar(100) NOT NULL,
	`sourceText` text NOT NULL,
	`language` varchar(10) NOT NULL,
	`suggestedText` text NOT NULL,
	`contributorId` int NOT NULL,
	`contributorName` varchar(255) NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`reviewerId` int,
	`reviewerComment` text,
	`reviewedAt` timestamp,
	`votes` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `translation_suggestions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `translation_votes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`suggestionId` int NOT NULL,
	`userId` int NOT NULL,
	`voteType` enum('up','down') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `translation_votes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workflow_template_ratings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`templateId` varchar(100) NOT NULL,
	`rating` int NOT NULL,
	`comment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `workflow_template_ratings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workflow_template_usage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`templateId` varchar(100) NOT NULL,
	`templateName` varchar(255) NOT NULL,
	`templateCategory` varchar(100) NOT NULL,
	`workflowId` varchar(100) NOT NULL,
	`workflowName` varchar(255) NOT NULL,
	`customizations` json,
	`deployedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `workflow_template_usage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` varchar(255);