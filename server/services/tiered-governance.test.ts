import { describe, it, expect, beforeEach } from 'vitest';
import {
  getRiskTier,
  determineGovernanceLevel,
  createTransactionRequest,
  approveTransactionRequest,
  rejectTransactionRequest,
  executeTransaction,
  getTransactionRequests,
  getPendingApprovals,
  updatePortfolioAllocation,
  getPortfolioAllocation,
  calculateRebalancingRecommendations,
  checkPortfolioLimits,
  isAssetProhibited,
  getDefaultPolicy,
  generateGovernanceSummary,
  clearAllData,
  RISK_TIERS,
  RISK_TIER_INFO,
  ASSET_CLASS_RISK_TIERS
} from './tiered-governance';

describe('Tiered Governance Service', () => {
  beforeEach(() => {
    clearAllData();
  });

  describe('Risk Tier Classification', () => {
    it('should classify cash assets correctly', () => {
      expect(getRiskTier('cash')).toBe('cash');
      expect(getRiskTier('money_market')).toBe('cash');
      expect(getRiskTier('treasury_bills')).toBe('cash');
    });

    it('should classify stablecoins correctly', () => {
      expect(getRiskTier('stablecoin')).toBe('stablecoin');
      expect(getRiskTier('usdc')).toBe('stablecoin');
      expect(getRiskTier('usdt')).toBe('stablecoin');
    });

    it('should classify index funds correctly', () => {
      expect(getRiskTier('index_fund')).toBe('index');
      expect(getRiskTier('etf')).toBe('index');
      expect(getRiskTier('mutual_fund')).toBe('index');
    });

    it('should classify stocks correctly', () => {
      expect(getRiskTier('stock')).toBe('stock');
      expect(getRiskTier('equity')).toBe('stock');
      expect(getRiskTier('reit')).toBe('stock');
    });

    it('should classify volatile crypto correctly', () => {
      expect(getRiskTier('bitcoin')).toBe('volatile_crypto');
      expect(getRiskTier('ethereum')).toBe('volatile_crypto');
      expect(getRiskTier('cryptocurrency')).toBe('volatile_crypto');
    });

    it('should classify speculative assets correctly', () => {
      expect(getRiskTier('options')).toBe('speculative');
      expect(getRiskTier('futures')).toBe('speculative');
      expect(getRiskTier('penny_stock')).toBe('speculative');
    });

    it('should classify property correctly', () => {
      expect(getRiskTier('real_estate')).toBe('property');
      expect(getRiskTier('land')).toBe('property');
      expect(getRiskTier('commercial_property')).toBe('property');
    });

    it('should default unknown assets to speculative', () => {
      expect(getRiskTier('unknown_asset')).toBe('speculative');
      expect(getRiskTier('random_thing')).toBe('speculative');
    });
  });

  describe('Governance Level Determination', () => {
    const policy = getDefaultPolicy();

    it('should auto-approve small cash transactions', () => {
      expect(determineGovernanceLevel('cash', 10000, policy)).toBe('auto_approve');
      expect(determineGovernanceLevel('cash', 50000, policy)).toBe('auto_approve');
    });

    it('should require manager approval for medium transactions', () => {
      expect(determineGovernanceLevel('cash', 100000, policy)).toBe('manager_approve');
      expect(determineGovernanceLevel('index', 25000, policy)).toBe('manager_approve');
    });

    it('should require committee review for larger transactions', () => {
      expect(determineGovernanceLevel('cash', 500000, policy)).toBe('committee_review');
      expect(determineGovernanceLevel('stock', 50000, policy)).toBe('committee_review');
    });

    it('should require board approval for major transactions', () => {
      expect(determineGovernanceLevel('cash', 2000000, policy)).toBe('board_approval');
      expect(determineGovernanceLevel('index', 500000, policy)).toBe('board_approval');
    });

    it('should require special meeting for very large transactions', () => {
      expect(determineGovernanceLevel('cash', 10000000, policy)).toBe('special_meeting');
      expect(determineGovernanceLevel('index', 5000000, policy)).toBe('special_meeting');
    });

    it('should never auto-approve speculative assets', () => {
      expect(determineGovernanceLevel('speculative', 100, policy)).toBe('manager_approve');
    });

    it('should never auto-approve property', () => {
      expect(determineGovernanceLevel('property', 100, policy)).toBe('committee_review');
    });
  });

  describe('Transaction Request Creation', () => {
    it('should create and auto-approve small cash transactions', () => {
      const result = createTransactionRequest({
        type: 'buy',
        assetClass: 'cash',
        amount: 10000,
        requestedBy: 'user-1'
      });

      expect(result.success).toBe(true);
      expect(result.request).toBeDefined();
      expect(result.request!.status).toBe('auto_approved');
      expect(result.request!.riskTier).toBe('cash');
      expect(result.request!.requiredGovernanceLevel).toBe('auto_approve');
    });

    it('should create awaiting approval for larger transactions', () => {
      const result = createTransactionRequest({
        type: 'buy',
        assetClass: 'stock',
        ticker: 'AAPL',
        amount: 50000,
        requestedBy: 'user-1'
      });

      expect(result.success).toBe(true);
      expect(result.request!.status).toBe('awaiting_approval');
      expect(result.request!.riskTier).toBe('stock');
      expect(result.request!.requiredGovernanceLevel).toBe('committee_review');
    });

    it('should reject prohibited asset classes', () => {
      const result = createTransactionRequest({
        type: 'buy',
        assetClass: 'penny_stock',
        amount: 1000,
        requestedBy: 'user-1'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('prohibited');
    });

    it('should include ticker in request', () => {
      const result = createTransactionRequest({
        type: 'buy',
        assetClass: 'stock',
        ticker: 'MSFT',
        amount: 5000,
        requestedBy: 'user-1'
      });

      expect(result.success).toBe(true);
      expect(result.request!.ticker).toBe('MSFT');
    });
  });

  describe('Transaction Approval Workflow', () => {
    it('should approve transaction with sufficient authority', () => {
      const createResult = createTransactionRequest({
        type: 'buy',
        assetClass: 'stock',
        amount: 20000,
        requestedBy: 'user-1'
      });

      const approveResult = approveTransactionRequest(
        createResult.request!.id,
        'manager-1',
        'committee_review'
      );

      expect(approveResult.success).toBe(true);
      expect(approveResult.request!.status).toBe('approved');
      expect(approveResult.request!.approvedBy).toBe('manager-1');
    });

    it('should reject approval with insufficient authority', () => {
      const createResult = createTransactionRequest({
        type: 'buy',
        assetClass: 'stock',
        amount: 100000,
        requestedBy: 'user-1'
      });

      const approveResult = approveTransactionRequest(
        createResult.request!.id,
        'manager-1',
        'manager_approve'
      );

      expect(approveResult.success).toBe(false);
      expect(approveResult.error).toContain('Insufficient authority');
    });

    it('should reject transaction with reason', () => {
      const createResult = createTransactionRequest({
        type: 'buy',
        assetClass: 'volatile_crypto',
        amount: 50000,
        requestedBy: 'user-1'
      });

      const rejectResult = rejectTransactionRequest(
        createResult.request!.id,
        'committee',
        'Too risky for current market conditions'
      );

      expect(rejectResult.success).toBe(true);
      expect(rejectResult.request!.status).toBe('rejected');
      expect(rejectResult.request!.rejectionReason).toBe('Too risky for current market conditions');
    });
  });

  describe('Transaction Execution', () => {
    it('should execute approved transaction', () => {
      const createResult = createTransactionRequest({
        type: 'buy',
        assetClass: 'index_fund',
        amount: 25000,
        requestedBy: 'user-1'
      });

      approveTransactionRequest(createResult.request!.id, 'manager-1', 'manager_approve');

      const executeResult = executeTransaction(createResult.request!.id, 'trader-1');

      expect(executeResult.success).toBe(true);
      expect(executeResult.request!.status).toBe('executed');
      expect(executeResult.request!.executedAt).toBeDefined();
    });

    it('should execute auto-approved transaction', () => {
      const createResult = createTransactionRequest({
        type: 'buy',
        assetClass: 'cash',
        amount: 5000,
        requestedBy: 'user-1'
      });

      const executeResult = executeTransaction(createResult.request!.id, 'trader-1');

      expect(executeResult.success).toBe(true);
      expect(executeResult.request!.status).toBe('executed');
    });

    it('should not execute unapproved transaction', () => {
      const createResult = createTransactionRequest({
        type: 'buy',
        assetClass: 'stock',
        amount: 50000,
        requestedBy: 'user-1'
      });

      const executeResult = executeTransaction(createResult.request!.id, 'trader-1');

      expect(executeResult.success).toBe(false);
      expect(executeResult.error).toContain('Cannot execute');
    });
  });

  describe('Portfolio Limits', () => {
    const policy = getDefaultPolicy();

    it('should allow transactions within limits', () => {
      updatePortfolioAllocation('portfolio-1', {
        cash: 10,
        stablecoin: 5,
        index: 30,
        stock: 20,
        volatile_crypto: 5,
        speculative: 0,
        property: 10
      });

      const result = checkPortfolioLimits('portfolio-1', 'stock', 10000, 100000, policy);

      expect(result.allowed).toBe(true);
    });

    it('should reject transactions exceeding limits', () => {
      updatePortfolioAllocation('portfolio-1', {
        cash: 10,
        stablecoin: 5,
        index: 30,
        stock: 38,
        volatile_crypto: 5,
        speculative: 0,
        property: 10
      });

      const result = checkPortfolioLimits('portfolio-1', 'stock', 5000, 100000, policy);

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('exceed');
    });
  });

  describe('Prohibited Assets', () => {
    const policy = getDefaultPolicy();

    it('should identify prohibited asset classes', () => {
      expect(isAssetProhibited('penny_stock', undefined, policy).prohibited).toBe(true);
      expect(isAssetProhibited('meme_stock', undefined, policy).prohibited).toBe(true);
      expect(isAssetProhibited('nft', undefined, policy).prohibited).toBe(true);
    });

    it('should allow non-prohibited assets', () => {
      expect(isAssetProhibited('stock', undefined, policy).prohibited).toBe(false);
      expect(isAssetProhibited('etf', undefined, policy).prohibited).toBe(false);
    });
  });

  describe('Query Functions', () => {
    beforeEach(() => {
      // Create some test transactions
      createTransactionRequest({ type: 'buy', assetClass: 'cash', amount: 5000, requestedBy: 'user-1' });
      createTransactionRequest({ type: 'buy', assetClass: 'stock', amount: 50000, requestedBy: 'user-2' });
      createTransactionRequest({ type: 'sell', assetClass: 'index_fund', amount: 25000, requestedBy: 'user-1' });
    });

    it('should get all transaction requests', () => {
      const requests = getTransactionRequests();
      expect(requests.length).toBe(3);
    });

    it('should filter by status', () => {
      const autoApproved = getTransactionRequests({ status: 'auto_approved' });
      expect(autoApproved.length).toBe(1);

      const awaiting = getTransactionRequests({ status: 'awaiting_approval' });
      expect(awaiting.length).toBe(2);
    });

    it('should filter by risk tier', () => {
      const stockRequests = getTransactionRequests({ riskTier: 'stock' });
      expect(stockRequests.length).toBe(1);
    });

    it('should get pending approvals', () => {
      const pending = getPendingApprovals();
      expect(pending.length).toBe(2);
    });

    it('should filter pending by governance level', () => {
      const managerLevel = getPendingApprovals('manager_approve');
      expect(managerLevel.length).toBe(1); // Only the index fund one
    });
  });

  describe('Portfolio Allocation', () => {
    it('should update and retrieve portfolio allocation', () => {
      updatePortfolioAllocation('portfolio-1', {
        cash: 20,
        stablecoin: 5,
        index: 40,
        stock: 25,
        volatile_crypto: 5,
        speculative: 0,
        property: 5
      });

      const allocation = getPortfolioAllocation('portfolio-1');
      expect(allocation.cash).toBe(20);
      expect(allocation.index).toBe(40);
      expect(allocation.stock).toBe(25);
    });

    it('should return zeros for unknown portfolio', () => {
      const allocation = getPortfolioAllocation('unknown');
      expect(allocation.cash).toBe(0);
      expect(allocation.index).toBe(0);
    });
  });

  describe('Rebalancing Recommendations', () => {
    const policy = getDefaultPolicy();

    it('should recommend selling overweight positions', () => {
      updatePortfolioAllocation('portfolio-1', {
        cash: 5,
        stablecoin: 0,
        index: 70, // Way over target
        stock: 15,
        volatile_crypto: 5,
        speculative: 0,
        property: 5
      });

      const recommendations = calculateRebalancingRecommendations('portfolio-1', 100000, policy);
      const indexRec = recommendations.find(r => r.tier === 'index');

      expect(indexRec).toBeDefined();
      expect(indexRec!.action).toBe('sell');
      expect(indexRec!.difference).toBeGreaterThan(0);
    });

    it('should recommend buying underweight positions', () => {
      updatePortfolioAllocation('portfolio-1', {
        cash: 80,
        stablecoin: 0,
        index: 10, // Under target
        stock: 5,
        volatile_crypto: 0,
        speculative: 0,
        property: 5
      });

      const recommendations = calculateRebalancingRecommendations('portfolio-1', 100000, policy);
      const indexRec = recommendations.find(r => r.tier === 'index');

      expect(indexRec).toBeDefined();
      expect(indexRec!.action).toBe('buy');
    });

    it('should recommend hold for balanced positions', () => {
      updatePortfolioAllocation('portfolio-1', {
        cash: 50,
        stablecoin: 10,
        index: 40,
        stock: 0,
        volatile_crypto: 0,
        speculative: 0,
        property: 0
      });

      const recommendations = calculateRebalancingRecommendations('portfolio-1', 100000, policy);
      const cashRec = recommendations.find(r => r.tier === 'cash');

      expect(cashRec).toBeDefined();
      expect(cashRec!.action).toBe('hold');
    });
  });

  describe('Governance Summary', () => {
    beforeEach(() => {
      createTransactionRequest({ type: 'buy', assetClass: 'cash', amount: 5000, requestedBy: 'user-1' });
      createTransactionRequest({ type: 'buy', assetClass: 'stock', amount: 50000, requestedBy: 'user-2' });
      
      const result = createTransactionRequest({ type: 'buy', assetClass: 'index_fund', amount: 25000, requestedBy: 'user-1' });
      approveTransactionRequest(result.request!.id, 'manager', 'manager_approve');
    });

    it('should generate accurate summary', () => {
      const summary = generateGovernanceSummary();

      expect(summary.totalRequests).toBe(3);
      expect(summary.byStatus.auto_approved).toBe(1);
      expect(summary.byStatus.awaiting_approval).toBe(1);
      expect(summary.byStatus.approved).toBe(1);
      expect(summary.pendingApprovals).toBe(1);
    });

    it('should calculate approved value', () => {
      const summary = generateGovernanceSummary();
      expect(summary.totalApprovedValue).toBe(30000); // 5000 auto + 25000 approved
    });
  });

  describe('Risk Tier Info', () => {
    it('should have info for all risk tiers', () => {
      for (const tier of RISK_TIERS) {
        expect(RISK_TIER_INFO[tier]).toBeDefined();
        expect(RISK_TIER_INFO[tier].name).toBeDefined();
        expect(RISK_TIER_INFO[tier].riskLevel).toBeGreaterThanOrEqual(1);
        expect(RISK_TIER_INFO[tier].riskLevel).toBeLessThanOrEqual(10);
      }
    });

    it('should have increasing risk levels', () => {
      expect(RISK_TIER_INFO.cash.riskLevel).toBeLessThan(RISK_TIER_INFO.stablecoin.riskLevel);
      expect(RISK_TIER_INFO.stablecoin.riskLevel).toBeLessThan(RISK_TIER_INFO.index.riskLevel);
      expect(RISK_TIER_INFO.index.riskLevel).toBeLessThan(RISK_TIER_INFO.stock.riskLevel);
      expect(RISK_TIER_INFO.stock.riskLevel).toBeLessThan(RISK_TIER_INFO.volatile_crypto.riskLevel);
      expect(RISK_TIER_INFO.volatile_crypto.riskLevel).toBeLessThan(RISK_TIER_INFO.speculative.riskLevel);
    });
  });
});
