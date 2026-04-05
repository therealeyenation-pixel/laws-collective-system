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
