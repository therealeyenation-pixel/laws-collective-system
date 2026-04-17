ALTER TABLE `onboarding_journeys` ADD `createdAt` timestamp DEFAULT (now()) NOT NULL;--> statement-breakpoint
ALTER TABLE `onboarding_journeys` ADD `updatedAt` timestamp DEFAULT (now()) NOT NULL;--> statement-breakpoint
ALTER TABLE `onboarding_journeys` ADD `valuesAgreed` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `onboarding_journeys` ADD `houseId` int;