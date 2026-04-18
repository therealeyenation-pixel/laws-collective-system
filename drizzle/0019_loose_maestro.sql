CREATE TABLE `laws_onboarding_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`step_key` varchar(50) NOT NULL,
	`step_number` int NOT NULL,
	`laws_onboarding_status` enum('not_started','in_progress','completed','skipped') NOT NULL DEFAULT 'not_started',
	`completed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `laws_onboarding_progress_id` PRIMARY KEY(`id`)
);
