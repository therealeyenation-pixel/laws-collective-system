CREATE TABLE `designated_successors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`house_id` int NOT NULL,
	`user_id` int,
	`successor_name` varchar(255) NOT NULL,
	`successor_email` varchar(255),
	`successor_phone` varchar(50),
	`access_level` enum('full','identity_only','legal_only','distribution_only') NOT NULL DEFAULT 'full',
	`priority` int NOT NULL DEFAULT 1,
	`relationship` varchar(100),
	`successor_status` enum('active','revoked','expired') NOT NULL DEFAULT 'active',
	`designated_at` timestamp NOT NULL DEFAULT (now()),
	`revoked_at` timestamp,
	`revoked_reason` text,
	`designated_by_user_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `designated_successors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emergency_vault_access` (
	`id` int AUTO_INCREMENT NOT NULL,
	`house_id` int NOT NULL,
	`requested_by_user_id` int NOT NULL,
	`requested_by_name` varchar(255) NOT NULL,
	`reason` enum('owner_incapacitated','owner_deceased','legal_requirement','succession_transfer','emergency_medical') NOT NULL,
	`reason_details` text,
	`requested_at` timestamp NOT NULL DEFAULT (now()),
	`unlock_at` timestamp NOT NULL,
	`access_status` enum('pending','approved','auto_approved','cancelled','denied','expired','used') NOT NULL DEFAULT 'pending',
	`owner_notified_at` timestamp,
	`owner_response_at` timestamp,
	`owner_response_note` text,
	`access_granted_at` timestamp,
	`access_expires_at` timestamp,
	`fields_accessible` json,
	`ip_address` varchar(45),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `emergency_vault_access_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `house_vault_config` (
	`id` int AUTO_INCREMENT NOT NULL,
	`house_id` int NOT NULL,
	`inherited_from_house_id` int,
	`vault_enabled` boolean NOT NULL DEFAULT true,
	`require_pin_for_access` boolean NOT NULL DEFAULT true,
	`emergency_access_enabled` boolean NOT NULL DEFAULT true,
	`emergency_delay_hours` int NOT NULL DEFAULT 72,
	`emergency_access_window_hours` int NOT NULL DEFAULT 24,
	`encryption_version` int NOT NULL DEFAULT 1,
	`log_all_access` boolean NOT NULL DEFAULT true,
	`notify_owner_on_access` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `house_vault_config_id` PRIMARY KEY(`id`)
);
