/**
 * Investment Portfolio Management Service
 * 
 * Manages investment holdings, transactions, and portfolio performance
 * with LuvLedger integration for complete audit trail.
 */

// Asset Classes
export const ASSET_CLASSES = [
  'stocks',
  'bonds',
  'mutual_funds',
  'etfs',
  'reits',
  'commodities',
  'cryptocurrency',
  'cash_equivalents',
  'alternatives',
] as const;

export type AssetClass = typeof ASSET_CLASSES[number];

// Transaction Types
export const TRANSACTION_TYPES = [
  'buy',
  'sell',
  'dividend',
  'interest',
  'split',
  'transfer_in',
  'transfer_out',
  'reinvestment',
  'fee',
  'distribution',
] as const;

export type TransactionType = typeof TRANSACTION_TYPES[number];

// Account Types
export const ACCOUNT_TYPES = [
  'brokerage',
  'ira_traditional',
  'ira_roth',
  '401k',
  '403b',
  'sep_ira',
  'simple_ira',
  'hsa',
  'trust',
  'corporate',
  'nonprofit_endowment',
] as const;

export type AccountType = typeof ACCOUNT_TYPES[number];

// Holding Status
export const HOLDING_STATUSES = [
  'active',
  'closed',
  'pending',
] as const;

export type HoldingStatus = typeof HOLDING_STATUSES[number];

