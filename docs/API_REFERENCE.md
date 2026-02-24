# L.A.W.S. Collective System - API Reference

## Overview

The system uses tRPC for type-safe API communication. All endpoints are available under `/api/trpc/`.

## Authentication

### Get Current User
```typescript
trpc.auth.me.useQuery()
// Returns: { id, name, email, role, createdAt } | null
```

### Logout
```typescript
trpc.auth.logout.useMutation()
// Returns: { success: boolean }
```

## Documents

### List Documents
```typescript
trpc.documents.list.useQuery({ 
  page?: number,
  limit?: number,
  category?: string,
  search?: string 
})
// Returns: { documents: Document[], total: number }
```

### Get Document
```typescript
trpc.documents.get.useQuery({ id: string })
// Returns: Document
```

### Create Document
```typescript
trpc.documents.create.useMutation({
  title: string,
  content: string,
  category: string,
  tags?: string[]
})
// Returns: Document
```

### Update Document
```typescript
trpc.documents.update.useMutation({
  id: string,
  title?: string,
  content?: string,
  category?: string
})
// Returns: Document
```

### Delete Document
```typescript
trpc.documents.delete.useMutation({ id: string })
// Returns: { success: boolean }
```

### Sign Document
```typescript
trpc.documents.sign.useMutation({
  documentId: string,
  signature: string,
  signatureType: 'drawn' | 'typed' | 'uploaded'
})
// Returns: { signatureId: string, signedAt: Date }
```

## Workflows

### List Workflows
```typescript
trpc.workflows.list.useQuery()
// Returns: Workflow[]
```

### Create Workflow
```typescript
trpc.workflows.create.useMutation({
  name: string,
  description: string,
  triggers: Trigger[],
  conditions: Condition[],
  actions: Action[]
})
// Returns: Workflow
```

### Execute Workflow
```typescript
trpc.workflows.execute.useMutation({ id: string })
// Returns: { executionId: string, status: string }
```

### Get Workflow History
```typescript
trpc.workflows.getHistory.useQuery({ workflowId: string })
// Returns: WorkflowExecution[]
```

## Grants

### List Grants
```typescript
trpc.grants.list.useQuery({
  status?: 'draft' | 'submitted' | 'awarded' | 'rejected',
  search?: string
})
// Returns: Grant[]
```

### Create Grant Application
```typescript
trpc.grants.create.useMutation({
  grantId: string,
  applicationData: object
})
// Returns: GrantApplication
```

### Update Grant Status
```typescript
trpc.grants.updateStatus.useMutation({
  id: string,
  status: string,
  notes?: string
})
// Returns: Grant
```

### Get Grant Documents
```typescript
trpc.grants.getDocuments.useQuery({ grantId: string })
// Returns: Document[]
```

## Financial

### Get Transactions
```typescript
trpc.financial.getTransactions.useQuery({
  startDate?: Date,
  endDate?: Date,
  category?: string,
  type?: 'income' | 'expense'
})
// Returns: Transaction[]
```

### Create Transaction
```typescript
trpc.financial.createTransaction.useMutation({
  type: 'income' | 'expense',
  amount: number,
  category: string,
  description: string,
  date: Date
})
// Returns: Transaction
```

### Get Financial Summary
```typescript
trpc.financial.getSummary.useQuery({
  period: 'month' | 'quarter' | 'year'
})
// Returns: { income: number, expenses: number, net: number }
```

### Generate Statement
```typescript
trpc.financial.generateStatement.useMutation({
  type: 'income' | 'balance' | 'cashflow',
  period: { start: Date, end: Date }
})
// Returns: { statementId: string, url: string }
```

## HR Management

### List Employees
```typescript
trpc.hr.listEmployees.useQuery({
  department?: string,
  status?: 'active' | 'inactive'
})
// Returns: Employee[]
```

### Get Employee
```typescript
trpc.hr.getEmployee.useQuery({ id: string })
// Returns: Employee
```

### Create Performance Review
```typescript
trpc.hr.createReview.useMutation({
  employeeId: string,
  period: string,
  rating: number,
  feedback: string,
  goals: string[]
})
// Returns: PerformanceReview
```

### Get Org Chart
```typescript
trpc.hr.getOrgChart.useQuery()
// Returns: OrgNode[]
```

## Board Governance

