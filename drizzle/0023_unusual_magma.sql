CREATE TABLE `academy_assessment_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assessmentId` int NOT NULL,
	`studentProfileId` int NOT NULL,
	`attemptNumber` int NOT NULL DEFAULT 1,
	`answers` json,
	`totalScore` int,
	`percentageScore` int,
	`passed` boolean NOT NULL DEFAULT false,
	`difficultyAtStart` varchar(20),
	`difficultyAtEnd` varchar(20),
	`aiFeedback` text,
	`strengthAreas` json,
	`improvementAreas` json,
	`recommendedNextSteps` json,
	`timeSpentMinutes` int,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `academy_assessment_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `academy_assessments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`unitId` int,
	`lessonId` int,
	`title` varchar(200) NOT NULL,
	`academy_assessment_type` enum('lesson_check','unit_quiz','mastery_exam','practice_set','project_rubric','oral_prompt','portfolio_review') NOT NULL,
	`questions` json,
	`totalPoints` int DEFAULT 100,
	`passingScore` int DEFAULT 70,
	`timeLimit` int,
	`adaptiveDifficulty` boolean NOT NULL DEFAULT true,
	`academy_difficulty` enum('foundational','developing','proficient','advanced','mastery') NOT NULL DEFAULT 'proficient',
	`shuffleQuestions` boolean NOT NULL DEFAULT true,
	`showFeedback` boolean NOT NULL DEFAULT true,
	`maxAttempts` int DEFAULT 3,
	`aiGenerated` boolean NOT NULL DEFAULT false,
	`humanReviewed` boolean NOT NULL DEFAULT false,
	`reviewedBy` int,
	`reviewedAt` timestamp,
	`academy_assess_status` enum('draft','ai_generated','human_review','approved','active','archived') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `academy_assessments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `academy_content_gen_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`academy_gen_type` enum('lesson_content','assessment_questions','unit_outline','vocabulary','practice_problems') NOT NULL,
	`targetType` varchar(50) NOT NULL,
	`targetId` int NOT NULL,
	`prompt` text,
	`generatedContent` json,
	`modelUsed` varchar(100),
	`tokensUsed` int,
	`generatedBy` int NOT NULL,
	`academy_gen_status` enum('pending','completed','failed','applied') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `academy_content_gen_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `academy_human_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`academy_note_target` enum('unit','lesson','assessment') NOT NULL,
	`targetId` int NOT NULL,
	`authorId` int NOT NULL,
	`academy_note_type` enum('cultural_context','real_world_example','teaching_tip','laws_connection','differentiation','parent_guidance','correction','enrichment') NOT NULL,
	`title` varchar(200),
	`content` text NOT NULL,
	`isPublished` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `academy_human_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `academy_mastery_tracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentProfileId` int NOT NULL,
	`subjectId` int NOT NULL,
	`unitId` int,
	`standardCode` varchar(50),
	`objectiveDescription` text,
	`academy_mastery_level` enum('not_started','emerging','developing','proficient','mastery') NOT NULL DEFAULT 'not_started',
	`masteryScore` int DEFAULT 0,
	`attemptsCount` int DEFAULT 0,
	`lastAssessedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `academy_mastery_tracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `academy_subjects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(150) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`academy_subject_category` enum('core_academic','stem_extended','creative_arts','life_skills','laws_framework') NOT NULL,
	`iconEmoji` varchar(10),
	`standardsAlignment` varchar(200),
	`gradeRange` varchar(20),
	`orderIndex` int NOT NULL DEFAULT 0,
	`academy_subject_status` enum('active','draft','archived') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `academy_subjects_id` PRIMARY KEY(`id`),
	CONSTRAINT `academy_subjects_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `academy_unit_lessons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`unitId` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`slug` varchar(150) NOT NULL,
	`summary` text,
	`contentBlocks` json,
	`academy_lesson_type` enum('instruction','practice','exploration','project','discussion','lab','reading','simulation') NOT NULL DEFAULT 'instruction',
	`orderIndex` int NOT NULL DEFAULT 0,
	`estimatedMinutes` int DEFAULT 30,
	`resources` json,
	`vocabularyTerms` json,
	`standardsCovered` json,
	`aiGenerated` boolean NOT NULL DEFAULT false,
	`humanReviewed` boolean NOT NULL DEFAULT false,
	`reviewedBy` int,
	`reviewedAt` timestamp,
	`tokensReward` int DEFAULT 10,
	`academy_lesson_status` enum('draft','ai_generated','human_review','approved','active','archived') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `academy_unit_lessons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `academy_units` (
	`id` int AUTO_INCREMENT NOT NULL,
	`subjectId` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`slug` varchar(150) NOT NULL,
	`description` text,
	`academy_level_band` enum('early_elementary','upper_elementary','middle_school','high_school_intro','high_school_adv','certification') NOT NULL,
	`orderIndex` int NOT NULL DEFAULT 0,
	`estimatedHours` int DEFAULT 10,
	`standardsCovered` json,
	`prerequisites` json,
	`learningObjectives` json,
	`aiGenerated` boolean NOT NULL DEFAULT false,
	`humanReviewed` boolean NOT NULL DEFAULT false,
	`reviewedBy` int,
	`reviewedAt` timestamp,
	`academy_unit_status` enum('draft','ai_generated','human_review','approved','active','archived') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `academy_units_id` PRIMARY KEY(`id`)
);
