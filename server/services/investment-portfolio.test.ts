import { describe, it, expect, beforeEach } from 'vitest';
import {
  ASSET_CLASSES,
  TRANSACTION_TYPES,
  ACCOUNT_TYPES,
  createInvestmentAccount,
  getInvestmentAccount,
  listInvestmentAccounts,
  updateAccountStatus,
  createHolding,
  getHolding,
  listHoldings,
  updateHoldingPrice,
  updateHoldingShares,
  recordTransaction,
  getTransaction,
  listTransactions,
  recordDividend,
  listDividends,
  calculatePortfolioAllocation,
  calculatePortfolioPerformance,
  calculateTaxLots,
  generatePortfolioSummary,
  generateRebalancingSuggestions,
  linkTransactionToLuvLedger,
  clearAllInvestmentData,
} from './investment-portfolio';

describe('Investment Portfolio Management', () => {
  beforeEach(() => {
    clearAllInvestmentData();
  });

  describe('Constants', () => {
    it('should have 9 asset classes', () => {
      expect(ASSET_CLASSES).toHaveLength(9);
      expect(ASSET_CLASSES).toContain('stocks');
      expect(ASSET_CLASSES).toContain('bonds');
      expect(ASSET_CLASSES).toContain('cryptocurrency');
    });

    it('should have 10 transaction types', () => {
      expect(TRANSACTION_TYPES).toHaveLength(10);
      expect(TRANSACTION_TYPES).toContain('buy');
      expect(TRANSACTION_TYPES).toContain('sell');
      expect(TRANSACTION_TYPES).toContain('dividend');
    });

    it('should have 11 account types', () => {
      expect(ACCOUNT_TYPES).toHaveLength(11);
      expect(ACCOUNT_TYPES).toContain('brokerage');
      expect(ACCOUNT_TYPES).toContain('ira_traditional');
      expect(ACCOUNT_TYPES).toContain('nonprofit_endowment');
    });
  });

  describe('Account Management', () => {
    it('should create an investment account', () => {
      const account = createInvestmentAccount({
        entityId: 'entity-1',
        accountName: 'Main Brokerage',
        accountType: 'brokerage',
        custodian: 'Fidelity',
        accountNumber: 'XXX-1234',
        taxStatus: 'taxable',
        openedDate: new Date('2024-01-01'),
      });

      expect(account.id).toBeDefined();
      expect(account.accountName).toBe('Main Brokerage');
      expect(account.accountType).toBe('brokerage');
      expect(account.status).toBe('active');
    });

    it('should retrieve an account by ID', () => {
      const created = createInvestmentAccount({
        entityId: 'entity-1',
        accountName: 'Test Account',
        accountType: 'ira_roth',
        custodian: 'Vanguard',
        accountNumber: 'XXX-5678',
        taxStatus: 'tax_exempt',
        openedDate: new Date('2024-01-01'),
      });

      const retrieved = getInvestmentAccount(created.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.accountName).toBe('Test Account');
    });

    it('should list accounts by entity', () => {
      createInvestmentAccount({
        entityId: 'entity-1',
        accountName: 'Account 1',
        accountType: 'brokerage',
        custodian: 'Fidelity',
        accountNumber: 'XXX-1',
        taxStatus: 'taxable',
        openedDate: new Date(),
      });

      createInvestmentAccount({
        entityId: 'entity-2',
        accountName: 'Account 2',
        accountType: 'brokerage',
        custodian: 'Schwab',
        accountNumber: 'XXX-2',
        taxStatus: 'taxable',
        openedDate: new Date(),
      });

      const entity1Accounts = listInvestmentAccounts('entity-1');
      expect(entity1Accounts).toHaveLength(1);
      expect(entity1Accounts[0].accountName).toBe('Account 1');
    });

    it('should update account status', () => {
      const account = createInvestmentAccount({
        entityId: 'entity-1',
        accountName: 'Test',
        accountType: 'brokerage',
        custodian: 'Test',
        accountNumber: 'XXX',
        taxStatus: 'taxable',
        openedDate: new Date(),
      });

      const updated = updateAccountStatus(account.id, 'frozen');
      expect(updated?.status).toBe('frozen');
    });
  });

  describe('Holding Management', () => {
    it('should create a holding with calculated values', () => {
      const account = createInvestmentAccount({
        entityId: 'entity-1',
        accountName: 'Test',
        accountType: 'brokerage',
        custodian: 'Test',
        accountNumber: 'XXX',
        taxStatus: 'taxable',
        openedDate: new Date(),
      });

      const holding = createHolding({
        accountId: account.id,
        ticker: 'AAPL',
        name: 'Apple Inc.',
        assetClass: 'stocks',
        shares: 100,
        costBasis: 15000, // $150/share
        currentPrice: 175,
        purchaseDate: new Date('2024-01-01'),
      });

      expect(holding.currentValue).toBe(17500); // 100 * 175
      expect(holding.unrealizedGainLoss).toBe(2500); // 17500 - 15000
      expect(holding.unrealizedGainLossPercent).toBeCloseTo(16.67, 1);
    });

    it('should update holding price and recalculate values', () => {
      const account = createInvestmentAccount({
        entityId: 'entity-1',
        accountName: 'Test',
        accountType: 'brokerage',
        custodian: 'Test',
        accountNumber: 'XXX',
        taxStatus: 'taxable',
        openedDate: new Date(),
      });

      const holding = createHolding({
        accountId: account.id,
        ticker: 'MSFT',
        name: 'Microsoft',
        assetClass: 'stocks',
        shares: 50,
        costBasis: 10000,
        currentPrice: 200,
        purchaseDate: new Date(),
      });

      const updated = updateHoldingPrice(holding.id, 250);
      expect(updated?.currentValue).toBe(12500);
      expect(updated?.unrealizedGainLoss).toBe(2500);
    });

    it('should update holding shares', () => {
      const account = createInvestmentAccount({
        entityId: 'entity-1',
        accountName: 'Test',
        accountType: 'brokerage',
        custodian: 'Test',
        accountNumber: 'XXX',
        taxStatus: 'taxable',
        openedDate: new Date(),
      });

      const holding = createHolding({
        accountId: account.id,
        ticker: 'GOOGL',
        name: 'Alphabet',
        assetClass: 'stocks',
        shares: 20,
        costBasis: 2000,
        currentPrice: 150,
        purchaseDate: new Date(),
      });

      const updated = updateHoldingShares(holding.id, 10, 1500);
      expect(updated?.shares).toBe(30);
      expect(updated?.costBasis).toBe(3500);
    });

    it('should close holding when shares reach zero', () => {
      const account = createInvestmentAccount({
        entityId: 'entity-1',
        accountName: 'Test',
        accountType: 'brokerage',
        custodian: 'Test',
        accountNumber: 'XXX',
        taxStatus: 'taxable',
        openedDate: new Date(),
      });

      const holding = createHolding({
        accountId: account.id,
        ticker: 'TSLA',
        name: 'Tesla',
        assetClass: 'stocks',
        shares: 10,
        costBasis: 2000,
        currentPrice: 200,
        purchaseDate: new Date(),
      });

      const updated = updateHoldingShares(holding.id, -10, -2000);
      expect(updated?.shares).toBe(0);
      expect(updated?.status).toBe('closed');
    });
  });

  describe('Transaction Management', () => {
    it('should record a buy transaction', () => {
      const account = createInvestmentAccount({
        entityId: 'entity-1',
        accountName: 'Test',
        accountType: 'brokerage',
        custodian: 'Test',
        accountNumber: 'XXX',
        taxStatus: 'taxable',
        openedDate: new Date(),
      });

      const transaction = recordTransaction({
        accountId: account.id,
        transactionType: 'buy',
        ticker: 'VTI',
        shares: 50,
        pricePerShare: 200,
        fees: 5,
        transactionDate: new Date(),
      });

      expect(transaction.totalAmount).toBe(10000);
      expect(transaction.netAmount).toBe(10005); // buy adds fees
    });

    it('should record a sell transaction', () => {
      const account = createInvestmentAccount({
        entityId: 'entity-1',
        accountName: 'Test',
        accountType: 'brokerage',
        custodian: 'Test',
        accountNumber: 'XXX',
        taxStatus: 'taxable',
        openedDate: new Date(),
      });

      const transaction = recordTransaction({
        accountId: account.id,
        transactionType: 'sell',
        ticker: 'SPY',
        shares: 25,
        pricePerShare: 450,
        fees: 5,
        transactionDate: new Date(),
      });

      expect(transaction.totalAmount).toBe(11250);
      expect(transaction.netAmount).toBe(11245); // sell subtracts fees
    });

    it('should filter transactions by type', () => {
      const account = createInvestmentAccount({
        entityId: 'entity-1',
        accountName: 'Test',
        accountType: 'brokerage',
        custodian: 'Test',
        accountNumber: 'XXX',
        taxStatus: 'taxable',
        openedDate: new Date(),
      });

      recordTransaction({
        accountId: account.id,
        transactionType: 'buy',
        ticker: 'AAPL',
        shares: 10,
        pricePerShare: 150,
        transactionDate: new Date(),
      });

      recordTransaction({
        accountId: account.id,
        transactionType: 'sell',
        ticker: 'MSFT',
        shares: 5,
        pricePerShare: 300,
        transactionDate: new Date(),
      });

      const buyTransactions = listTransactions({ transactionType: 'buy' });
      expect(buyTransactions).toHaveLength(1);
      expect(buyTransactions[0].ticker).toBe('AAPL');
    });
  });

  describe('Dividend Management', () => {
    it('should record a dividend', () => {
      const account = createInvestmentAccount({
        entityId: 'entity-1',
        accountName: 'Test',
        accountType: 'brokerage',
        custodian: 'Test',
        accountNumber: 'XXX',
        taxStatus: 'taxable',
        openedDate: new Date(),
      });

      const holding = createHolding({
        accountId: account.id,
        ticker: 'JNJ',
        name: 'Johnson & Johnson',
        assetClass: 'stocks',
        shares: 100,
        costBasis: 15000,
        currentPrice: 160,
        purchaseDate: new Date(),
      });

      const dividend = recordDividend({
        holdingId: holding.id,
        accountId: account.id,
        ticker: 'JNJ',
        exDividendDate: new Date('2024-03-01'),
        paymentDate: new Date('2024-03-15'),
        dividendPerShare: 1.19,
        shares: 100,
        taxWithheld: 0,
        reinvested: false,
      });

      expect(dividend.grossAmount).toBe(119);
      expect(dividend.netAmount).toBe(119);
    });

    it('should record a reinvested dividend', () => {
      const account = createInvestmentAccount({
        entityId: 'entity-1',
        accountName: 'Test',
        accountType: 'brokerage',
        custodian: 'Test',
        accountNumber: 'XXX',
        taxStatus: 'taxable',
        openedDate: new Date(),
      });

      const holding = createHolding({
        accountId: account.id,
        ticker: 'VYM',
        name: 'Vanguard High Dividend',
        assetClass: 'etfs',
        shares: 200,
        costBasis: 20000,
        currentPrice: 110,
        purchaseDate: new Date(),
      });

      const dividend = recordDividend({
        holdingId: holding.id,
        accountId: account.id,
        ticker: 'VYM',
        exDividendDate: new Date('2024-03-01'),
        paymentDate: new Date('2024-03-15'),
        dividendPerShare: 0.75,
        shares: 200,
        reinvested: true,
        reinvestmentPrice: 110,
      });

      expect(dividend.reinvested).toBe(true);
      expect(dividend.reinvestmentShares).toBeCloseTo(1.36, 1);

      // Check that reinvestment transaction was created
      const transactions = listTransactions({ transactionType: 'reinvestment' });
      expect(transactions).toHaveLength(1);
    });

    it('should filter dividends by date range', () => {
      const account = createInvestmentAccount({
        entityId: 'entity-1',
        accountName: 'Test',
        accountType: 'brokerage',
        custodian: 'Test',
        accountNumber: 'XXX',
        taxStatus: 'taxable',
        openedDate: new Date(),
      });

      const holding = createHolding({
        accountId: account.id,
        ticker: 'PG',
        name: 'Procter & Gamble',
        assetClass: 'stocks',
        shares: 50,
        costBasis: 7500,
        currentPrice: 160,
        purchaseDate: new Date(),
      });

      recordDividend({
        holdingId: holding.id,
        accountId: account.id,
        ticker: 'PG',
        exDividendDate: new Date('2024-01-15'),
        paymentDate: new Date('2024-02-01'),
        dividendPerShare: 0.94,
        shares: 50,
      });

      recordDividend({
        holdingId: holding.id,
        accountId: account.id,
        ticker: 'PG',
        exDividendDate: new Date('2024-04-15'),
        paymentDate: new Date('2024-05-01'),
        dividendPerShare: 0.94,
        shares: 50,
      });

      const q1Dividends = listDividends({
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-03-31'),
      });
      expect(q1Dividends).toHaveLength(1);
    });
  });

  describe('Portfolio Analysis', () => {
    it('should calculate portfolio allocation', () => {
      const account = createInvestmentAccount({
        entityId: 'entity-1',
        accountName: 'Test',
        accountType: 'brokerage',
        custodian: 'Test',
        accountNumber: 'XXX',
        taxStatus: 'taxable',
        openedDate: new Date(),
      });

      createHolding({
        accountId: account.id,
        ticker: 'VTI',
        name: 'Vanguard Total Stock',
        assetClass: 'stocks',
        shares: 100,
        costBasis: 20000,
        currentPrice: 250,
        purchaseDate: new Date(),
      });

      createHolding({
        accountId: account.id,
        ticker: 'BND',
        name: 'Vanguard Total Bond',
        assetClass: 'bonds',
        shares: 100,
        costBasis: 8000,
        currentPrice: 100,
        purchaseDate: new Date(),
      });

      const allocation = calculatePortfolioAllocation(account.id);
      expect(allocation).toHaveLength(2);
      
      const stockAllocation = allocation.find(a => a.assetClass === 'stocks');
      expect(stockAllocation?.percentage).toBeCloseTo(71.43, 1); // 25000 / 35000
    });

    it('should calculate tax lots', () => {
      const account = createInvestmentAccount({
        entityId: 'entity-1',
        accountName: 'Test',
        accountType: 'brokerage',
        custodian: 'Test',
        accountNumber: 'XXX',
        taxStatus: 'taxable',
        openedDate: new Date(),
      });

      const holding = createHolding({
        accountId: account.id,
        ticker: 'AAPL',
        name: 'Apple',
        assetClass: 'stocks',
        shares: 50,
        costBasis: 7500,
        currentPrice: 175,
        purchaseDate: new Date('2023-01-01'),
      });

      recordTransaction({
        accountId: account.id,
        holdingId: holding.id,
        transactionType: 'buy',
        ticker: 'AAPL',
        shares: 50,
        pricePerShare: 150,
        transactionDate: new Date('2023-01-01'),
      });

      recordTransaction({
        accountId: account.id,
        holdingId: holding.id,
        transactionType: 'buy',
        ticker: 'AAPL',
        shares: 25,
        pricePerShare: 160,
        transactionDate: new Date('2024-06-01'),
      });

      const taxLots = calculateTaxLots(holding.id);
      expect(taxLots).toHaveLength(2);
      
      // First lot should be long-term (over 1 year)
      const longTermLot = taxLots.find(l => l.holdingPeriod === 'long_term');
      expect(longTermLot).toBeDefined();
    });

    it('should generate portfolio summary', () => {
      const account = createInvestmentAccount({
        entityId: 'entity-1',
        accountName: 'Test',
        accountType: 'brokerage',
        custodian: 'Test',
        accountNumber: 'XXX',
        taxStatus: 'taxable',
        openedDate: new Date(),
      });

      createHolding({
        accountId: account.id,
        ticker: 'VTI',
        name: 'Vanguard Total Stock',
        assetClass: 'stocks',
        shares: 100,
        costBasis: 20000,
        currentPrice: 250,
        purchaseDate: new Date(),
      });

      const summary = generatePortfolioSummary('entity-1');
      expect(summary.accountCount).toBe(1);
      expect(summary.holdingCount).toBe(1);
      expect(summary.totalValue).toBe(25000);
      expect(summary.totalCostBasis).toBe(20000);
      expect(summary.totalUnrealizedGainLoss).toBe(5000);
    });

    it('should generate rebalancing suggestions', () => {
      const account = createInvestmentAccount({
        entityId: 'entity-1',
        accountName: 'Test',
        accountType: 'brokerage',
        custodian: 'Test',
        accountNumber: 'XXX',
        taxStatus: 'taxable',
        openedDate: new Date(),
      });

      createHolding({
        accountId: account.id,
        ticker: 'VTI',
        name: 'Vanguard Total Stock',
        assetClass: 'stocks',
        shares: 100,
        costBasis: 20000,
        currentPrice: 250,
        purchaseDate: new Date(),
      });

      createHolding({
        accountId: account.id,
        ticker: 'BND',
        name: 'Vanguard Total Bond',
        assetClass: 'bonds',
        shares: 50,
        costBasis: 4000,
        currentPrice: 100,
        purchaseDate: new Date(),
      });

      const targetAllocation = {
        stocks: 60,
        bonds: 40,
        mutual_funds: 0,
        etfs: 0,
        reits: 0,
        commodities: 0,
        cryptocurrency: 0,
        cash_equivalents: 0,
        alternatives: 0,
      };

      const suggestions = generateRebalancingSuggestions(account.id, targetAllocation);
      
      // Stocks are overweight (83% vs 60% target)
      const stockSuggestion = suggestions.find(s => s.assetClass === 'stocks');
      expect(stockSuggestion?.action).toBe('sell');
      
      // Bonds are underweight (17% vs 40% target)
      const bondSuggestion = suggestions.find(s => s.assetClass === 'bonds');
      expect(bondSuggestion?.action).toBe('buy');
    });
  });

  describe('LuvLedger Integration', () => {
    it('should link transaction to LuvLedger entry', () => {
      const account = createInvestmentAccount({
        entityId: 'entity-1',
        accountName: 'Test',
        accountType: 'brokerage',
        custodian: 'Test',
        accountNumber: 'XXX',
        taxStatus: 'taxable',
        openedDate: new Date(),
      });

      const transaction = recordTransaction({
        accountId: account.id,
        transactionType: 'buy',
        ticker: 'AAPL',
        shares: 10,
        pricePerShare: 150,
        transactionDate: new Date(),
      });

      const linked = linkTransactionToLuvLedger(transaction.id, 'luv-entry-123');
      expect(linked?.luvLedgerEntryId).toBe('luv-entry-123');
    });
  });

  describe('Account Types', () => {
    it('should support nonprofit endowment accounts', () => {
      const account = createInvestmentAccount({
        entityId: '508-entity',
        accountName: 'Academy Endowment Fund',
        accountType: 'nonprofit_endowment',
        custodian: 'Vanguard Charitable',
        accountNumber: 'END-001',
        taxStatus: 'tax_exempt',
        openedDate: new Date(),
      });

      expect(account.accountType).toBe('nonprofit_endowment');
      expect(account.taxStatus).toBe('tax_exempt');
    });

    it('should support trust accounts', () => {
      const account = createInvestmentAccount({
        entityId: 'trust-entity',
        accountName: 'Family Trust Investment Account',
        accountType: 'trust',
        custodian: 'Fidelity',
        accountNumber: 'TRU-001',
        taxStatus: 'tax_deferred',
        openedDate: new Date(),
      });

      expect(account.accountType).toBe('trust');
    });
  });

  describe('Performance Calculation', () => {
    it('should calculate portfolio performance', () => {
      const account = createInvestmentAccount({
        entityId: 'entity-1',
        accountName: 'Test',
        accountType: 'brokerage',
        custodian: 'Test',
        accountNumber: 'XXX',
        taxStatus: 'taxable',
        openedDate: new Date(),
      });

      createHolding({
        accountId: account.id,
        ticker: 'VTI',
        name: 'Vanguard Total Stock',
        assetClass: 'stocks',
        shares: 100,
        costBasis: 20000,
        currentPrice: 250,
        purchaseDate: new Date(),
      });

      const performance = calculatePortfolioPerformance(
        account.id,
        new Date('2024-01-01'),
        new Date('2024-12-31')
      );

      expect(performance.endingValue).toBe(25000);
      expect(performance.unrealizedGains).toBe(5000);
    });
  });
});
