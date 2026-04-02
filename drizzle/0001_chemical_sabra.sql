CREATE TABLE `ad_placements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`episodeId` int NOT NULL,
	`sponsorshipId` int,
	`position` int,
	`type` enum('pre_roll','mid_roll','post_roll','native') NOT NULL,
	`impressions` int DEFAULT 0,
	`clicks` int DEFAULT 0,
	`ctr` decimal(5,2) DEFAULT '0',
	`revenue` decimal(12,2) DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ad_placements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `asset_allocations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`portfolioId` int NOT NULL,
	`assetClass` varchar(100) NOT NULL,
	`targetPercent` decimal(5,2) NOT NULL,
	`currentPercent` decimal(5,2) DEFAULT '0',
	`currentValue` decimal(15,2) DEFAULT '0',
	`minPercent` decimal(5,2),
	`maxPercent` decimal(5,2),
	`rebalanceThreshold` decimal(5,2) DEFAULT '5',
	`lastRebalanced` timestamp,
	CONSTRAINT `asset_allocations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `broadcast_analytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`channelId` int NOT NULL,
	`episodeId` int,
	`analyticsDate` timestamp NOT NULL,
	`newListeners` int DEFAULT 0,
	`returningListeners` int DEFAULT 0,
	`totalListeningTime` int DEFAULT 0,
	`averageListeningTime` decimal(10,2) DEFAULT '0',
	`downloads` int DEFAULT 0,
	`streams` int DEFAULT 0,
	`likes` int DEFAULT 0,
	`comments` int DEFAULT 0,
	`shares` int DEFAULT 0,
	`topCountries` json,
	`topDevices` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `broadcast_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `broadcast_channels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`category` enum('education','business','finance','health','entertainment','news','technology','culture','other') NOT NULL,
	`language` varchar(10) DEFAULT 'en',
	`status` enum('draft','active','paused','archived') DEFAULT 'draft',
	`coverImageUrl` text,
	`bannerImageUrl` text,
	`websiteUrl` text,
	`socialLinks` json,
	`broadcastFormat` enum('podcast','live_radio','hybrid') NOT NULL,
	`isMonetized` boolean DEFAULT false,
	`monetizationTier` enum('free','basic','premium') DEFAULT 'free',
	`totalEpisodes` int DEFAULT 0,
	`totalListeners` int DEFAULT 0,
	`totalDownloads` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `broadcast_channels_id` PRIMARY KEY(`id`),
	CONSTRAINT `broadcast_channels_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `broadcast_episodes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`channelId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`audioUrl` text NOT NULL,
	`audioFormat` varchar(20) DEFAULT 'mp3',
	`audioDuration` int NOT NULL,
	`audioFileSize` int,
	`episodeNumber` int,
	`seasonNumber` int DEFAULT 1,
	`transcript` text,
	`showNotes` text,
	`guestName` varchar(255),
	`guestBio` text,
	`status` enum('draft','scheduled','published','archived') DEFAULT 'draft',
	`publishedAt` timestamp,
	`scheduledPublishAt` timestamp,
	`viewCount` int DEFAULT 0,
	`downloadCount` int DEFAULT 0,
	`likeCount` int DEFAULT 0,
	`commentCount` int DEFAULT 0,
	`hasAds` boolean DEFAULT false,
	`adBreakPositions` json,
	`sponsorshipInfo` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `broadcast_episodes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `broadcast_listeners` (
	`id` int AUTO_INCREMENT NOT NULL,
	`channelId` int NOT NULL,
	`userId` int NOT NULL,
	`subscriptionStatus` enum('subscribed','unsubscribed') DEFAULT 'subscribed',
	`subscriptionTier` enum('free','basic','premium') DEFAULT 'free',
	`totalListeningTime` int DEFAULT 0,
	`episodesListened` int DEFAULT 0,
	`lastListenedAt` timestamp,
	`notificationsEnabled` boolean DEFAULT true,
	`autoDownload` boolean DEFAULT false,
	`playbackSpeed` decimal(3,2) DEFAULT '1.00',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `broadcast_listeners_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `broadcast_notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`channelId` int NOT NULL,
	`episodeId` int,
	`type` enum('new_episode','live_broadcast','channel_update','special_announcement','exclusive_content') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text,
	`isRead` boolean DEFAULT false,
	`readAt` timestamp,
	`sentVia` enum('email','push','in_app') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `broadcast_notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `broadcast_schedules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`channelId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`recurrencePattern` enum('daily','weekly','biweekly','monthly','custom') NOT NULL,
	`dayOfWeek` varchar(50),
	`dayOfMonth` int,
	`customCronExpression` varchar(255),
	`publishTime` varchar(10),
	`timezone` varchar(50) DEFAULT 'UTC',
	`isActive` boolean DEFAULT true,
	`startDate` timestamp,
	`endDate` timestamp,
	`autoPublish` boolean DEFAULT true,
	`notifySubscribers` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `broadcast_schedules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dividend_income` (
	`id` int AUTO_INCREMENT NOT NULL,
	`portfolioId` int NOT NULL,
	`symbol` varchar(20) NOT NULL,
	`dividendDate` timestamp NOT NULL,
	`exDividendDate` timestamp,
	`paymentDate` timestamp,
	`dividendPerShare` decimal(15,4) NOT NULL,
	`quantity` decimal(15,8) NOT NULL,
	`totalDividend` decimal(15,2) NOT NULL,
	`dividendType` enum('ordinary','special','return_of_capital') DEFAULT 'ordinary',
	`notes` text,
	CONSTRAINT `dividend_income_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `episode_interactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`episodeId` int NOT NULL,
	`userId` int NOT NULL,
	`listeningTime` int DEFAULT 0,
	`completionPercent` decimal(5,2) DEFAULT '0',
	`isCompleted` boolean DEFAULT false,
	`liked` boolean DEFAULT false,
	`shared` boolean DEFAULT false,
	`downloaded` boolean DEFAULT false,
	`rating` int,
	`comment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `episode_interactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `holdings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`portfolioId` int NOT NULL,
	`symbol` varchar(20) NOT NULL,
	`assetType` enum('stock','bond','etf','mutual_fund','cryptocurrency','real_estate','commodity','option','other') NOT NULL,
	`quantity` decimal(15,8) NOT NULL,
	`purchasePrice` decimal(15,2) NOT NULL,
	`purchaseDate` timestamp NOT NULL,
	`currentPrice` decimal(15,2),
	`currentValue` decimal(15,2),
	`gainLoss` decimal(15,2),
	`gainLossPercent` decimal(8,2),
	`dividendYield` decimal(8,2),
	`sector` varchar(100),
	`notes` text,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `holdings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `investment_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`portfolioId` int,
	`symbol` varchar(20),
	`alertType` enum('price_above','price_below','percent_gain','percent_loss','dividend','earnings','portfolio_milestone','rebalance_needed') NOT NULL,
	`threshold` decimal(15,2),
	`isActive` boolean DEFAULT true,
	`triggered` boolean DEFAULT false,
	`triggeredAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `investment_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `investment_goals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`portfolioId` int NOT NULL,
	`goalName` varchar(255) NOT NULL,
	`goalType` enum('retirement','education','home','vacation','emergency_fund','wealth_building','other') NOT NULL,
	`targetAmount` decimal(15,2) NOT NULL,
	`currentAmount` decimal(15,2) DEFAULT '0',
	`targetDate` timestamp,
	`priority` enum('low','medium','high') DEFAULT 'medium',
	`status` enum('not_started','in_progress','on_track','at_risk','completed') DEFAULT 'not_started',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `investment_goals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `investment_portfolios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`portfolioType` enum('personal','retirement','education','trading','long_term','other') DEFAULT 'personal',
	`totalValue` decimal(15,2) DEFAULT '0',
	`investedAmount` decimal(15,2) DEFAULT '0',
	`gainLoss` decimal(15,2) DEFAULT '0',
	`gainLossPercent` decimal(8,2) DEFAULT '0',
	`currency` varchar(3) DEFAULT 'USD',
	`isActive` boolean DEFAULT true,
	`riskProfile` enum('conservative','moderate','aggressive') DEFAULT 'moderate',
	`targetAllocation` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `investment_portfolios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `investment_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`portfolioId` int NOT NULL,
	`holdingId` int,
	`transactionType` enum('buy','sell','dividend','split','spin_off','deposit','withdrawal','fee') NOT NULL,
	`symbol` varchar(20) NOT NULL,
	`quantity` decimal(15,8),
	`price` decimal(15,2),
	`amount` decimal(15,2) NOT NULL,
	`commission` decimal(15,2) DEFAULT '0',
	`notes` text,
	`transactionDate` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `investment_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `live_broadcasts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`channelId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`streamUrl` text,
	`streamKey` varchar(255),
	`rtmpUrl` text,
	`scheduledStartTime` timestamp NOT NULL,
	`scheduledEndTime` timestamp,
	`actualStartTime` timestamp,
	`actualEndTime` timestamp,
	`status` enum('scheduled','live','ended','cancelled') DEFAULT 'scheduled',
	`isRecorded` boolean DEFAULT true,
	`recordingUrl` text,
	`currentViewers` int DEFAULT 0,
	`peakViewers` int DEFAULT 0,
	`totalViewers` int DEFAULT 0,
	`allowChat` boolean DEFAULT true,
	`allowComments` boolean DEFAULT true,
	`isMonetized` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `live_broadcasts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `market_data` (
	`id` int AUTO_INCREMENT NOT NULL,
	`symbol` varchar(20) NOT NULL,
	`assetType` enum('stock','bond','etf','mutual_fund','cryptocurrency','commodity','index','other') NOT NULL,
	`name` varchar(255) NOT NULL,
	`currentPrice` decimal(15,2) NOT NULL,
	`previousClose` decimal(15,2),
	`dayChange` decimal(15,2),
	`dayChangePercent` decimal(8,2),
	`yearHigh` decimal(15,2),
	`yearLow` decimal(15,2),
	`marketCap` decimal(20,2),
	`peRatio` decimal(8,2),
	`dividendYield` decimal(8,2),
	`volume` bigint,
	`averageVolume` bigint,
	`exchange` varchar(50),
	`currency` varchar(3) DEFAULT 'USD',
	`lastUpdated` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `market_data_id` PRIMARY KEY(`id`),
	CONSTRAINT `market_data_symbol_unique` UNIQUE(`symbol`)
);
--> statement-breakpoint
CREATE TABLE `performance_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`portfolioId` int NOT NULL,
	`reportDate` timestamp NOT NULL,
	`totalValue` decimal(15,2) NOT NULL,
	`investedAmount` decimal(15,2) NOT NULL,
	`gainLoss` decimal(15,2) NOT NULL,
	`gainLossPercent` decimal(8,2) NOT NULL,
	`returnYTD` decimal(8,2),
	`return1Year` decimal(8,2),
	`return3Year` decimal(8,2),
	`return5Year` decimal(8,2),
	`volatility` decimal(8,2),
	`sharpeRatio` decimal(8,2),
	`maxDrawdown` decimal(8,2),
	`allocationBreakdown` json,
	`topHoldings` json,
	CONSTRAINT `performance_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `price_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`symbol` varchar(20) NOT NULL,
	`date` timestamp NOT NULL,
	`openPrice` decimal(15,2),
	`highPrice` decimal(15,2),
	`lowPrice` decimal(15,2),
	`closePrice` decimal(15,2) NOT NULL,
	`volume` bigint,
	`adjustedClose` decimal(15,2),
	CONSTRAINT `price_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sponsorships` (
	`id` int AUTO_INCREMENT NOT NULL,
	`channelId` int NOT NULL,
	`episodeId` int,
	`sponsorName` varchar(255) NOT NULL,
	`sponsorWebsite` text,
	`sponsorLogo` text,
	`dealType` enum('pre_roll','mid_roll','post_roll','native') NOT NULL,
	`adScript` text,
	`adDuration` int,
	`amount` decimal(12,2) NOT NULL,
	`currency` varchar(3) DEFAULT 'USD',
	`status` enum('draft','active','completed','cancelled') DEFAULT 'draft',
	`startDate` timestamp,
	`endDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sponsorships_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `watchlist_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`symbol` varchar(20) NOT NULL,
	`assetType` enum('stock','etf','cryptocurrency','commodity','other') NOT NULL,
	`targetPrice` decimal(15,2),
	`notes` text,
	`addedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `watchlist_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `ad_placements_episodeId_idx` ON `ad_placements` (`episodeId`);--> statement-breakpoint
CREATE INDEX `ad_placements_sponsorshipId_idx` ON `ad_placements` (`sponsorshipId`);--> statement-breakpoint
CREATE INDEX `asset_allocations_portfolioId_idx` ON `asset_allocations` (`portfolioId`);--> statement-breakpoint
CREATE INDEX `broadcast_analytics_channelId_idx` ON `broadcast_analytics` (`channelId`);--> statement-breakpoint
CREATE INDEX `broadcast_analytics_episodeId_idx` ON `broadcast_analytics` (`episodeId`);--> statement-breakpoint
CREATE INDEX `broadcast_analytics_analyticsDate_idx` ON `broadcast_analytics` (`analyticsDate`);--> statement-breakpoint
CREATE INDEX `broadcast_channels_userId_idx` ON `broadcast_channels` (`userId`);--> statement-breakpoint
CREATE INDEX `broadcast_channels_slug_idx` ON `broadcast_channels` (`slug`);--> statement-breakpoint
CREATE INDEX `broadcast_episodes_channelId_idx` ON `broadcast_episodes` (`channelId`);--> statement-breakpoint
CREATE INDEX `broadcast_episodes_status_idx` ON `broadcast_episodes` (`status`);--> statement-breakpoint
CREATE INDEX `broadcast_episodes_publishedAt_idx` ON `broadcast_episodes` (`publishedAt`);--> statement-breakpoint
CREATE INDEX `broadcast_listeners_channelId_idx` ON `broadcast_listeners` (`channelId`);--> statement-breakpoint
CREATE INDEX `broadcast_listeners_userId_idx` ON `broadcast_listeners` (`userId`);--> statement-breakpoint
CREATE INDEX `broadcast_notifications_userId_idx` ON `broadcast_notifications` (`userId`);--> statement-breakpoint
CREATE INDEX `broadcast_notifications_channelId_idx` ON `broadcast_notifications` (`channelId`);--> statement-breakpoint
CREATE INDEX `broadcast_schedules_channelId_idx` ON `broadcast_schedules` (`channelId`);--> statement-breakpoint
CREATE INDEX `dividend_income_portfolioId_idx` ON `dividend_income` (`portfolioId`);--> statement-breakpoint
CREATE INDEX `dividend_income_symbol_idx` ON `dividend_income` (`symbol`);--> statement-breakpoint
CREATE INDEX `episode_interactions_episodeId_idx` ON `episode_interactions` (`episodeId`);--> statement-breakpoint
CREATE INDEX `episode_interactions_userId_idx` ON `episode_interactions` (`userId`);--> statement-breakpoint
CREATE INDEX `holdings_portfolioId_idx` ON `holdings` (`portfolioId`);--> statement-breakpoint
CREATE INDEX `holdings_symbol_idx` ON `holdings` (`symbol`);--> statement-breakpoint
CREATE INDEX `investment_alerts_userId_idx` ON `investment_alerts` (`userId`);--> statement-breakpoint
CREATE INDEX `investment_alerts_portfolioId_idx` ON `investment_alerts` (`portfolioId`);--> statement-breakpoint
CREATE INDEX `investment_goals_portfolioId_idx` ON `investment_goals` (`portfolioId`);--> statement-breakpoint
CREATE INDEX `investment_portfolios_userId_idx` ON `investment_portfolios` (`userId`);--> statement-breakpoint
CREATE INDEX `investment_transactions_portfolioId_idx` ON `investment_transactions` (`portfolioId`);--> statement-breakpoint
CREATE INDEX `investment_transactions_transactionDate_idx` ON `investment_transactions` (`transactionDate`);--> statement-breakpoint
CREATE INDEX `live_broadcasts_channelId_idx` ON `live_broadcasts` (`channelId`);--> statement-breakpoint
CREATE INDEX `live_broadcasts_status_idx` ON `live_broadcasts` (`status`);--> statement-breakpoint
CREATE INDEX `live_broadcasts_scheduledStartTime_idx` ON `live_broadcasts` (`scheduledStartTime`);--> statement-breakpoint
CREATE INDEX `market_data_symbol_idx` ON `market_data` (`symbol`);--> statement-breakpoint
CREATE INDEX `market_data_assetType_idx` ON `market_data` (`assetType`);--> statement-breakpoint
CREATE INDEX `performance_reports_portfolioId_idx` ON `performance_reports` (`portfolioId`);--> statement-breakpoint
CREATE INDEX `performance_reports_reportDate_idx` ON `performance_reports` (`reportDate`);--> statement-breakpoint
CREATE INDEX `price_history_symbol_date_idx` ON `price_history` (`symbol`,`date`);--> statement-breakpoint
CREATE INDEX `sponsorships_channelId_idx` ON `sponsorships` (`channelId`);--> statement-breakpoint
CREATE INDEX `sponsorships_episodeId_idx` ON `sponsorships` (`episodeId`);--> statement-breakpoint
CREATE INDEX `watchlist_items_userId_idx` ON `watchlist_items` (`userId`);--> statement-breakpoint
CREATE INDEX `watchlist_items_symbol_idx` ON `watchlist_items` (`symbol`);