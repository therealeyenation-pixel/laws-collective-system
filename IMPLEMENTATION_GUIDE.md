# LuvOnPurpose System - Implementation Guide

## Quick Start

### Prerequisites
- Node.js 22.13.0+
- MySQL 8.0+
- pnpm package manager

### Installation

```bash
cd /home/ubuntu/financial_automation_map
pnpm install
pnpm db:push
pnpm dev
```

## Router Integration

All routers are integrated into the main application router in `server/routers.ts`. Each router is namespaced for clean API organization.

### Available Routers

| Router | Namespace | Purpose |
|--------|-----------|---------|
| Autonomous Engine | `autonomousEngine` | Business operations and AI decisions |
| Curriculum Generation | `curriculumGeneration` | Educational content creation |
| Gamified Simulator | `gamifiedSimulator` | Game mechanics and token earning |
| Crypto Wallet | `cryptoWallet` | Cryptocurrency management |
| Offline Sync | `offlineSync` | Offline-first sync operations |
| LuvLedger Tracking | `luvLedgerTracking` | Activity tracking and blockchain logging |
| Audit Trail UI | `auditTrailUI` | Human oversight and reporting |

### API Usage Examples

#### Autonomous Engine
```typescript
// Execute autonomous operation
const result = await trpc.autonomousEngine.executeAutonomousOperation.mutate({
  businessEntityId: 1,
  operationType: "income_generation",
  parameters: { targetAmount: 1000 }
});

// Get operation history
const history = await trpc.autonomousEngine.getOperationHistory.query({
  businessEntityId: 1,
  limit: 50
});
```

#### Curriculum Generation
```typescript
// Generate curriculum
const curriculum = await trpc.curriculumGeneration.generateCurriculum.mutate({
  businessEntityId: 1,
  targetAudience: "young_adults",
  focusAreas: ["finance", "business"]
});

// Get curriculum versions
const versions = await trpc.curriculumGeneration.getCurriculumVersions.query({
  businessEntityId: 1
});
```

#### Gamified Simulator
```typescript
// Create game session
const session = await trpc.gamifiedSimulator.createGameSession.mutate({
  simulatorId: 1,
  difficulty: "intermediate"
});

// Process game decision
const outcome = await trpc.gamifiedSimulator.processGameDecision.mutate({
  sessionId: session.sessionId,
  decision: "invest_in_marketing"
});

// Complete game
const result = await trpc.gamifiedSimulator.completeGameSession.mutate({
  sessionId: session.sessionId
});
```

#### Crypto Wallet
```typescript
// Create wallet
const wallet = await trpc.cryptoWallet.createWallet.mutate({
  walletType: "ethereum",
  walletAddress: "0x...",
  publicKey: "0x..."
});

// Convert tokens to crypto
const conversion = await trpc.cryptoWallet.convertTokensToCrypto.mutate({
  walletId: wallet.walletId,
  tokenAmount: 100,
  conversionRate: 0.01
});

// Get holdings
const holdings = await trpc.cryptoWallet.getTotalHoldings.query();
```

#### Offline Sync
```typescript
// Queue operation
const queued = await trpc.offlineSync.queueOperation.mutate({
  operationType: "create_business",
  entityType: "business",
  entityId: 1,
  payload: { name: "New Business" },
  priority: "normal"
});

// Get pending operations
const pending = await trpc.offlineSync.getPendingOperations.query({
  limit: 50
});

// Mark as synced
const synced = await trpc.offlineSync.markAsSynced.mutate({
  queueId: queued.queueId,
  result: { success: true }
});
```

#### LuvLedger Tracking
```typescript
// Log certificate issuance
const logged = await trpc.luvLedgerTracking.logCertificateIssuance.mutate({
  certificateId: 1,
  accountId: 1,
  amount: 500,
  description: "Financial Literacy Certificate"
});

// Get account balance
const balance = await trpc.luvLedgerTracking.getAccountBalance.query({
  accountId: 1
});

// Verify blockchain integrity
const verification = await trpc.luvLedgerTracking.verifyBlockchainIntegrity.query({
  transactionId: 1
});
```

