-- Migration: Add simulator progress tracking tables
-- Created: 2026-01-20

CREATE TABLE IF NOT EXISTS `department_simulator_progress` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `simulatorId` varchar(50) NOT NULL,
  `moduleId` int NOT NULL,
  `questionsAnswered` int NOT NULL DEFAULT 0,
  `correctAnswers` int NOT NULL DEFAULT 0,
  `isCompleted` boolean NOT NULL DEFAULT false,
  `tokensEarned` int NOT NULL DEFAULT 0,
  `startedAt` timestamp NOT NULL DEFAULT (now()),
  `completedAt` timestamp,
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `department_simulator_progress_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `user_token_balance` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `totalTokens` int NOT NULL DEFAULT 0,
  `lifetimeTokensEarned` int NOT NULL DEFAULT 0,
  `tokensSpent` int NOT NULL DEFAULT 0,
  `lastEarnedAt` timestamp,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `user_token_balance_id` PRIMARY KEY(`id`),
  CONSTRAINT `user_token_balance_userId_unique` UNIQUE(`userId`)
);

CREATE TABLE IF NOT EXISTS `token_transaction_log` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `amount` int NOT NULL,
  `transactionType` enum('earned','spent','bonus','adjustment') NOT NULL,
  `source` varchar(100) NOT NULL,
  `description` text,
  `balanceAfter` int NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `token_transaction_log_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `simulator_certificates` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `simulatorId` varchar(50) NOT NULL,
  `simulatorName` varchar(255) NOT NULL,
  `totalModulesCompleted` int NOT NULL,
  `totalTokensEarned` int NOT NULL,
  `averageScore` decimal(5,2) NOT NULL,
  `certificateHash` varchar(64) NOT NULL,
  `issuedAt` timestamp NOT NULL DEFAULT (now()),
  `expiresAt` timestamp,
  `verificationUrl` text,
  CONSTRAINT `simulator_certificates_id` PRIMARY KEY(`id`),
  CONSTRAINT `simulator_certificates_certificateHash_unique` UNIQUE(`certificateHash`)
);

-- Add indexes for better query performance
CREATE INDEX `idx_simulator_progress_user` ON `department_simulator_progress` (`userId`);
CREATE INDEX `idx_simulator_progress_simulator` ON `department_simulator_progress` (`simulatorId`);
CREATE INDEX `idx_token_transactions_user` ON `token_transaction_log` (`userId`);
CREATE INDEX `idx_simulator_certificates_user` ON `simulator_certificates` (`userId`);
