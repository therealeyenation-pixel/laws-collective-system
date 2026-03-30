# Financial Automation Platform - API Documentation

## Overview

The Financial Automation Platform provides a comprehensive set of tRPC procedures for managing campaigns, communications, financial operations, and member engagement. All procedures are accessible through the `/api/trpc` endpoint.

---

## Authentication

All API calls require authentication via session cookies. The authentication flow:

1. User logs in via Manus OAuth
2. Session cookie is set automatically
3. All subsequent requests include the session cookie
4. `protectedProcedure` endpoints require valid authentication

**Example:**
```javascript
// Frontend - automatic via tRPC client
const { data } = trpc.emailCampaignDashboard.getCampaigns.useQuery();

// Backend - manual verification
if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
```

---

## Email Campaign Management

### Campaign Operations

#### `emailCampaignDashboard.getCampaigns`
Retrieve paginated list of campaigns with filtering and sorting.

**Parameters:**
```typescript
{
  page?: number;           // Default: 1
  limit?: number;          // Default: 20
  status?: 'active' | 'paused' | 'completed';
  sortBy?: 'created' | 'name' | 'performance';
}
```

**Response:**
```typescript
{
  campaigns: Array<{
    id: string;
    name: string;
    description: string;
    status: 'active' | 'paused' | 'completed';
    enrolledMembers: number;
    emailsSent: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
    revenue: number;
    createdAt: Date;
  }>;
  total: number;
  page: number;
  pages: number;
}
```

**Example:**
```javascript
const { data } = await trpc.emailCampaignDashboard.getCampaigns.query({
  page: 1,
  limit: 20,
  status: 'active'
});
```

#### `emailCampaignDashboard.getCampaignDetails`
Get detailed information for a specific campaign.

**Parameters:**
```typescript
{
  campaignId: string;
}
```

**Response:**
```typescript
{
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'completed';
  enrolledMembers: number;
  emailsSent: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  revenue: number;
  createdAt: Date;
  updatedAt: Date;
  analytics: {
    dailyMetrics: Array<{
      date: Date;
      sent: number;
      opened: number;
      clicked: number;
      converted: number;
    }>;
  };
}
```

#### `emailCampaignDashboard.updateCampaignStatus`
Update campaign status (pause, resume, complete).

**Parameters:**
```typescript
{
  campaignId: string;
  status: 'active' | 'paused' | 'completed';
}
```

**Response:**
```typescript
{
  success: boolean;
  campaign: Campaign;
}
```

---

## SMS Notification System

### SMS Operations

#### `smsNotificationSystem.sendSMS`
Send SMS to a single member.

**Parameters:**
```typescript
{
  memberId: string;
  message: string;
  priority?: 'high' | 'normal' | 'low';
  scheduledAt?: Date;
}
```

**Response:**
```typescript
{
  smsId: string;
  status: 'queued' | 'sent' | 'delivered' | 'failed';
  carrier: string;
  sentAt: Date;
}
```

#### `smsNotificationSystem.sendBulkSMS`
Send SMS to multiple members.

**Parameters:**
```typescript
{
  memberIds: string[];
  message: string;
  scheduledAt?: Date;
  retryOnFail?: boolean;
}
```

**Response:**
```typescript
{
  campaignId: string;
  totalMembers: number;
  queued: number;
  failed: number;
  status: 'processing' | 'completed';
}
```

#### `smsNotificationSystem.getSMSDeliveryStatus`
Check delivery status of an SMS.

**Parameters:**
```typescript
{
  smsId: string;
}
```

**Response:**
```typescript
{
  smsId: string;
  status: 'queued' | 'sent' | 'delivered' | 'failed';
  carrier: string;
  sentAt: Date;
  deliveredAt?: Date;
  failureReason?: string;
}
```

---

## Member Communication Hub

### Conversation Management

#### `memberCommunicationHub.getConversations`
Retrieve member conversations across all channels.