### List Meetings
```typescript
trpc.board.listMeetings.useQuery({
  status?: 'scheduled' | 'completed' | 'cancelled'
})
// Returns: BoardMeeting[]
```

### Create Meeting
```typescript
trpc.board.createMeeting.useMutation({
  title: string,
  date: Date,
  agenda: AgendaItem[],
  attendees: string[]
})
// Returns: BoardMeeting
```

### Create Resolution
```typescript
trpc.board.createResolution.useMutation({
  meetingId: string,
  title: string,
  description: string,
  requiredVotes: number
})
// Returns: Resolution
```

### Cast Vote
```typescript
trpc.board.vote.useMutation({
  resolutionId: string,
  vote: 'yes' | 'no' | 'abstain'
})
// Returns: { success: boolean }
```

## Certificates

### Issue Certificate
```typescript
trpc.certificates.issue.useMutation({
  userId: string,
  type: CertificateType,
  title: string,
  metadata: object
})
// Returns: Certificate
```

### Verify Certificate
```typescript
trpc.certificates.verify.useQuery({ hash: string })
// Returns: { valid: boolean, certificate?: Certificate }
```

### Get My Certificates
```typescript
trpc.certificates.getMine.useQuery()
// Returns: Certificate[]
```

## Biometric Authentication

### Register Credential
```typescript
trpc.biometric.register.useMutation({
  credentialId: string,
  publicKey: string,
  deviceName: string,
  authenticatorType: 'platform' | 'cross-platform'
})
// Returns: { id: string }
```

### List Credentials
```typescript
trpc.biometric.list.useQuery()
// Returns: BiometricCredential[]
```

### Remove Credential
```typescript
trpc.biometric.remove.useMutation({ id: string })
// Returns: { success: boolean }
```

## Workflow Templates

### List Templates
```typescript
trpc.workflowTemplates.list.useQuery({ category?: string })
// Returns: WorkflowTemplate[]
```

### Deploy Template
```typescript
trpc.workflowTemplates.deploy.useMutation({
  templateId: string,
  customizations?: object
})
// Returns: Workflow
```

### Share Template
```typescript
trpc.sharedWorkflowTemplates.share.useMutation({
  name: string,
  description: string,
  category: string,
  definition: object
})
// Returns: SharedTemplate
```

## Translation Contributions

### Submit Translation
```typescript
trpc.translations.submit.useMutation({
  languageCode: string,
  key: string,
  originalText: string,
  translatedText: string
})
// Returns: TranslationSuggestion
```

### Vote on Translation
```typescript
trpc.translations.vote.useMutation({
  suggestionId: string,
  vote: 'up' | 'down'
})
// Returns: { success: boolean }
```

### Get Leaderboard
```typescript
trpc.translations.getLeaderboard.useQuery({ languageCode?: string })
// Returns: Contributor[]
```

## System

### Get Health Status
```typescript
trpc.system.health.useQuery()
// Returns: { database: boolean, storage: boolean, apis: boolean }
```

### Notify Owner
```typescript
trpc.system.notifyOwner.useMutation({
  title: string,
  content: string
})
// Returns: { success: boolean }
```

## Data Types

### User
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'staff' | 'admin' | 'owner';
  createdAt: Date;
}
```

### Document
```typescript
interface Document {
  id: string;
  title: string;
  content: string;
  category: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  signatures?: Signature[];
}
```

### Workflow
```typescript
interface Workflow {
  id: string;
  name: string;
  description: string;
  triggers: Trigger[];
  conditions: Condition[];
  actions: Action[];
  status: 'active' | 'inactive' | 'draft';
  createdAt: Date;
}
```

### Grant
```typescript
interface Grant {
  id: string;
  name: string;
  funder: string;
  amount: number;
  status: 'draft' | 'submitted' | 'awarded' | 'rejected';
  deadline: Date;
  requirements: string[];
}
```

### Transaction
```typescript
interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: Date;
  createdAt: Date;
}
```

## Error Handling

All endpoints return errors in this format:
```typescript
{
  code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'BAD_REQUEST' | 'INTERNAL_SERVER_ERROR',
  message: string
}
```

Common error codes:
- `UNAUTHORIZED` (401): Not logged in
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `BAD_REQUEST` (400): Invalid input
- `INTERNAL_SERVER_ERROR` (500): Server error

## Rate Limiting

API requests are rate limited:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated requests

---

*Last Updated: January 2026*