// Interfaces
export interface InvestmentAccount {
  id: string;
  entityId: string;
  accountName: string;
  accountType: AccountType;
  custodian: string;
  accountNumber: string;
  taxStatus: 'taxable' | 'tax_deferred' | 'tax_exempt';
  openedDate: Date;
  status: 'active' | 'closed' | 'frozen';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvestmentHolding {
  id: string;
  accountId: string;
  ticker: string;
  cusip?: string;
  name: string;
  assetClass: AssetClass;
  shares: number;
  costBasis: number;
  currentPrice: number;
  currentValue: number;
  unrealizedGainLoss: number;
  unrealizedGainLossPercent: number;
  purchaseDate: Date;
  status: HoldingStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvestmentTransaction {
  id: string;
  accountId: string;
  holdingId?: string;
  transactionType: TransactionType;
  ticker: string;
  shares: number;
  pricePerShare: number;
  totalAmount: number;
  fees: number;
  netAmount: number;
  transactionDate: Date;
  settlementDate: Date;
  notes?: string;
  luvLedgerEntryId?: string;
  createdAt: Date;
}

export interface DividendRecord {
  id: string;
  holdingId: string;
  accountId: string;
  ticker: string;
  exDividendDate: Date;
  paymentDate: Date;
  dividendPerShare: number;
  shares: number;
  grossAmount: number;
  taxWithheld: number;
  netAmount: number;
  reinvested: boolean;
  reinvestmentShares?: number;
  reinvestmentPrice?: number;
  createdAt: Date;
}

export interface PortfolioAllocation {
  assetClass: AssetClass;
  value: number;
  percentage: number;
  targetPercentage?: number;
  deviation?: number;
}

export interface PortfolioPerformance {
  accountId: string;
  periodStart: Date;
  periodEnd: Date;
  startingValue: number;
  endingValue: number;
  contributions: number;
  withdrawals: number;
  dividends: number;
  realizedGains: number;
  unrealizedGains: number;
  totalReturn: number;
  totalReturnPercent: number;
  timeWeightedReturn: number;
}

export interface TaxLot {
  id: string;
  holdingId: string;
  purchaseDate: Date;
  shares: number;
  costBasis: number;
  costPerShare: number;
  holdingPeriod: 'short_term' | 'long_term';
  daysHeld: number;
}

// In-memory storage for demo
const accounts: Map<string, InvestmentAccount> = new Map();
const holdings: Map<string, InvestmentHolding> = new Map();
const transactions: Map<string, InvestmentTransaction> = new Map();
const dividends: Map<string, DividendRecord> = new Map();

// Helper functions
function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Account Management
export function createInvestmentAccount(data: {
  entityId: string;
  accountName: string;
  accountType: AccountType;
  custodian: string;
  accountNumber: string;
  taxStatus: 'taxable' | 'tax_deferred' | 'tax_exempt';
  openedDate: Date;
  notes?: string;
}): InvestmentAccount {
  const account: InvestmentAccount = {
    id: generateId('acct'),
    ...data,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  accounts.set(account.id, account);
  return account;
}

export function getInvestmentAccount(accountId: string): InvestmentAccount | undefined {
  return accounts.get(accountId);
}

export function listInvestmentAccounts(entityId?: string): InvestmentAccount[] {
  const allAccounts = Array.from(accounts.values());
  if (entityId) {
    return allAccounts.filter(a => a.entityId === entityId);
  }
  return allAccounts;
}

export function updateAccountStatus(
  accountId: string,
  status: 'active' | 'closed' | 'frozen'
): InvestmentAccount | undefined {
  const account = accounts.get(accountId);
  if (!account) return undefined;
  
  account.status = status;
  account.updatedAt = new Date();
  accounts.set(accountId, account);
  return account;
}

// Holding Management
export function createHolding(data: {
  accountId: string;
  ticker: string;
  cusip?: string;
  name: string;
  assetClass: AssetClass;
  shares: number;
  costBasis: number;
  currentPrice: number;
  purchaseDate: Date;
  notes?: string;
}): InvestmentHolding {
  const currentValue = data.shares * data.currentPrice;
  const unrealizedGainLoss = currentValue - data.costBasis;
  const unrealizedGainLossPercent = data.costBasis > 0 
    ? (unrealizedGainLoss / data.costBasis) * 100 
    : 0;
  
  const holding: InvestmentHolding = {
    id: generateId('hold'),
    ...data,
    currentValue,
    unrealizedGainLoss,
    unrealizedGainLossPercent,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  holdings.set(holding.id, holding);
  return holding;
}

export function getHolding(holdingId: string): InvestmentHolding | undefined {
  return holdings.get(holdingId);
}

export function listHoldings(accountId?: string): InvestmentHolding[] {
  const allHoldings = Array.from(holdings.values());
  if (accountId) {
    return allHoldings.filter(h => h.accountId === accountId);
  }
  return allHoldings;
}

export function updateHoldingPrice(
  holdingId: string,
  currentPrice: number
): InvestmentHolding | undefined {
  const holding = holdings.get(holdingId);
  if (!holding) return undefined;
  
  holding.currentPrice = currentPrice;
  holding.currentValue = holding.shares * currentPrice;
  holding.unrealizedGainLoss = holding.currentValue - holding.costBasis;
  holding.unrealizedGainLossPercent = holding.costBasis > 0
    ? (holding.unrealizedGainLoss / holding.costBasis) * 100
    : 0;
  holding.updatedAt = new Date();
  
  holdings.set(holdingId, holding);
  return holding;
}

export function updateHoldingShares(
  holdingId: string,
  sharesDelta: number,
  costBasisDelta: number
): InvestmentHolding | undefined {
  const holding = holdings.get(holdingId);
  if (!holding) return undefined;
  
  holding.shares += sharesDelta;
  holding.costBasis += costBasisDelta;
  holding.currentValue = holding.shares * holding.currentPrice;
  holding.unrealizedGainLoss = holding.currentValue - holding.costBasis;
  holding.unrealizedGainLossPercent = holding.costBasis > 0
    ? (holding.unrealizedGainLoss / holding.costBasis) * 100
    : 0;
  holding.updatedAt = new Date();
  
  if (holding.shares <= 0) {
    holding.status = 'closed';
  }
  
  holdings.set(holdingId, holding);
  return holding;
}

// Transaction Management
export function recordTransaction(data: {
  accountId: string;
  holdingId?: string;
  transactionType: TransactionType;
  ticker: string;
  shares: number;
  pricePerShare: number;
  fees?: number;
  transactionDate: Date;
  settlementDate?: Date;
  notes?: string;
}): InvestmentTransaction {
  const totalAmount = data.shares * data.pricePerShare;
  const fees = data.fees || 0;
  const netAmount = data.transactionType === 'buy' 
    ? totalAmount + fees 
    : totalAmount - fees;
  
  const transaction: InvestmentTransaction = {
    id: generateId('txn'),
    accountId: data.accountId,
    holdingId: data.holdingId,
    transactionType: data.transactionType,
    ticker: data.ticker,
    shares: data.shares,
    pricePerShare: data.pricePerShare,
    totalAmount,
    fees,
    netAmount,
    transactionDate: data.transactionDate,
    settlementDate: data.settlementDate || new Date(data.transactionDate.getTime() + 2 * 24 * 60 * 60 * 1000), // T+2
    notes: data.notes,
    createdAt: new Date(),
  };
  
  transactions.set(transaction.id, transaction);
  
  // Update holding if applicable
  if (data.holdingId) {
    if (data.transactionType === 'buy' || data.transactionType === 'reinvestment') {
      updateHoldingShares(data.holdingId, data.shares, totalAmount);
    } else if (data.transactionType === 'sell') {
      updateHoldingShares(data.holdingId, -data.shares, -totalAmount);
    }
  }
  
  return transaction;
}

export function getTransaction(transactionId: string): InvestmentTransaction | undefined {
  return transactions.get(transactionId);
}

export function listTransactions(filters?: {
  accountId?: string;
  holdingId?: string;
  transactionType?: TransactionType;
  startDate?: Date;
  endDate?: Date;
}): InvestmentTransaction[] {
  let result = Array.from(transactions.values());
  
  if (filters?.accountId) {
    result = result.filter(t => t.accountId === filters.accountId);
  }
  if (filters?.holdingId) {
    result = result.filter(t => t.holdingId === filters.holdingId);
  }
  if (filters?.transactionType) {
    result = result.filter(t => t.transactionType === filters.transactionType);
  }
  if (filters?.startDate) {
    result = result.filter(t => t.transactionDate >= filters.startDate!);
  }
  if (filters?.endDate) {
    result = result.filter(t => t.transactionDate <= filters.endDate!);
  }
  
  return result.sort((a, b) => b.transactionDate.getTime() - a.transactionDate.getTime());
}

// Dividend Management
export function recordDividend(data: {
  holdingId: string;
  accountId: string;
  ticker: string;
  exDividendDate: Date;
  paymentDate: Date;
  dividendPerShare: number;
  shares: number;
  taxWithheld?: number;
  reinvested?: boolean;
  reinvestmentPrice?: number;
}): DividendRecord {
  const grossAmount = data.dividendPerShare * data.shares;
  const taxWithheld = data.taxWithheld || 0;
  const netAmount = grossAmount - taxWithheld;
  const reinvested = data.reinvested || false;
  const reinvestmentShares = reinvested && data.reinvestmentPrice 
    ? netAmount / data.reinvestmentPrice 
    : undefined;
  
  const dividend: DividendRecord = {
    id: generateId('div'),
    holdingId: data.holdingId,
    accountId: data.accountId,
    ticker: data.ticker,
    exDividendDate: data.exDividendDate,
    paymentDate: data.paymentDate,
    dividendPerShare: data.dividendPerShare,
    shares: data.shares,
    grossAmount,
    taxWithheld,
    netAmount,
    reinvested,
    reinvestmentShares,
    reinvestmentPrice: data.reinvestmentPrice,
    createdAt: new Date(),
  };
  
  dividends.set(dividend.id, dividend);
  
  // If reinvested, record the reinvestment transaction
  if (reinvested && reinvestmentShares && data.reinvestmentPrice) {
    recordTransaction({
      accountId: data.accountId,
      holdingId: data.holdingId,
      transactionType: 'reinvestment',
      ticker: data.ticker,
      shares: reinvestmentShares,
      pricePerShare: data.reinvestmentPrice,
      transactionDate: data.paymentDate,
      notes: `Dividend reinvestment - ${data.dividendPerShare}/share`,
    });
  }
  
  return dividend;
}

export function listDividends(filters?: {
  accountId?: string;
  holdingId?: string;
  startDate?: Date;
  endDate?: Date;
}): DividendRecord[] {
  let result = Array.from(dividends.values());
  
  if (filters?.accountId) {
    result = result.filter(d => d.accountId === filters.accountId);
  }
  if (filters?.holdingId) {
    result = result.filter(d => d.holdingId === filters.holdingId);
  }
  if (filters?.startDate) {
    result = result.filter(d => d.paymentDate >= filters.startDate!);
  }
  if (filters?.endDate) {
    result = result.filter(d => d.paymentDate <= filters.endDate!);
  }
  
  return result.sort((a, b) => b.paymentDate.getTime() - a.paymentDate.getTime());
}

// Portfolio Analysis
export function calculatePortfolioAllocation(accountId: string): PortfolioAllocation[] {
  const accountHoldings = listHoldings(accountId).filter(h => h.status === 'active');
  const totalValue = accountHoldings.reduce((sum, h) => sum + h.currentValue, 0);
  
  const allocationMap = new Map<AssetClass, number>();
  
  for (const holding of accountHoldings) {
    const current = allocationMap.get(holding.assetClass) || 0;
    allocationMap.set(holding.assetClass, current + holding.currentValue);
  }
  
  const allocations: PortfolioAllocation[] = [];
  for (const [assetClass, value] of allocationMap) {
    allocations.push({
      assetClass,
      value,
      percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
    });
  }
  
  return allocations.sort((a, b) => b.value - a.value);
}

export function calculatePortfolioPerformance(
  accountId: string,
  periodStart: Date,
  periodEnd: Date
): PortfolioPerformance {
  const accountHoldings = listHoldings(accountId);
  const accountTransactions = listTransactions({
    accountId,
    startDate: periodStart,
    endDate: periodEnd,
  });
  const accountDividends = listDividends({
    accountId,
    startDate: periodStart,
    endDate: periodEnd,
  });
  
  // Calculate values
  const endingValue = accountHoldings
    .filter(h => h.status === 'active')
    .reduce((sum, h) => sum + h.currentValue, 0);
  
  const contributions = accountTransactions
    .filter(t => t.transactionType === 'buy' || t.transactionType === 'transfer_in')
    .reduce((sum, t) => sum + t.netAmount, 0);
  
  const withdrawals = accountTransactions
    .filter(t => t.transactionType === 'sell' || t.transactionType === 'transfer_out')
    .reduce((sum, t) => sum + t.netAmount, 0);
  
  const dividendIncome = accountDividends.reduce((sum, d) => sum + d.netAmount, 0);
  
  const realizedGains = accountTransactions
    .filter(t => t.transactionType === 'sell')
    .reduce((sum, t) => {
      // Simplified - would need cost basis tracking for accurate calculation
      return sum + (t.totalAmount * 0.1); // Placeholder
    }, 0);
  
  const unrealizedGains = accountHoldings
    .filter(h => h.status === 'active')
    .reduce((sum, h) => sum + h.unrealizedGainLoss, 0);
  
  // Estimate starting value
  const startingValue = endingValue - contributions + withdrawals - dividendIncome - unrealizedGains;
  
  const totalReturn = endingValue - startingValue - contributions + withdrawals;
  const totalReturnPercent = startingValue > 0 ? (totalReturn / startingValue) * 100 : 0;
  
  // Simplified time-weighted return
  const timeWeightedReturn = totalReturnPercent;
  
  return {
    accountId,
    periodStart,
    periodEnd,
    startingValue: Math.max(0, startingValue),
    endingValue,
    contributions,
    withdrawals,
    dividends: dividendIncome,
    realizedGains,
    unrealizedGains,
    totalReturn,
    totalReturnPercent,
    timeWeightedReturn,
  };
}

export function calculateTaxLots(holdingId: string): TaxLot[] {
  const holding = holdings.get(holdingId);
  if (!holding) return [];
  
  const holdingTransactions = listTransactions({ holdingId })
    .filter(t => t.transactionType === 'buy' || t.transactionType === 'reinvestment')
    .sort((a, b) => a.transactionDate.getTime() - b.transactionDate.getTime());
  
  const now = new Date();
  const oneYear = 365 * 24 * 60 * 60 * 1000;
  
  return holdingTransactions.map(t => {
    const daysHeld = Math.floor((now.getTime() - t.transactionDate.getTime()) / (24 * 60 * 60 * 1000));
    const holdingPeriod = (now.getTime() - t.transactionDate.getTime()) >= oneYear 
      ? 'long_term' 
      : 'short_term';
    
    return {
      id: generateId('lot'),
      holdingId,
      purchaseDate: t.transactionDate,
      shares: t.shares,
      costBasis: t.totalAmount,
      costPerShare: t.pricePerShare,
      holdingPeriod,
      daysHeld,
    };
  });
}

// Portfolio Summary
export function generatePortfolioSummary(entityId: string): {
  totalValue: number;
  totalCostBasis: number;
  totalUnrealizedGainLoss: number;
  totalUnrealizedGainLossPercent: number;
  accountCount: number;
  holdingCount: number;
  topHoldings: InvestmentHolding[];
  allocation: PortfolioAllocation[];
  recentTransactions: InvestmentTransaction[];
  ytdDividends: number;
} {
  const entityAccounts = listInvestmentAccounts(entityId);
  const allHoldings = entityAccounts.flatMap(a => listHoldings(a.id).filter(h => h.status === 'active'));
  
  const totalValue = allHoldings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalCostBasis = allHoldings.reduce((sum, h) => sum + h.costBasis, 0);
  const totalUnrealizedGainLoss = totalValue - totalCostBasis;
  const totalUnrealizedGainLossPercent = totalCostBasis > 0 
    ? (totalUnrealizedGainLoss / totalCostBasis) * 100 
    : 0;
  
  // Aggregate allocation across all accounts
  const allocationMap = new Map<AssetClass, number>();
  for (const holding of allHoldings) {
    const current = allocationMap.get(holding.assetClass) || 0;
    allocationMap.set(holding.assetClass, current + holding.currentValue);
  }
  
  const allocation: PortfolioAllocation[] = [];
  for (const [assetClass, value] of allocationMap) {
    allocation.push({
      assetClass,
      value,
      percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
    });
  }
  
  // YTD dividends
  const yearStart = new Date(new Date().getFullYear(), 0, 1);
  const ytdDividends = entityAccounts.flatMap(a => 
    listDividends({ accountId: a.id, startDate: yearStart })
  ).reduce((sum, d) => sum + d.netAmount, 0);
  
  // Recent transactions
  const recentTransactions = entityAccounts.flatMap(a => 
    listTransactions({ accountId: a.id })
  ).sort((a, b) => b.transactionDate.getTime() - a.transactionDate.getTime()).slice(0, 10);
  
  // Top holdings by value
  const topHoldings = [...allHoldings]
    .sort((a, b) => b.currentValue - a.currentValue)
    .slice(0, 10);
  
  return {
    totalValue,
    totalCostBasis,
    totalUnrealizedGainLoss,
    totalUnrealizedGainLossPercent,
    accountCount: entityAccounts.length,
    holdingCount: allHoldings.length,
    topHoldings,
    allocation: allocation.sort((a, b) => b.value - a.value),
    recentTransactions,
    ytdDividends,
  };
}

// Rebalancing Suggestions
export function generateRebalancingSuggestions(
  accountId: string,
  targetAllocation: Record<AssetClass, number>
): Array<{
  assetClass: AssetClass;
  currentPercent: number;
  targetPercent: number;
  deviation: number;
  action: 'buy' | 'sell' | 'hold';
  suggestedAmount: number;
}> {
  const currentAllocation = calculatePortfolioAllocation(accountId);
  const totalValue = currentAllocation.reduce((sum, a) => sum + a.value, 0);
  
  const suggestions: Array<{
    assetClass: AssetClass;
    currentPercent: number;
    targetPercent: number;
    deviation: number;
    action: 'buy' | 'sell' | 'hold';
    suggestedAmount: number;
  }> = [];
  
  for (const assetClass of ASSET_CLASSES) {
    const current = currentAllocation.find(a => a.assetClass === assetClass);
    const currentPercent = current?.percentage || 0;
    const targetPercent = targetAllocation[assetClass] || 0;
    const deviation = currentPercent - targetPercent;
    
    let action: 'buy' | 'sell' | 'hold' = 'hold';
    let suggestedAmount = 0;
    
    if (Math.abs(deviation) > 2) { // 2% threshold
      if (deviation > 0) {
        action = 'sell';
        suggestedAmount = (deviation / 100) * totalValue;
      } else {
        action = 'buy';
        suggestedAmount = Math.abs(deviation / 100) * totalValue;
      }
    }
    
    if (targetPercent > 0 || currentPercent > 0) {
      suggestions.push({
        assetClass,
        currentPercent,
        targetPercent,
        deviation,
        action,
        suggestedAmount,
      });
    }
  }
  
  return suggestions.sort((a, b) => Math.abs(b.deviation) - Math.abs(a.deviation));
}

// Export functions for LuvLedger integration
export function linkTransactionToLuvLedger(
  transactionId: string,
  luvLedgerEntryId: string
): InvestmentTransaction | undefined {
  const transaction = transactions.get(transactionId);
  if (!transaction) return undefined;
  
  transaction.luvLedgerEntryId = luvLedgerEntryId;
  transactions.set(transactionId, transaction);
  return transaction;
}

// Clear data (for testing)
export function clearAllInvestmentData(): void {
  accounts.clear();
  holdings.clear();
  transactions.clear();
  dividends.clear();
}
