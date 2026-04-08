CREATE TABLE `activation_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`total_simulators_required` int NOT NULL DEFAULT 6,
	`simulators_completed` int NOT NULL DEFAULT 0,
	`activation_status` enum('not_started','in_progress','ready_for_activation','activated','suspended') NOT NULL DEFAULT 'not_started',
	`activation_ready_at` timestamp,
	`activated_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `activation_progress_id` PRIMARY KEY(`id`),
	CONSTRAINT `activation_progress_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `build_linkage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cloned_build_id` int NOT NULL,
	`master_build_id` int NOT NULL,
	`linkage_type` enum('parent_child','template_instance','master_clone') NOT NULL DEFAULT 'parent_child',
	`luvledger_entry_id` varchar(255),
	`linked_at` timestamp NOT NULL DEFAULT (now()),
	`verified_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `build_linkage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cloned_builds` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`master_build_id` int NOT NULL,
	`clone_status` enum('pending','provisioning','active','suspended','archived') NOT NULL DEFAULT 'pending',
	`house_id` int,
	`business_type` varchar(100),
	`business_name` varchar(255),
	`simulator_data_json` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`activated_at` timestamp,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cloned_builds_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `simulator_completion` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`simulator_type` enum('business','grants','proposals','contracts','real_eye_nation','other') NOT NULL,
	`completed_at` timestamp NOT NULL,
	`certificate_id` varchar(255),
	`score` int,
	`certificate_url` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `simulator_completion_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `activation_progress` ADD CONSTRAINT `activation_progress_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `build_linkage` ADD CONSTRAINT `build_linkage_cloned_build_id_cloned_builds_id_fk` FOREIGN KEY (`cloned_build_id`) REFERENCES `cloned_builds`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cloned_builds` ADD CONSTRAINT `cloned_builds_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cloned_builds` ADD CONSTRAINT `cloned_builds_house_id_houses_id_fk` FOREIGN KEY (`house_id`) REFERENCES `houses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `simulator_completion` ADD CONSTRAINT `simulator_completion_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;