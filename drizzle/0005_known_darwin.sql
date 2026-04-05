CREATE TABLE `academy_courses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`houseId` int NOT NULL,
	`moduleId` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`description` text,
	`scrollTitle` varchar(200),
	`level` enum('foundational','developing','mastery') NOT NULL,
	`estimatedHours` int DEFAULT 10,
	`tokensReward` int DEFAULT 100,
	`prerequisites` json,
	`learningObjectives` json,
	`status` enum('draft','active','archived') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `academy_courses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `academy_houses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(50) NOT NULL,
	`description` text,
	`ageRange` varchar(20) NOT NULL,
	`gradeRange` varchar(20) NOT NULL,
	`ceremonialName` varchar(150),
	`iconPath` varchar(255),
	`colorTheme` varchar(50),
	`status` enum('active','inactive','coming_soon') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `academy_houses_id` PRIMARY KEY(`id`),
	CONSTRAINT `academy_houses_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `academy_languages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`nativeName` varchar(100),
	`slug` varchar(50) NOT NULL,
	`category` enum('indigenous','ancestral_flame','global_trade') NOT NULL,
	`description` text,
	`culturalContext` text,
	`iconEmoji` varchar(10),
	`status` enum('active','inactive','coming_soon') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `academy_languages_id` PRIMARY KEY(`id`),
	CONSTRAINT `academy_languages_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `academy_lessons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`courseId` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`scrollName` varchar(200),
	`content` text,
	`contentType` enum('text','video','interactive','ceremony','practice') NOT NULL,
	`orderIndex` int NOT NULL DEFAULT 0,
	`estimatedMinutes` int DEFAULT 30,
	`tokensReward` int DEFAULT 10,
	`resources` json,
	`status` enum('draft','active','archived') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `academy_lessons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `divine_stem_modules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(150) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`ceremonialTitle` varchar(200),
	`iconEmoji` varchar(10),
	`category` enum('stem','ceremonial','entrepreneurial','creative','language') NOT NULL,
	`orderIndex` int NOT NULL DEFAULT 0,
	`status` enum('active','inactive','coming_soon') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `divine_stem_modules_id` PRIMARY KEY(`id`),
	CONSTRAINT `divine_stem_modules_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `guardian_access` (
	`id` int AUTO_INCREMENT NOT NULL,
	`guardianUserId` int NOT NULL,
	`studentProfileId` int NOT NULL,
	`accessLevel` enum('view_only','manage','full_control') NOT NULL DEFAULT 'manage',
	`notifications` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `guardian_access_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `language_lessons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`languageId` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`level` enum('beginner','intermediate','advanced') NOT NULL,
	`lessonType` enum('vocabulary','pronunciation','conversation','ceremony','story','chant') NOT NULL,
	`content` json,
	`audioUrl` varchar(500),
	`orderIndex` int NOT NULL DEFAULT 0,
	`tokensReward` int DEFAULT 15,
	`status` enum('draft','active','archived') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `language_lessons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `living_scrolls` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentProfileId` int NOT NULL,
	`scrollType` enum('voice_scroll','house_lexicon','translation_book','mastery_scroll') NOT NULL,
	`title` varchar(200) NOT NULL,
	`languageId` int,
	`content` json,
	`entriesCount` int DEFAULT 0,
	`isPublic` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `living_scrolls_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mastery_certificates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentProfileId` int NOT NULL,
	`certificateType` enum('course_completion','house_graduation','language_mastery','stem_mastery','sovereign_diploma') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`courseId` int,
	`houseId` int,
	`languageId` int,
	`level` varchar(50),
	`blockchainHash` varchar(255),
	`verificationCode` varchar(100),
	`issuedAt` timestamp NOT NULL DEFAULT (now()),
	`metadata` json,
	CONSTRAINT `mastery_certificates_id` PRIMARY KEY(`id`),
	CONSTRAINT `mastery_certificates_verificationCode_unique` UNIQUE(`verificationCode`)
);
--> statement-breakpoint
CREATE TABLE `student_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`guardianUserId` int,
	`houseId` int,
	`displayName` varchar(100),
	`gradeLevel` varchar(10),
	`birthYear` int,
	`primaryLanguageId` int,
	`selectedLanguages` json,
	`ceremonialPath` varchar(100),
	`preferences` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `student_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `student_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentProfileId` int NOT NULL,
	`courseId` int,
	`lessonId` int,
	`languageLessonId` int,
	`progressType` enum('course','lesson','language') NOT NULL,
	`status` enum('not_started','in_progress','completed','mastered') NOT NULL DEFAULT 'not_started',
	`progressPercentage` int DEFAULT 0,
	`score` int,
	`tokensEarned` int DEFAULT 0,
	`timeSpentMinutes` int DEFAULT 0,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `student_progress_id` PRIMARY KEY(`id`)
);
