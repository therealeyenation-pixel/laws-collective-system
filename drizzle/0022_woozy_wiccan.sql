CREATE TABLE `support_tickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`source_agent_type` varchar(64) NOT NULL,
	`source_page` varchar(255),
	`subject` varchar(255) NOT NULL,
	`original_context` json,
	`ticket_status` enum('open','in_progress','resolved','needs_review','closed') NOT NULL DEFAULT 'open',
	`resolution_summary` text,
	`ticket_priority` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`category` varchar(100),
	`resolved_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `support_tickets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ticket_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticket_id` int NOT NULL,
	`ticket_msg_role` enum('user','assistant','system') NOT NULL,
	`content` text NOT NULL,
	`metadata` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ticket_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `agents` MODIFY COLUMN `type` enum('operations','support','education','analytics','guardian','finance','media','outreach','seo','engagement','hr','qaqc','purchasing','health','design','it','contracts','procurement','property','real_estate','project_controls','business','legal','academy_qa','house_qa','system_qa','tech_support','custom') NOT NULL;