**Parameters:**
```typescript
{
  memberId: string;
  page?: number;
  limit?: number;
  channel?: 'email' | 'sms' | 'push';
}
```

**Response:**
```typescript
{
  conversations: Array<{
    id: string;
    memberId: string;
    channel: 'email' | 'sms' | 'push';
    subject: string;
    lastMessage: string;
    lastMessageAt: Date;
    unreadCount: number;
    status: 'active' | 'archived' | 'resolved';
  }>;
  total: number;
}
```

#### `memberCommunicationHub.getConversationHistory`
Get full message history for a conversation.

**Parameters:**
```typescript
{
  conversationId: string;
  page?: number;
  limit?: number;
}
```

**Response:**
```typescript
{
  conversationId: string;
  messages: Array<{
    id: string;
    sender: 'member' | 'system';
    content: string;
    channel: 'email' | 'sms' | 'push';
    sentAt: Date;
    readAt?: Date;
    status: 'sent' | 'delivered' | 'read';
  }>;
  total: number;
}
```

#### `memberCommunicationHub.sendMessage`
Send message to member via specified channel.

**Parameters:**
```typescript
{
  memberId: string;
  channel: 'email' | 'sms' | 'push';
  content: string;
  templateId?: string;
  variables?: Record<string, string>;
}
```

**Response:**
```typescript
{
  messageId: string;
  status: 'queued' | 'sent' | 'delivered';
  sentAt: Date;
}
```

---

## Advanced Segmentation Rules Engine

### RFM Analysis

#### `advancedSegmentationRulesEngine.getRFMAnalysis`
Get RFM (Recency, Frequency, Monetary) analysis for members.

**Parameters:**
```typescript
{
  lookbackDays?: number;  // Default: 90
}
```

**Response:**
```typescript
{
  segments: Array<{
    segment: 'Champions' | 'Loyal' | 'AtRisk' | 'NeedAttention';
    members: number;
    avgLTV: number;
    churnRisk: number;
    recommendations: string[];
  }>;
  totalMembers: number;
  analysisDate: Date;
}
```

### Behavioral Triggers

#### `advancedSegmentationRulesEngine.createBehavioralTrigger`
Create a new behavioral trigger for automated actions.

**Parameters:**
```typescript
{
  name: string;
  event: string;
  condition: {
    field: string;
    operator: 'equals' | 'greaterThan' | 'lessThan' | 'contains';
    value: any;
  };
  action: {
    type: 'sendEmail' | 'sendSMS' | 'updateSegment' | 'createTask';
    payload: Record<string, any>;
  };
  enabled?: boolean;
}
```

**Response:**
```typescript
{
  triggerId: string;
  name: string;
  status: 'active' | 'inactive';
  executions: number;
  createdAt: Date;
}
```

### Predictive Scoring

#### `advancedSegmentationRulesEngine.calculatePredictiveScores`
Calculate predictive scores for members.

**Parameters:**
```typescript
{
  modelType: 'churn' | 'ltv' | 'engagement' | 'conversion';
  memberId?: string;  // If omitted, scores all members
}
```

**Response:**
```typescript
{
  scores: Array<{
    memberId: string;
    score: number;  // 0-100
    confidence: number;  // 0-1
    factors: Array<{
      name: string;
      impact: number;
    }>;
  }>;
  modelAccuracy: number;
  lastUpdated: Date;
}
```

---

## Financial Reconciliation Module

### Payment Matching

#### `financialReconciliationModule.getUnmatchedTransactions`
Retrieve unmatched transactions for manual reconciliation.

**Parameters:**
```typescript
{
  page?: number;
  limit?: number;
  type?: 'payment' | 'invoice';
  daysOld?: number;
}
```

**Response:**
```typescript
{
  transactions: Array<{
    id: string;
    type: 'payment' | 'invoice';
    amount: number;
    date: Date;
    reference: string;
    suggestions: string[];  // Suggested matches
  }>;
  total: number;
}
```

