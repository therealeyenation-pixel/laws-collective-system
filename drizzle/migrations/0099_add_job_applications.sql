-- Job Applications table
CREATE TABLE IF NOT EXISTS `job_applications` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `positionId` varchar(100) NOT NULL,
  `positionTitle` varchar(255) NOT NULL,
  `entity` varchar(255) NOT NULL,
  `firstName` varchar(100) NOT NULL,
  `lastName` varchar(100) NOT NULL,
  `email` varchar(320) NOT NULL,
  `phone` varchar(50),
  `currentRole` varchar(255),
  `yearsExperience` varchar(50),
  `relevantSkills` text,
  `whyInterested` text,
  `coverLetter` text,
  `resumeUrl` text,
  `resumeFileName` varchar(255),
  `resumeFileKey` varchar(500),
  `status` enum('received','screening','phone_screen','interview_scheduled','interview_completed','reference_check','offer_extended','offer_accepted','hired','rejected','withdrawn') NOT NULL DEFAULT 'received',
  `statusNotes` text,
  `interviewDate` timestamp,
  `interviewType` enum('phone','video','in_person'),
  `interviewNotes` text,
  `interviewScore` int,
  `panelReviewers` json,
  `panelScores` json,
  `panelNotes` json,
  `decisionMadeBy` int,
  `decisionDate` timestamp,
  `decisionReason` text,
  `offeredSalary` decimal(10,2),
  `offeredStartDate` date,
  `offerExpiresAt` timestamp,
  `appliedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Application Documents table
CREATE TABLE IF NOT EXISTS `application_documents` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `applicationId` int NOT NULL,
  `documentType` enum('resume','cover_letter','portfolio','certification','reference_letter','transcript','other') NOT NULL,
  `fileName` varchar(255) NOT NULL,
  `fileKey` varchar(500) NOT NULL,
  `fileUrl` text NOT NULL,
  `fileSize` int,
  `mimeType` varchar(100),
  `uploadedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Application Activity Log table
CREATE TABLE IF NOT EXISTS `application_activity_log` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `applicationId` int NOT NULL,
  `actorId` int,
  `actorName` varchar(255),
  `action` enum('application_received','status_changed','document_uploaded','interview_scheduled','interview_completed','note_added','score_updated','offer_sent','offer_accepted','offer_rejected','hired','rejected','withdrawn') NOT NULL,
  `previousValue` text,
  `newValue` text,
  `notes` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
