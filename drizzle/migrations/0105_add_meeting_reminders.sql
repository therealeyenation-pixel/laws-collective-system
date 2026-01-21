-- Add meeting_reminders table for tracking sent reminders
CREATE TABLE IF NOT EXISTS `meeting_reminders` (
  `id` int AUTO_INCREMENT NOT NULL,
  `meetingId` int NOT NULL,
  `reminderType` enum('15_min','1_hour','24_hour') NOT NULL,
  `sentAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `recipientCount` int DEFAULT 0,
  CONSTRAINT `meeting_reminders_id` PRIMARY KEY(`id`)
);
