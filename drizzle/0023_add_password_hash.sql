-- Add passwordHash column for standalone authentication
ALTER TABLE `users` ADD COLUMN `passwordHash` varchar(255) NULL;
