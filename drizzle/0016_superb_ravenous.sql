ALTER TABLE `users` ADD `memberStatus` enum('onboarding','academy_active','formation_in_progress','house_activated') DEFAULT 'onboarding' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `formationStep` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `houseActivatedAt` timestamp;