-- Family Member Resumes table
CREATE TABLE IF NOT EXISTS `family_resumes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `familyMemberId` VARCHAR(100) NOT NULL,
  `fullName` VARCHAR(255) NOT NULL,
  `title` VARCHAR(255),
  `email` VARCHAR(320),
  `phone` VARCHAR(50),
  `location` VARCHAR(255),
  `summary` TEXT,
  `qualificationType` ENUM('traditional', 'demonstrated', 'hybrid') DEFAULT 'demonstrated' NOT NULL,
  `education` JSON,
  `certifications` JSON,
  `competencyEvidence` JSON,
  `skills` JSON,
  `references` JSON,
  `developmentPlan` TEXT,
  `status` ENUM('draft', 'complete', 'approved') DEFAULT 'draft' NOT NULL,
  `createdBy` INT,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
);

-- Offer Packages table
CREATE TABLE IF NOT EXISTS `offer_packages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `resumeId` INT NOT NULL,
  `familyMemberId` VARCHAR(100) NOT NULL,
  `fullName` VARCHAR(255) NOT NULL,
  `positionTitle` VARCHAR(255) NOT NULL,
  `department` VARCHAR(255),
  `entityId` VARCHAR(100) NOT NULL,
  `entityName` VARCHAR(255) NOT NULL,
  `reportsTo` VARCHAR(255),
  `employmentType` ENUM('full_time', 'part_time', 'contractor', 'contingent') DEFAULT 'contingent' NOT NULL,
  `baseSalary` DECIMAL(12, 2),
  `salaryFrequency` ENUM('hourly', 'weekly', 'biweekly', 'monthly', 'annually') DEFAULT 'annually',
  `tokenAllocation` INT,
  `revenueSharePercent` DECIMAL(5, 2),
  `benefits` JSON,
  `proposedStartDate` TIMESTAMP,
  `contingencyConditions` TEXT,
  `offerLetterGenerated` BOOLEAN DEFAULT FALSE NOT NULL,
  `positionDescGenerated` BOOLEAN DEFAULT FALSE NOT NULL,
  `compensationScheduleGenerated` BOOLEAN DEFAULT FALSE NOT NULL,
  `ndaGenerated` BOOLEAN DEFAULT FALSE NOT NULL,
  `nonCompeteGenerated` BOOLEAN DEFAULT FALSE NOT NULL,
  `backgroundCheckAuthGenerated` BOOLEAN DEFAULT FALSE NOT NULL,
  `taxFormsGenerated` BOOLEAN DEFAULT FALSE NOT NULL,
  `tokenAgreementGenerated` BOOLEAN DEFAULT FALSE NOT NULL,
  `status` ENUM('draft', 'pending_review', 'approved', 'sent', 'accepted', 'declined', 'expired') DEFAULT 'draft' NOT NULL,
  `offerSentAt` TIMESTAMP,
  `offerAcceptedAt` TIMESTAMP,
  `signatureId` VARCHAR(255),
  `createdBy` INT,
  `approvedBy` INT,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
);

-- Offer Package Documents table
CREATE TABLE IF NOT EXISTS `offer_package_documents` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `offerId` INT NOT NULL,
  `documentType` ENUM('offer_letter', 'position_description', 'compensation_schedule', 'nda', 'non_compete', 'background_check_auth', 'direct_deposit', 'w4', 'w9', 'i9', 'token_agreement', 'policy_acknowledgment', 'resume') NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT,
  `s3Key` VARCHAR(1000),
  `s3Url` VARCHAR(2000),
  `requiresSignature` BOOLEAN DEFAULT FALSE NOT NULL,
  `signedAt` TIMESTAMP,
  `signatureData` TEXT,
  `status` ENUM('draft', 'generated', 'sent', 'signed', 'rejected') DEFAULT 'draft' NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
);

-- Add indexes
CREATE INDEX idx_family_resumes_member ON family_resumes(familyMemberId);
CREATE INDEX idx_offer_packages_resume ON offer_packages(resumeId);
CREATE INDEX idx_offer_packages_member ON offer_packages(familyMemberId);
CREATE INDEX idx_offer_package_docs_offer ON offer_package_documents(offerId);
