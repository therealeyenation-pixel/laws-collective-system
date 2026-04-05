import { describe, it, expect, beforeEach } from 'vitest';
import { sponsorAnalytics } from './routers/sponsor-analytics';

describe('Sponsor Analytics Router', () => {
  const mockCreatorId = 'creator-123';
  const mockChannelId = 'channel-456';

  describe('getCreatorMetrics', () => {
    it('should return creator metrics with revenue breakdown', async () => {
      const result = await sponsorAnalytics.createCaller({} as any).getCreatorMetrics({ creatorId: mockCreatorId });
      expect(result).toBeDefined();
      expect(result.totalRevenue).toBe(15750.50);
      expect(result.sponsorshipRevenue).toBe(8500.00);
      expect(result.cpm).toBe(0.012);
    });

    it('should calculate RPM and CPM correctly', async () => {
      const result = await sponsorAnalytics.createCaller({} as any).getCreatorMetrics({ creatorId: mockCreatorId });
      expect(result.rpm).toBeGreaterThan(0);
      expect(result.cpm).toBeGreaterThan(0);
    });
  });

  describe('getAudienceDemographics', () => {
    it('should return audience demographics by age and gender', async () => {
      const result = await sponsorAnalytics.createCaller({} as any).getAudienceDemographics({
        creatorId: mockCreatorId,
        channelId: mockChannelId,
      });
      expect(result.demographics).toHaveLength(5);
      expect(result.demographics[0]).toHaveProperty('ageGroup');
      expect(result.demographics[0]).toHaveProperty('engagementScore');
    });

    it('should identify top countries', async () => {
      const result = await sponsorAnalytics.createCaller({} as any).getAudienceDemographics({
        creatorId: mockCreatorId,
        channelId: mockChannelId,
      });
      expect(result.topCountries).toContain('US');
      expect(result.topCountries.length).toBeGreaterThan(0);
    });
  });

  describe('getSponsorshipDeals', () => {
    it('should return active sponsorship deals', async () => {
      const result = await sponsorAnalytics.createCaller({} as any).getSponsorshipDeals({ creatorId: mockCreatorId });
      expect(result.activeSponsorships).toBeDefined();
      expect(result.activeSponsorships.length).toBeGreaterThan(0);
    });

    it('should track impressions delivered vs required', async () => {
      const result = await sponsorAnalytics.createCaller({} as any).getSponsorshipDeals({ creatorId: mockCreatorId });
      const deal = result.activeSponsorships[0];
      expect(deal.impressionsDelivered).toBeLessThanOrEqual(deal.impressionsRequired);
    });

    it('should list completed sponsorships', async () => {
      const result = await sponsorAnalytics.createCaller({} as any).getSponsorshipDeals({ creatorId: mockCreatorId });
      expect(result.completedSponsorships).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getEngagementMetrics', () => {
    it('should return engagement metrics for time range', async () => {
      const result = await sponsorAnalytics.createCaller({} as any).getEngagementMetrics({
        creatorId: mockCreatorId,
        channelId: mockChannelId,
        timeRange: 'month',
      });
      expect(result.likes).toBeGreaterThan(0);
      expect(result.comments).toBeGreaterThan(0);
      expect(result.engagementRate).toBeGreaterThan(0);
    });

    it('should calculate sentiment score', async () => {
      const result = await sponsorAnalytics.createCaller({} as any).getEngagementMetrics({
        creatorId: mockCreatorId,
        channelId: mockChannelId,
        timeRange: 'week',
      });
      expect(result.sentimentScore).toBeGreaterThanOrEqual(0);
      expect(result.sentimentScore).toBeLessThanOrEqual(10);
    });

    it('should return top comments with sentiment', async () => {
      const result = await sponsorAnalytics.createCaller({} as any).getEngagementMetrics({
        creatorId: mockCreatorId,
        channelId: mockChannelId,
        timeRange: 'day',
      });
      expect(result.topComments).toBeDefined();
      expect(result.topComments[0]).toHaveProperty('sentiment');
    });
  });

  describe('getCreatorPerformance', () => {
    it('should return performance score and tier', async () => {
      const result = await sponsorAnalytics.createCaller({} as any).getCreatorPerformance({ creatorId: mockCreatorId });
      expect(result.performanceScore).toBeGreaterThan(0);
      expect(['bronze', 'silver', 'gold', 'platinum']).toContain(result.tier);
    });

    it('should provide growth rate', async () => {
      const result = await sponsorAnalytics.createCaller({} as any).getCreatorPerformance({ creatorId: mockCreatorId });
      expect(result.growthRate).toBeGreaterThanOrEqual(0);
    });

    it('should provide recommendations', async () => {
      const result = await sponsorAnalytics.createCaller({} as any).getCreatorPerformance({ creatorId: mockCreatorId });
      expect(result.recommendations).toHaveLength(4);
    });
  });

  describe('getPaymentHistory', () => {
    it('should return payment history with status', async () => {
      const result = await sponsorAnalytics.createCaller({} as any).getPaymentHistory({ creatorId: mockCreatorId });
      expect(result.payments).toBeDefined();
      expect(result.payments[0]).toHaveProperty('status');
    });

    it('should calculate total paid', async () => {
      const result = await sponsorAnalytics.createCaller({} as any).getPaymentHistory({ creatorId: mockCreatorId });
      expect(result.totalPaid).toBeGreaterThan(0);
    });

    it('should track pending payments', async () => {
      const result = await sponsorAnalytics.createCaller({} as any).getPaymentHistory({ creatorId: mockCreatorId });
      expect(result.pendingPayments).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getRevenueBreakdown', () => {
    it('should breakdown revenue by source', async () => {
      const result = await sponsorAnalytics.createCaller({} as any).getRevenueBreakdown({
        creatorId: mockCreatorId,
        timeRange: 'month',
      });
      expect(result.breakdown).toHaveProperty('sponsorships');
      expect(result.breakdown).toHaveProperty('ads');
      expect(result.breakdown).toHaveProperty('donations');
    });

    it('should calculate revenue percentages', async () => {
      const result = await sponsorAnalytics.createCaller({} as any).getRevenueBreakdown({
        creatorId: mockCreatorId,
        timeRange: 'quarter',
      });
      const total = Object.values(result.breakdown).reduce((a, b) => a + b, 0);
      expect(total).toBeCloseTo(100, 1);
    });

    it('should track revenue trend', async () => {
      const result = await sponsorAnalytics.createCaller({} as any).getRevenueBreakdown({
        creatorId: mockCreatorId,
        timeRange: 'year',
      });
      expect(['up', 'down', 'stable']).toContain(result.trend);
    });
  });

  describe('getTopPerformingContent', () => {
    it('should return top performing content', async () => {
      const result = await sponsorAnalytics.createCaller({} as any).getTopPerformingContent({ creatorId: mockCreatorId });
      expect(result.topContent).toHaveLength(5);
    });

    it('should rank by views', async () => {
      const result = await sponsorAnalytics.createCaller({} as any).getTopPerformingContent({ creatorId: mockCreatorId });
      for (let i = 0; i < result.topContent.length - 1; i++) {
        expect(result.topContent[i].views).toBeGreaterThanOrEqual(result.topContent[i + 1].views);
      }
    });
  });

  describe('getRetentionAnalytics', () => {
    it('should return retention curve', async () => {
      const result = await sponsorAnalytics.createCaller({} as any).getRetentionAnalytics({
        creatorId: mockCreatorId,
        channelId: mockChannelId,
      });
      expect(result.retentionCurve).toBeDefined();
      expect(result.retentionCurve.length).toBeGreaterThan(0);
    });

    it('should identify drop-off points', async () => {
      const result = await sponsorAnalytics.createCaller({} as any).getRetentionAnalytics({
        creatorId: mockCreatorId,
        channelId: mockChannelId,
      });
      expect(result.dropOffPoints).toBeDefined();
      expect(result.dropOffPoints[0]).toHaveProperty('reason');
    });
  });

  describe('getSponsorOpportunities', () => {
    it('should return potential sponsor opportunities', async () => {
      const result = await sponsorAnalytics.createCaller({} as any).getSponsorOpportunities({ creatorId: mockCreatorId });
      expect(result.opportunities).toBeDefined();
      expect(result.opportunities.length).toBeGreaterThan(0);
    });

    it('should calculate fit score', async () => {
      const result = await sponsorAnalytics.createCaller({} as any).getSponsorOpportunities({ creatorId: mockCreatorId });
      const opportunity = result.opportunities[0];
      expect(opportunity.fit).toBeGreaterThan(0);
      expect(opportunity.fit).toBeLessThanOrEqual(100);
    });
  });

  describe('updateCreatorMetrics', () => {
    it('should update metrics successfully', async () => {
      const result = await sponsorAnalytics.createCaller({} as any).updateCreatorMetrics({
        creatorId: mockCreatorId,
        metrics: { totalRevenue: 20000 },
      });
      expect(result.success).toBe(true);
    });
  });

  describe('requestPayment', () => {
    it('should create payment request', async () => {
      const result = await sponsorAnalytics.createCaller({} as any).requestPayment({
        creatorId: mockCreatorId,
        amount: 5000,
        paymentMethod: 'bank_transfer',
      });
      expect(result.success).toBe(true);
      expect(result.paymentId).toBeDefined();
      expect(result.status).toBe('pending');
    });
  });

  describe('exportAnalytics', () => {
    it('should export analytics in requested format', async () => {
      const result = await sponsorAnalytics.createCaller({} as any).exportAnalytics({
        creatorId: mockCreatorId,
        format: 'csv',
        timeRange: 'month',
      });
      expect(result.success).toBe(true);
      expect(result.downloadUrl).toContain('.csv');
    });

    it('should support multiple export formats', async () => {
      for (const format of ['csv', 'pdf', 'json']) {
        const result = await sponsorAnalytics.createCaller({} as any).exportAnalytics({
          creatorId: mockCreatorId,
          format: format as any,
          timeRange: 'quarter',
        });
        expect(result.downloadUrl).toContain(format);
      }
    });
  });
});