#### Audit Trail UI
```typescript
// Get audit trail
const trail = await trpc.auditTrailUI.getAuditTrail.query({
  page: 1,
  limit: 50,
  activityType: "autonomous_operation"
});

// Review operation
const reviewed = await trpc.auditTrailUI.reviewOperation.mutate({
  operationId: 1,
  approved: true,
  notes: "Operation approved by admin"
});

// Get blockchain status
const status = await trpc.auditTrailUI.getBlockchainStatus.query();

// Export audit trail
const export_data = await trpc.auditTrailUI.exportAuditTrail.query({
  format: "json",
  dateFrom: new Date("2024-01-01"),
  dateTo: new Date("2024-12-31")
});
```

## Database Operations

### Running Migrations
```bash
pnpm db:push
```

### Generating Migrations
```bash
pnpm db:generate
```

### Executing Custom SQL
```typescript
import { webdev_execute_sql } from "@manus/webdev";

await webdev_execute_sql({
  brief: "Custom query",
  query: "SELECT * FROM users LIMIT 10"
});
```

## Testing

### Running Tests
```bash
pnpm test
```

### Test Coverage
The system includes comprehensive tests for:
- Curriculum generation
- Game mechanics
- Cryptocurrency operations
- Offline sync
- LuvLedger tracking
- Blockchain verification
- Activity auditing

## Deployment

### Pre-Deployment Checklist
- [ ] All tests passing
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Blockchain records verified
- [ ] Audit trail complete
- [ ] Performance benchmarks acceptable

### Deployment Steps
1. Create checkpoint via `webdev_save_checkpoint`
2. Review changes in Management UI
3. Click Publish button to deploy
4. Monitor logs for errors
5. Verify all endpoints responding

## Troubleshooting

### Common Issues

**Database Connection Error**
- Check MySQL service is running
- Verify DATABASE_URL environment variable
- Ensure credentials are correct

**Blockchain Hash Mismatch**
- Verify transaction data integrity
- Check blockchain record creation
- Review activity audit trail

**Sync Conflicts**
- Review conflict resolution logs
- Check sync queue status
- Resolve conflicts manually if needed

**Token Balance Issues**
- Verify token transaction logs
- Check token account balances
- Review conversion operations

## Performance Tuning

### Database Optimization
- Ensure indexes are created on key fields
- Use pagination for large result sets
- Cache frequently accessed data

### API Optimization
- Implement request batching
- Use pagination for list endpoints
- Cache blockchain verification results

### Sync Optimization
- Batch sync operations together
- Prioritize high-priority operations
- Clean up old synced operations

## Security Best Practices

1. **Input Validation**: All inputs validated via Zod schemas
2. **Authentication**: Protected procedures require user context
3. **Authorization**: User-specific data isolation
4. **Blockchain**: Immutable records prevent tampering
5. **Encryption**: Sensitive data hashed and verified
6. **Audit Trail**: Complete activity logging

## Monitoring

### Key Metrics to Monitor
- Autonomous operation success rate
- Curriculum generation quality
- Game completion rate
- Token transaction volume
- Sync success rate
- Blockchain verification rate
- Audit trail completeness

### Logging
All operations are logged to the activity audit trail with timestamps and details for complete traceability.

## Support and Maintenance

### Regular Maintenance Tasks
- Review audit trail for anomalies
- Verify blockchain integrity
- Check sync queue for failures
- Monitor token economy health
- Update curriculum content

### Backup and Recovery
- Regular database backups
- Blockchain record verification
- Audit trail archival
- Transaction log retention

## Additional Resources

- System Architecture: See `SYSTEM_ARCHITECTURE.md`
- Database Schema: See `drizzle/schema.ts`
- Router Implementations: See `server/routers/`
- Test Suite: See `server/system.test.ts`

## Contact and Support

For issues, questions, or feature requests, please refer to the project documentation or contact the development team.
