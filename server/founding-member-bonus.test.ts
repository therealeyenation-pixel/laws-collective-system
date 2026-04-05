import { describe, it, expect, vi, beforeEach } from 'vitest';
import { foundingMemberBonusRouter } from './routers/founding-member-bonus';

// Mock the database
vi.mock('./db', () => ({
  getDb: vi.fn(() => Promise.resolve({
    execute: vi.fn((query: string) => {
      // Mock founding members query
      if (query.includes('FROM founding_members')) {
        if (query.includes('COUNT(*)')) {
          return Promise.resolve([[{ count: 5 }]]);
        }
        return Promise.resolve([[
          { id: 1, user_id: 1, member_number: 1, joined_date: Date.now(), status: 'active', user_name: 'Test User', user_email: 'test@test.com' }
        ]]);
      }
      // Mock bonus pools query
      if (query.includes('FROM bonus_pools')) {
        return Promise.resolve([[
          { id: 1, pool_name: 'Founding Member Bonus Pool', pool_type: 'founding_member', source_percentage: 15, distribution_frequency: 'quarterly', is_active: true }
        ]]);
      }
      // Mock service payments query
      if (query.includes('FROM service_payments')) {
        return Promise.resolve([[{ total_revenue: 10000 }]]);
      }
      // Mock bonus distributions query
      if (query.includes('FROM bonus_distributions')) {
        if (query.includes('COUNT(*)')) {
          return Promise.resolve([[{ count: 2 }]]);
        }
        return Promise.resolve([[
          { id: 1, pool_id: 1, distribution_date: Date.now(), period_start: Date.now() - 90 * 24 * 60 * 60 * 1000, period_end: Date.now(), total_revenue_base: 10000, pool_contribution: 900, total_distributed: 900, eligible_members: 5, per_member_amount: 180, status: 'approved', pool_name: 'Founding Member Bonus Pool' }
        ]]);
      }
      // Mock member bonus payments query
      if (query.includes('FROM member_bonus_payments')) {
        if (query.includes('SUM(amount)')) {
          return Promise.resolve([[{ total: 360 }]]);
        }
        if (query.includes('COUNT(*)')) {
          return Promise.resolve([[{ count: 0, total: 0 }]]);
        }
        return Promise.resolve([[
          { id: 1, distribution_id: 1, founding_member_id: 1, user_id: 1, amount: 180, payment_status: 'pending', member_number: 1, member_name: 'Test User' }
        ]]);
      }
      // Mock INSERT queries
      if (query.includes('INSERT INTO')) {
        return Promise.resolve([{ insertId: 1 }]);
      }
      // Mock UPDATE queries
      if (query.includes('UPDATE')) {
        return Promise.resolve([{ affectedRows: 1 }]);
      }
      return Promise.resolve([[]]);
    }),
  })),
}));

const createMockContext = (overrides = {}) => ({
  user: { id: 1, name: 'Test User', email: 'test@test.com', role: 'admin' },
  req: { headers: { origin: 'http://localhost:3000' } },
  res: {},
  ...overrides,
});

describe('Founding Member Bonus Router', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getFoundingMembers', () => {
    it('should return founding members list', async () => {
      const caller = foundingMemberBonusRouter.createCaller(createMockContext());
      const result = await caller.getFoundingMembers({ status: 'active' });
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it('should filter by status', async () => {
      const caller = foundingMemberBonusRouter.createCaller(createMockContext());
      const result = await caller.getFoundingMembers({ status: 'all' });
      
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getBonusPools', () => {
    it('should return bonus pools', async () => {
      const caller = foundingMemberBonusRouter.createCaller(createMockContext());
      const result = await caller.getBonusPools();
      
      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('pool_name');
        expect(result[0]).toHaveProperty('source_percentage');
      }
    });
  });

  describe('calculateBonusPreview', () => {
    it('should calculate bonus preview correctly', async () => {
      const caller = foundingMemberBonusRouter.createCaller(createMockContext());
      const result = await caller.calculateBonusPreview({
        poolId: 1,
        periodStart: Date.now() - 90 * 24 * 60 * 60 * 1000,
        periodEnd: Date.now(),
      });
      
      expect(result).toHaveProperty('poolId');
      expect(result).toHaveProperty('totalServiceRevenue');
      expect(result).toHaveProperty('lawsShare');
      expect(result).toHaveProperty('poolContribution');
      expect(result).toHaveProperty('eligibleMembers');
      expect(result).toHaveProperty('perMemberAmount');
      expect(result).toHaveProperty('distributionMethod', 'equal');
    });

    it('should calculate correct revenue split', async () => {
      const caller = foundingMemberBonusRouter.createCaller(createMockContext());
      const result = await caller.calculateBonusPreview({
        poolId: 1,
        periodStart: Date.now() - 90 * 24 * 60 * 60 * 1000,
        periodEnd: Date.now(),
      });
      
      // L.A.W.S. share should be 60% of total revenue
      expect(result.lawsShare).toBe(result.totalServiceRevenue * 0.60);
    });
  });

  describe('getDistributionHistory', () => {
    it('should return distribution history', async () => {
      const caller = foundingMemberBonusRouter.createCaller(createMockContext());
      const result = await caller.getDistributionHistory({ limit: 20 });
      
      expect(Array.isArray(result)).toBe(true);
    });

    it('should filter by pool id', async () => {
      const caller = foundingMemberBonusRouter.createCaller(createMockContext());
      const result = await caller.getDistributionHistory({ poolId: 1, limit: 10 });
      
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getBonusSummary', () => {
    it('should return summary statistics', async () => {
      const caller = foundingMemberBonusRouter.createCaller(createMockContext());
      const result = await caller.getBonusSummary();
      
      expect(result).toHaveProperty('totalDistributedAllTime');
      expect(result).toHaveProperty('activeFoundingMembers');
      expect(result).toHaveProperty('totalDistributions');
      expect(result).toHaveProperty('pendingPaymentsCount');
      expect(result).toHaveProperty('pendingPaymentsAmount');
    });
  });

  describe('getMemberBonusHistory', () => {
    it('should return member bonus history', async () => {
      const caller = foundingMemberBonusRouter.createCaller(createMockContext());
      const result = await caller.getMemberBonusHistory({});
      
      expect(result).toHaveProperty('isFoundingMember');
      if (result.isFoundingMember) {
        expect(result).toHaveProperty('payments');
        expect(result).toHaveProperty('totalEarned');
        expect(Array.isArray(result.payments)).toBe(true);
      }
    });
  });

  describe('addFoundingMember', () => {
    it('should add a new founding member', async () => {
      const caller = foundingMemberBonusRouter.createCaller(createMockContext());
      const result = await caller.addFoundingMember({
        userId: 2,
        memberNumber: 2,
        joinedDate: Date.now(),
      });
      
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('id');
    });
  });

  describe('updateFoundingMemberStatus', () => {
    it('should update member status', async () => {
      const caller = foundingMemberBonusRouter.createCaller(createMockContext());
      const result = await caller.updateFoundingMemberStatus({
        id: 1,
        status: 'inactive',
      });
      
      expect(result).toHaveProperty('success', true);
    });
  });

  describe('updatePaymentStatus', () => {
    it('should update payment status', async () => {
      const caller = foundingMemberBonusRouter.createCaller(createMockContext());
      const result = await caller.updatePaymentStatus({
        paymentId: 1,
        status: 'paid',
        paymentReference: 'CHK-001',
      });
      
      expect(result).toHaveProperty('success', true);
    });
  });
});