#### `financialReconciliationModule.matchTransaction`
Match a payment to an invoice.

**Parameters:**
```typescript
{
  transactionId: string;
  matchId: string;
  notes?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  match: {
    transactionId: string;
    matchId: string;
    matchedAt: Date;
    discrepancy?: number;
  };
}
```

### Reconciliation Exceptions

#### `financialReconciliationModule.getExceptions`
Get reconciliation exceptions and discrepancies.

**Parameters:**
```typescript
{
  page?: number;
  limit?: number;
  severity?: 'critical' | 'high' | 'medium' | 'low';
  status?: 'open' | 'resolved';
}
```

**Response:**
```typescript
{
  exceptions: Array<{
    id: string;
    type: 'amount_mismatch' | 'missing_payment' | 'duplicate_payment';
    severity: 'critical' | 'high' | 'medium' | 'low';
    invoice: string;
    expected: number;
    actual?: number;
    difference?: number;
    status: 'open' | 'resolved';
    createdAt: Date;
  }>;
  total: number;
}
```

### Revenue Recognition

#### `financialReconciliationModule.getRevenueRecognition`
Get revenue recognition data by category and method.

**Parameters:**
```typescript
{
  method?: 'accrual' | 'cash';
  period?: 'monthly' | 'quarterly' | 'annual';
}
```

**Response:**
```typescript
{
  revenue: Array<{
    category: string;
    amount: number;
    percentage: number;
    recognizedAt: Date;
  }>;
  total: number;
  method: 'accrual' | 'cash';
  period: string;
}
```

---

## Webhook Event System

### Webhook Management

#### `webhookEventSystem.registerWebhook`
Register a new webhook endpoint.

**Parameters:**
```typescript
{
  url: string;
  events: string[];  // e.g., ['campaign.created', 'member.updated']
  active?: boolean;
  secret?: string;
}
```

**Response:**
```typescript
{
  webhookId: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive';
  createdAt: Date;
  signature: string;
}
```

#### `webhookEventSystem.publishEvent`
Publish an event to all registered webhooks.

**Parameters:**
```typescript
{
  eventType: string;
  data: Record<string, any>;
  metadata?: {
    userId?: string;
    timestamp?: Date;
  };
}
```

**Response:**
```typescript
{
  eventId: string;
  eventType: string;
  deliveries: Array<{
    webhookId: string;
    status: 'queued' | 'delivered' | 'failed';
    attempts: number;
    lastAttempt?: Date;
  }>;
}
```

#### `webhookEventSystem.getWebhookDeliveries`
Get delivery history for a webhook.

**Parameters:**
```typescript
{
  webhookId: string;
  page?: number;
  limit?: number;
  status?: 'queued' | 'delivered' | 'failed';
}
```

**Response:**
```typescript
{
  deliveries: Array<{
    eventId: string;
    eventType: string;
    status: 'queued' | 'delivered' | 'failed';
    statusCode?: number;
    attempts: number;
    lastAttempt: Date;
    nextRetry?: Date;
  }>;
  total: number;
}
```

---

## Role-Based Access Control

### Role Management

#### `roleBasedAccessControl.assignRole`
Assign a role to a user.

**Parameters:**
```typescript
{
  userId: string;
  role: 'admin' | 'manager' | 'member' | 'viewer';
  expiresAt?: Date;
}
```

**Response:**
```typescript
{
  userId: string;
  role: string;
  assignedAt: Date;
  expiresAt?: Date;
  permissions: string[];
}
```

#### `roleBasedAccessControl.checkPermission`
Check if user has specific permission.

**Parameters:**
```typescript
{
  userId: string;
  permission: string;
}
```

**Response:**
```typescript
{
  hasPermission: boolean;
  role: string;
  permission: string;
}
```

---

## Rate Limiting

API rate limits are enforced per user tier:

| Tier | Requests/Hour | Requests/Day |
|------|---------------|--------------|
| Free | 100 | 1,000 |
| Pro | 1,000 | 10,000 |
| Enterprise | Unlimited | Unlimited |

**Rate Limit Headers:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1234567890
```

---

## Error Handling

All errors follow this format:

```typescript
{
  code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'INVALID_INPUT' | 'INTERNAL_SERVER_ERROR';
  message: string;
  details?: Record<string, any>;
}
```

**Common Status Codes:**
- `200`: Success
- `400`: Invalid input
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not found
- `429`: Rate limit exceeded
- `500`: Internal server error

---

## Webhooks

### Available Events

| Event | Payload |
|-------|---------|
| `campaign.created` | `{ campaignId, name, createdAt }` |
| `campaign.updated` | `{ campaignId, status, updatedAt }` |
| `member.updated` | `{ memberId, segment, score, updatedAt }` |
| `payment.matched` | `{ transactionId, invoiceId, amount, matchedAt }` |
| `exception.created` | `{ exceptionId, type, severity, createdAt }` |
| `sms.delivered` | `{ smsId, carrier, deliveredAt }` |

### Webhook Signature Verification

All webhook payloads include an `X-Webhook-Signature` header:

```javascript
const crypto = require('crypto');

const signature = req.headers['x-webhook-signature'];
const payload = JSON.stringify(req.body);
const secret = process.env.WEBHOOK_SECRET;

const hash = crypto
  .createHmac('sha256', secret)
  .update(payload)
  .digest('hex');

if (hash !== signature) {
  throw new Error('Invalid signature');
}
```

---

## Code Examples

### JavaScript/TypeScript

```typescript
import { trpc } from '@/lib/trpc';

// Get campaigns
const campaigns = await trpc.emailCampaignDashboard.getCampaigns.query({
  page: 1,
  status: 'active'
});

// Send SMS
const sms = await trpc.smsNotificationSystem.sendSMS.mutate({
  memberId: 'member_123',
  message: 'Hello, this is a test SMS',
  priority: 'high'
});

// Get RFM analysis
const rfm = await trpc.advancedSegmentationRulesEngine.getRFMAnalysis.query({
  lookbackDays: 90
});

// Match transaction
const match = await trpc.financialReconciliationModule.matchTransaction.mutate({
  transactionId: 'txn_123',
  matchId: 'inv_456'
});
```

### Python

```python
import requests
import json

BASE_URL = 'https://finmap-spwuc63a.manus.space/api/trpc'

# Get campaigns
response = requests.post(
  f'{BASE_URL}/emailCampaignDashboard.getCampaigns',
  json={'page': 1, 'status': 'active'},
  cookies={'session': 'your_session_cookie'}
)
campaigns = response.json()

# Send SMS
response = requests.post(
  f'{BASE_URL}/smsNotificationSystem.sendSMS',
  json={
    'memberId': 'member_123',
    'message': 'Hello, this is a test SMS',
    'priority': 'high'
  },
  cookies={'session': 'your_session_cookie'}
)
sms = response.json()
```

### cURL

```bash
# Get campaigns
curl -X POST https://finmap-spwuc63a.manus.space/api/trpc/emailCampaignDashboard.getCampaigns \
  -H "Content-Type: application/json" \
  -d '{"page": 1, "status": "active"}' \
  -b "session=your_session_cookie"

# Send SMS
curl -X POST https://finmap-spwuc63a.manus.space/api/trpc/smsNotificationSystem.sendSMS \
  -H "Content-Type: application/json" \
  -d '{
    "memberId": "member_123",
    "message": "Hello, this is a test SMS",
    "priority": "high"
  }' \
  -b "session=your_session_cookie"
```

---

## Support

For API support and issues:
- Email: support@finmap.com
- Documentation: https://finmap-spwuc63a.manus.space/api-docs
- Status Page: https://status.finmap.com

---

**Last Updated:** March 30, 2026  
**API Version:** 1.0.0
