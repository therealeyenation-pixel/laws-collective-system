CREATE TABLE `identity_vault` (
	`id` int AUTO_INCREMENT NOT NULL,
	`house_id` int NOT NULL,
	`house_member_id` int,
	`heir_id` int,
	`display_alias` varchar(255) NOT NULL,
	`display_role` varchar(100),
	`encrypted_legal_name` text,
	`encrypted_ssn` text,
	`encrypted_dob` text,
	`encrypted_address` text,
	`encrypted_phone` text,
	`encrypted_email` text,
	`encrypted_notes` text,
	`encrypted_trust_beneficiary` text,
	`inheritance_percentage` decimal(5,2),
	`inheritance_order` int,
	`relationship` enum('self','spouse','child','grandchild','sibling','niece_nephew','cousin','adopted','guardian_ward','other') NOT NULL,
	`last_accessed_at` timestamp,
	`last_accessed_by` int,
	`access_count` int NOT NULL DEFAULT 0,
	`encryption_version` int NOT NULL DEFAULT 1,
	`encryption_key_id` varchar(100),
	`vault_status` enum('active','locked','archived') NOT NULL DEFAULT 'active',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `identity_vault_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `system_config` (
	`id` int AUTO_INCREMENT NOT NULL,
	`config_key` varchar(100) NOT NULL,
	`config_value` text NOT NULL,
	`config_type` enum('string','boolean','number','json') NOT NULL DEFAULT 'string',
	`description` text,
	`updated_by_user_id` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `system_config_id` PRIMARY KEY(`id`),
	CONSTRAINT `system_config_config_key_unique` UNIQUE(`config_key`)
);
--> statement-breakpoint
CREATE TABLE `vault_access_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`house_id` int NOT NULL,
	`vault_entry_id` int NOT NULL,
	`accessed_by_user_id` int NOT NULL,
	`access_type` enum('view','create','update','export','emergency') NOT NULL,
	`fields_accessed` json,
	`ip_address` varchar(45),
	`user_agent` text,
	`auth_method` enum('vault_pin','password_reentry','biometric','emergency_key') NOT NULL,
	`accessed_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vault_access_log_id` PRIMARY KEY(`id`)
);
