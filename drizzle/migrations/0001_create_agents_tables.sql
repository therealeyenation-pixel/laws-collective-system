-- Create agents table
CREATE TABLE IF NOT EXISTS `agents` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(100) NOT NULL,
  `type` enum('operations','support','education','analytics','guardian','finance','media','outreach','seo','engagement','custom') NOT NULL,
  `description` text,
  `avatar` varchar(500),
  `systemPrompt` text NOT NULL,
  `capabilities` json,
  `entityId` int,
  `isActive` boolean DEFAULT true,
  `isPublic` boolean DEFAULT false,
  `createdBy` int,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
);

-- Create agent_conversations table
CREATE TABLE IF NOT EXISTS `agent_conversations` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `agentId` int NOT NULL,
  `userId` int NOT NULL,
  `title` varchar(255),
  `status` enum('active','archived','deleted') DEFAULT 'active',
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
);

-- Create agent_messages table
CREATE TABLE IF NOT EXISTS `agent_messages` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `conversationId` int NOT NULL,
  `role` enum('user','assistant','system') NOT NULL,
  `content` text NOT NULL,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create agent_actions table
CREATE TABLE IF NOT EXISTS `agent_actions` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `agentId` int NOT NULL,
  `actionType` varchar(100) NOT NULL,
  `actionData` json,
  `status` enum('pending','completed','failed') DEFAULT 'pending',
  `result` json,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `completedAt` timestamp
);

-- Create scheduled_agent_tasks table
CREATE TABLE IF NOT EXISTS `scheduled_agent_tasks` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `agentId` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `schedule` varchar(100) NOT NULL,
  `taskType` varchar(100) NOT NULL,
  `taskConfig` json,
  `isActive` boolean DEFAULT true,
  `lastRunAt` timestamp,
  `nextRunAt` timestamp,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
);
