ALTER TABLE `gift_tokens` ADD `redemptionCode` varchar(32);--> statement-breakpoint
ALTER TABLE `gift_tokens` ADD `deliveryMethod` enum('email','qr_code','direct_link','in_person');--> statement-breakpoint
ALTER TABLE `gift_tokens` ADD `deliveryStatus` enum('pending','sent','delivered','failed') DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `gift_tokens` ADD `deliverySentAt` timestamp;--> statement-breakpoint
ALTER TABLE `waitlist_signups` ADD `fullName` varchar(255);--> statement-breakpoint
ALTER TABLE `waitlist_signups` ADD `interestCategories` json;--> statement-breakpoint
ALTER TABLE `waitlist_signups` ADD `referralCode` varchar(32);--> statement-breakpoint
ALTER TABLE `gift_tokens` ADD CONSTRAINT `gift_tokens_redemptionCode_unique` UNIQUE(`redemptionCode`);