ALTER TABLE `contractor_transitions` ADD `transitionType` enum('founding_member','coordinator','standard') DEFAULT 'standard' NOT NULL;--> statement-breakpoint
ALTER TABLE `contractor_transitions` ADD `boardMemberEligible` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `contractor_transitions` ADD `twoYearEligibilityDate` timestamp;--> statement-breakpoint
ALTER TABLE `contractor_transitions` ADD `profitSharePercent` decimal(5,2);