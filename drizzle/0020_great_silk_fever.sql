ALTER TABLE `token_activation_attempts` MODIFY COLUMN `scrollsRequired` json;--> statement-breakpoint
ALTER TABLE `token_activation_attempts` MODIFY COLUMN `scrollsSealed` json;--> statement-breakpoint
ALTER TABLE `token_activation_attempts` MODIFY COLUMN `scrollsMissing` json;--> statement-breakpoint
ALTER TABLE `token_activation_attempts` MODIFY COLUMN `currentChain` json;--> statement-breakpoint
ALTER TABLE `token_chain_states` MODIFY COLUMN `activatedTokens` json;--> statement-breakpoint
ALTER TABLE `token_chain_states` MODIFY COLUMN `mirrorScrollsSealed` json;--> statement-breakpoint
ALTER TABLE `token_chain_states` MODIFY COLUMN `giftScrollsSealed` json;--> statement-breakpoint
ALTER TABLE `token_chain_states` MODIFY COLUMN `sparkScrollsSealed` json;--> statement-breakpoint
ALTER TABLE `token_chain_states` MODIFY COLUMN `houseScrollsSealed` json;--> statement-breakpoint
ALTER TABLE `token_locks` MODIFY COLUMN `requiredScrolls` json;--> statement-breakpoint
ALTER TABLE `token_locks` MODIFY COLUMN `sealedScrolls` json;--> statement-breakpoint
ALTER TABLE `token_locks` MODIFY COLUMN `violationDetails` json;