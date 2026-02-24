DROP TABLE `alert_escalation_rules`;--> statement-breakpoint
DROP TABLE `article_assignments`;--> statement-breakpoint
DROP TABLE `article_reading_progress`;--> statement-breakpoint
DROP TABLE `articles`;--> statement-breakpoint
DROP TABLE `biometric_credentials`;--> statement-breakpoint
DROP TABLE `compliance_alerts`;--> statement-breakpoint
DROP TABLE `delegation_escalations`;--> statement-breakpoint
DROP TABLE `delegation_history`;--> statement-breakpoint
DROP TABLE `notification_logs`;--> statement-breakpoint
DROP TABLE `scheduled_compliance_checks`;--> statement-breakpoint
DROP TABLE `signature_request_signers`;--> statement-breakpoint
DROP TABLE `translation_contributors`;--> statement-breakpoint
DROP TABLE `translation_suggestions`;--> statement-breakpoint
DROP TABLE `translation_votes`;--> statement-breakpoint
DROP TABLE `workflow_template_ratings`;--> statement-breakpoint
DROP TABLE `workflow_template_usage`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `passwordHash`;