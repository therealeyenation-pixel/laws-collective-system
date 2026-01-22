-- Auto-Update Infrastructure Tables

-- Sync Configurations - Define what syncs and when
CREATE TABLE IF NOT EXISTS `sync_configurations` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `syncName` varchar(100) NOT NULL UNIQUE,
  `sourceType` enum('luvledger', 'payroll', 'documents', 'entities', 'houses', 'tokens', 'positions', 'heirs', 'funds', 'properties') NOT NULL,
  `targetType` enum('luvledger', 'payroll', 'documents', 'entities', 'houses', 'tokens', 'positions', 'heirs', 'funds', 'properties', 'all') NOT NULL,
  `syncInterval` enum('realtime', 'hourly', 'daily', 'weekly', 'monthly', 'manual') NOT NULL DEFAULT 'daily',
  `cronExpression` varchar(50),
  `cascadeUpdates` boolean NOT NULL DEFAULT true,
  `conflictResolution` enum('source_wins', 'target_wins', 'newest_wins', 'manual') NOT NULL DEFAULT 'source_wins',
  `isEnabled` boolean NOT NULL DEFAULT true,
  `priority` int NOT NULL DEFAULT 5,
  `description` text,
  `lastRunAt` timestamp,
  `nextRunAt` timestamp,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Sync Events - History of all sync operations
CREATE TABLE IF NOT EXISTS `sync_events` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `configId` int,
  `syncType` varchar(100) NOT NULL,
  `triggeredBy` enum('schedule', 'data_change', 'manual', 'cascade', 'system') NOT NULL,
  `triggeredByUserId` int,
  `triggerSource` varchar(255),
  `status` enum('pending', 'running', 'completed', 'failed', 'cancelled', 'partial') NOT NULL DEFAULT 'pending',
  `recordsProcessed` int DEFAULT 0,
  `recordsSucceeded` int DEFAULT 0,
  `recordsFailed` int DEFAULT 0,
  `recordsSkipped` int DEFAULT 0,
  `startedAt` timestamp,
  `completedAt` timestamp,
  `durationMs` int,
  `errorMessage` text,
  `errorDetails` json,
  `changesSummary` json,
  `rollbackAvailable` boolean DEFAULT true,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Sync Dependencies - Define cascade relationships
CREATE TABLE IF NOT EXISTS `sync_dependencies` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `parentType` varchar(100) NOT NULL,
  `parentAction` enum('create', 'update', 'delete', 'any') NOT NULL DEFAULT 'any',
  `childType` varchar(100) NOT NULL,
  `childAction` enum('sync', 'recalculate', 'notify', 'validate') NOT NULL DEFAULT 'sync',
  `conditionExpression` text,
  `delaySeconds` int DEFAULT 0,
  `priority` int NOT NULL DEFAULT 5,
  `isEnabled` boolean NOT NULL DEFAULT true,
  `description` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Data Versions - Track changes to data for sync purposes
CREATE TABLE IF NOT EXISTS `data_versions` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `entityType` varchar(100) NOT NULL,
  `entityId` int NOT NULL,
  `versionNumber` int NOT NULL,
  `previousVersionId` int,
  `changeType` enum('create', 'update', 'delete') NOT NULL,
  `changedFields` json,
  `previousValues` json,
  `newValues` json,
  `changedByUserId` int,
  `changedBySystem` varchar(100),
  `syncStatus` enum('pending', 'synced', 'failed', 'skipped') NOT NULL DEFAULT 'pending',
  `syncedAt` timestamp,
  `dataHash` varchar(64),
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Sync Conflicts - Track and resolve sync conflicts
CREATE TABLE IF NOT EXISTS `sync_conflicts` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `syncEventId` int NOT NULL,
  `entityType` varchar(100) NOT NULL,
  `entityId` int NOT NULL,
  `fieldName` varchar(100),
  `sourceValue` json,
  `targetValue` json,
  `conflictType` enum('value_mismatch', 'concurrent_edit', 'missing_source', 'missing_target', 'type_mismatch', 'constraint_violation') NOT NULL,
  `status` enum('pending', 'auto_resolved', 'manually_resolved', 'ignored') NOT NULL DEFAULT 'pending',
  `resolution` enum('use_source', 'use_target', 'merge', 'skip', 'custom'),
  `resolvedValue` json,
  `resolvedByUserId` int,
  `resolvedAt` timestamp,
  `notes` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Auto-Update Rules - Define automatic update behaviors
CREATE TABLE IF NOT EXISTS `auto_update_rules` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `ruleName` varchar(100) NOT NULL UNIQUE,
  `triggerEntity` varchar(100) NOT NULL,
  `triggerField` varchar(100),
  `triggerCondition` json,
  `targetEntity` varchar(100) NOT NULL,
  `targetField` varchar(100),
  `updateFormula` text,
  `isEnabled` boolean NOT NULL DEFAULT true,
  `requiresApproval` boolean DEFAULT false,
  `notifyOnUpdate` boolean DEFAULT true,
  `description` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Sync Notifications - Notifications about sync events
CREATE TABLE IF NOT EXISTS `sync_notifications` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `syncEventId` int,
  `conflictId` int,
  `notificationType` enum('sync_complete', 'sync_failed', 'conflict_detected', 'conflict_resolved', 'manual_review_needed', 'system_alert') NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `severity` enum('info', 'warning', 'error', 'critical') DEFAULT 'info',
  `recipientUserId` int,
  `recipientRole` varchar(50),
  `isRead` boolean DEFAULT false,
  `readAt` timestamp,
  `actionUrl` text,
  `actionLabel` varchar(100),
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_sync_events_config ON sync_events(configId);
CREATE INDEX idx_sync_events_status ON sync_events(status);
CREATE INDEX idx_data_versions_entity ON data_versions(entityType, entityId);
CREATE INDEX idx_data_versions_sync ON data_versions(syncStatus);
CREATE INDEX idx_sync_conflicts_event ON sync_conflicts(syncEventId);
CREATE INDEX idx_sync_conflicts_status ON sync_conflicts(status);
CREATE INDEX idx_sync_notifications_user ON sync_notifications(recipientUserId);
CREATE INDEX idx_sync_notifications_read ON sync_notifications(isRead);
