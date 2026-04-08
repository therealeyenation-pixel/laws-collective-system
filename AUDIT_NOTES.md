# Audit Notes: Department-Simulator-Certificate Linkage

## Existing Infrastructure

### Database Tables (drizzle/schema.ts)
- `departments` — id, name, description, managerId, status
- `staffMembers` — userId, departmentId, role (manager/administrator/admin_lead/teacher/staff)
- `certificates` — userId, simulatorSessionId, certificateType, title, certificateHash, verificationUrl
- `luvLedgerAccounts` — userId, businessEntityId, accountType, accountName, balance
- `luvLedgerTransactions` — fromAccountId, toAccountId, amount, blockchainHash
- `blockchainRecords` — recordType (transaction/certificate/entity_creation/trust_update/allocation_change), referenceId, blockchainHash, previousHash, data
- `simulatorCompletion` — userId, simulatorType, score, certificateId, completedAt
- `clonedBuilds` — userId, masterBuildId, businessName, businessType, cloneStatus, simulatorDataJson
- `buildLinkage` — clonedBuildId, masterBuildId, linkageType, luvledgerEntryId
- `activationProgress` — userId, activationStatus, activatedAt

### Department-Manager Mapping (from OrgChart)
- LaShanna Russell → Executive/Business (CEO)
- Craig Russell → Finance
- Cornelius D. Christopher → Education (dual: L.A.W.S. Collective + 508-LuvOnPurpose Academy and Outreach)
- Amber S. Hunter → Health
- Amandes Pearsall IV → Media (Real-Eye-Nation)
- Essence Hunter → Design (Real-Eye-Nation / IT)

### Simulator Types (system-activation router)
- business → Business Workshop
- grants → Grant Writing Workshop
- proposals → Proposals Workshop
- contracts → Contracts Workshop
- real_eye_nation → Real-Eye-Nation Workshop
- other → Additional Workshop (L.A.W.S. Foundation Course)

### Existing Routers
- `blockchainRouter` — recordTransaction, getRecords, verifyRecord
- `certificateIssuanceRouter` — issue, verify, getUserCertificates, checkEligibility, revoke
- `simulatorCertificatesRouter` — getSimulatorOrder, getProgress, checkAccess, issueCertificate
- `systemActivationRouter` — getProgress, recordCompletion, activateBuild, getBuildStatus, getAllBuilds

### Certificate Types (certificate-issuance)
- simulator_completion, course_completion, mastery_certificate, member_credential
- house_graduation, language_mastery, stem_mastery, sovereign_diploma
- internship_completion, contractor_certification

### CompletionCertificate Component
- Props: recipientName, entityName, entityType, completionDate, certificateNumber
- Also: managerName, managerTitle, trainingManagerName (default: "Cornelius"), trainingManagerTitle

## What Needs to Be Built

### 1. Department Registry (shared/departmentRegistry.ts)
Central mapping connecting:
- Department → Manager (name, title)
- Department → Simulator type(s)
- Department → Certificate type(s)
- Department → Entity affiliation

### 2. Certificate → LuvLedger Integration
When simulator completed:
- Issue certificate via certificateIssuance
- Record on blockchain via blockchainRouter
- Link to department via registry
- Signed by department Manager

### 3. Department Dashboard Enhancements
Each department dashboard shows:
- Completions for their simulator(s)
- Certificates issued
- Training content status

### 4. AI Content Builder
Manager tools on department dashboards for building training content
