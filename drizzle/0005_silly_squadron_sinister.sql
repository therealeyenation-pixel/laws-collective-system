CREATE TABLE `vod_episodes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`seriesId` int NOT NULL,
	`seasonNumber` int NOT NULL,
	`episodeNumber` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`duration` int,
	`releaseDate` date,
	`videoUrl` text NOT NULL,
	`thumbnailUrl` text,
	`viewCount` int DEFAULT 0,
	`isPublished` boolean DEFAULT true,
	`isAvailable` boolean DEFAULT true,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vod_episodes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vod_movies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`genre` varchar(100) NOT NULL,
	`subgenre` varchar(100),
	`director` varchar(255),
	`cast` text,
	`releaseYear` int,
	`duration` int,
	`contentRating` enum('G','PG','PG-13','R','NC-17','X','UNRATED') NOT NULL DEFAULT 'G',
	`isAdultContent` boolean DEFAULT false,
	`accessLevel` enum('public','members','verified_18','verified_21','premium') NOT NULL DEFAULT 'public',
	`posterUrl` text,
	`bannerUrl` text,
	`trailerUrl` text,
	`videoUrl` text NOT NULL,
	`imdbId` varchar(50),
	`imdbRating` decimal(3,1),
	`viewCount` int DEFAULT 0,
	`favoriteCount` int DEFAULT 0,
	`isPublished` boolean DEFAULT true,
	`isAvailable` boolean DEFAULT true,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vod_movies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vod_reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`movieId` int,
	`seriesId` int,
	`rating` int NOT NULL,
	`reviewText` text,
	`isVerifiedPurchase` boolean DEFAULT false,
	`helpfulCount` int DEFAULT 0,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vod_reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vod_series` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`genre` varchar(100) NOT NULL,
	`subgenre` varchar(100),
	`creator` varchar(255),
	`cast` text,
	`releaseYear` int,
	`totalSeasons` int DEFAULT 1,
	`totalEpisodes` int DEFAULT 0,
	`contentRating` enum('G','PG','PG-13','R','NC-17','X','UNRATED') NOT NULL DEFAULT 'G',
	`isAdultContent` boolean DEFAULT false,
	`accessLevel` enum('public','members','verified_18','verified_21','premium') NOT NULL DEFAULT 'public',
	`posterUrl` text,
	`bannerUrl` text,
	`trailerUrl` text,
	`imdbId` varchar(50),
	`imdbRating` decimal(3,1),
	`viewCount` int DEFAULT 0,
	`favoriteCount` int DEFAULT 0,
	`isPublished` boolean DEFAULT true,
	`isAvailable` boolean DEFAULT true,
	`status` enum('ongoing','completed','cancelled') DEFAULT 'ongoing',
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vod_series_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vod_viewing_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`movieId` int,
	`episodeId` int,
	`startTime` timestamp DEFAULT (now()),
	`endTime` timestamp,
	`duration` int,
	`progress` int DEFAULT 0,
	`isCompleted` boolean DEFAULT false,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vod_viewing_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vod_watchlist` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`movieId` int,
	`seriesId` int,
	`addedAt` timestamp DEFAULT (now()),
	`priority` int DEFAULT 0,
	CONSTRAINT `vod_watchlist_id` PRIMARY KEY(`id`)
);
