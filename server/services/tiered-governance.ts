/**
 * Tiered Governance Service
 * 
 * Implements risk-based governance tiers for investment decisions.
 * Different asset classes require different approval levels based on risk.
 */

// Risk tiers from lowest to highest risk
export const RISK_TIERS = [
  'cash',
  'stablecoin',
  'index',
  'stock',
  'volatile_crypto',
  'speculative',
  'property'
] as const;

export type RiskTier = typeof RISK_TIERS[number];

// Governance levels
export const GOVERNANCE_LEVELS = [
  'auto_approve',      // No approval needed (e.g., cash movements)
  'manager_approve',   // Single manager can approve
  'committee_review',  // Committee must review
  'board_approval',    // Full board vote required
  'special_meeting'    // Requires special meeting with supermajority
] as const;

export type GovernanceLevel = typeof GOVERNANCE_LEVELS[number];

// Asset class to risk tier mapping
export const ASSET_CLASS_RISK_TIERS: Record<string, RiskTier> = {
  // Cash tier - lowest risk
  'cash': 'cash',
  'money_market': 'cash',
  'treasury_bills': 'cash',
  'savings': 'cash',
  
  // Stablecoin tier
  'stablecoin': 'stablecoin',
  'usdc': 'stablecoin',
  'usdt': 'stablecoin',
  'dai': 'stablecoin',
  
  // Index tier - diversified, lower risk
  'index_fund': 'index',
  'etf': 'index',
  'mutual_fund': 'index',
  'target_date_fund': 'index',
  'bond_fund': 'index',
  
  // Stock tier - individual equities
  'stock': 'stock',
  'equity': 'stock',
  'preferred_stock': 'stock',
  'reit': 'stock',
  'adr': 'stock',
  
  // Volatile crypto tier
  'bitcoin': 'volatile_crypto',
  'ethereum': 'volatile_crypto',
  'cryptocurrency': 'volatile_crypto',
  'altcoin': 'volatile_crypto',
  
  // Speculative tier - highest risk
  'options': 'speculative',
  'futures': 'speculative',
  'derivatives': 'speculative',
  'penny_stock': 'speculative',
  'meme_stock': 'speculative',
  'nft': 'speculative',
  'defi': 'speculative',
  'startup_equity': 'speculative',
  'private_placement': 'speculative',
  
  // Property tier - illiquid but tangible
  'real_estate': 'property',
  'land': 'property',
  'commercial_property': 'property',
  'residential_property': 'property',
  'reit_direct': 'property'
};

// Risk tier descriptions
export const RISK_TIER_INFO: Record<RiskTier, {
  name: string;
  description: string;
  riskLevel: number; // 1-10 scale
  liquidityDays: number; // Typical days to liquidate
  volatilityRange: string; // Expected annual volatility
}> = {
  cash: {
    name: 'Cash & Equivalents',
    description: 'Highly liquid, stable value assets with minimal risk',
    riskLevel: 1,
    liquidityDays: 0,
    volatilityRange: '0-1%'
  },
  stablecoin: {
    name: 'Stablecoins',
    description: 'Digital assets pegged to fiat currencies',
    riskLevel: 2,
    liquidityDays: 1,
    volatilityRange: '0-3%'
  },
  index: {
    name: 'Index & Diversified Funds',
    description: 'Broad market exposure through diversified holdings',
    riskLevel: 4,
    liquidityDays: 3,
    volatilityRange: '10-20%'
  },
  stock: {
    name: 'Individual Stocks',
    description: 'Single company equity positions',
    riskLevel: 6,
    liquidityDays: 3,
    volatilityRange: '20-40%'
  },
  volatile_crypto: {
    name: 'Volatile Cryptocurrency',
    description: 'Major cryptocurrencies with high volatility',
    riskLevel: 8,
    liquidityDays: 1,
    volatilityRange: '50-100%'
  },
  speculative: {
    name: 'Speculative Assets',
    description: 'High-risk investments including derivatives and early-stage ventures',
    riskLevel: 10,
    liquidityDays: 30,
    volatilityRange: '100%+'
  },
  property: {
    name: 'Real Property',
    description: 'Physical real estate and land holdings',
    riskLevel: 5,
    liquidityDays: 90,
    volatilityRange: '5-15%'
  }
};

// Investment policy configuration
export interface InvestmentPolicy {
  id: string;
  name: string;
  description: string;
  effectiveDate: Date;
  
  // Portfolio limits by risk tier (percentage of total portfolio)
  tierLimits: Record<RiskTier, {
    maxPercentage: number;
    minPercentage: number;
    maxSinglePosition: number; // Max single holding as % of tier
  }>;
  
  // Transaction thresholds by risk tier
  transactionThresholds: Record<RiskTier, {
    autoApproveLimit: number;      // Up to this amount auto-approved
    managerApproveLimit: number;   // Up to this amount manager can approve
    committeeReviewLimit: number;  // Up to this amount committee reviews
    boardApprovalLimit: number;    // Up to this amount board approves
    // Above boardApprovalLimit requires special meeting
  }>;
  
  // Governance rules
  governanceRules: {
    quorumPercentage: number;
    simpleApprovalThreshold: number;
    supermajorityThreshold: number;
    emergencyActionEnabled: boolean;
    cooldownPeriodDays: number; // Days between major transactions
  };
  
  // Prohibited investments
  prohibitedAssetClasses: string[];
  prohibitedTickers: string[];
  
  // ESG requirements
  esgRequirements: {
    enabled: boolean;
    minimumScore: number;
    excludedSectors: string[];
  };
}

// Default investment policy
export function createDefaultPolicy(): InvestmentPolicy {
  return {
    id: crypto.randomUUID(),
    name: 'Standard Investment Policy',
    description: 'Default tiered governance policy for the organization',
    effectiveDate: new Date(),
    
    tierLimits: {
      cash: { maxPercentage: 100, minPercentage: 5, maxSinglePosition: 100 },
      stablecoin: { maxPercentage: 20, minPercentage: 0, maxSinglePosition: 50 },
      index: { maxPercentage: 60, minPercentage: 20, maxSinglePosition: 25 },
      stock: { maxPercentage: 40, minPercentage: 0, maxSinglePosition: 10 },
      volatile_crypto: { maxPercentage: 10, minPercentage: 0, maxSinglePosition: 5 },
      speculative: { maxPercentage: 5, minPercentage: 0, maxSinglePosition: 2 },
      property: { maxPercentage: 30, minPercentage: 0, maxSinglePosition: 15 }
    },
    
    transactionThresholds: {
      cash: { autoApproveLimit: 50000, managerApproveLimit: 250000, committeeReviewLimit: 1000000, boardApprovalLimit: 5000000 },
      stablecoin: { autoApproveLimit: 25000, managerApproveLimit: 100000, committeeReviewLimit: 500000, boardApprovalLimit: 2000000 },
      index: { autoApproveLimit: 10000, managerApproveLimit: 50000, committeeReviewLimit: 250000, boardApprovalLimit: 1000000 },
      stock: { autoApproveLimit: 5000, managerApproveLimit: 25000, committeeReviewLimit: 100000, boardApprovalLimit: 500000 },
      volatile_crypto: { autoApproveLimit: 1000, managerApproveLimit: 10000, committeeReviewLimit: 50000, boardApprovalLimit: 200000 },
      speculative: { autoApproveLimit: 0, managerApproveLimit: 5000, committeeReviewLimit: 25000, boardApprovalLimit: 100000 },
      property: { autoApproveLimit: 0, managerApproveLimit: 0, committeeReviewLimit: 100000, boardApprovalLimit: 500000 }
    },
    
    governanceRules: {
      quorumPercentage: 60,
      simpleApprovalThreshold: 51,
      supermajorityThreshold: 67,
      emergencyActionEnabled: true,
      cooldownPeriodDays: 7
    },
    
    prohibitedAssetClasses: ['penny_stock', 'meme_stock', 'nft'],
    prohibitedTickers: [],
    
    esgRequirements: {
      enabled: true,
      minimumScore: 50,
      excludedSectors: ['tobacco', 'weapons', 'gambling', 'fossil_fuels']
    }
  };
}

// Transaction request
export interface TransactionRequest {
  id: string;
  type: 'buy' | 'sell' | 'transfer' | 'rebalance';
  assetClass: string;
  ticker?: string;
  amount: number;
  quantity?: number;
  riskTier: RiskTier;
  requiredGovernanceLevel: GovernanceLevel;
  status: 'pending' | 'auto_approved' | 'awaiting_approval' | 'approved' | 'rejected' | 'executed' | 'cancelled';
  requestedBy: string;
  requestedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  executedAt?: Date;
  notes?: string;
  rejectionReason?: string;
}

// In-memory storage for demo
const policies: Map<string, InvestmentPolicy> = new Map();
const transactionRequests: Map<string, TransactionRequest> = new Map();
const portfolioAllocations: Map<string, Map<RiskTier, number>> = new Map(); // portfolioId -> tier -> percentage

// Initialize default policy
const defaultPolicy = createDefaultPolicy();
policies.set(defaultPolicy.id, defaultPolicy);

/**
 * Get risk tier for an asset class
 */
export function getRiskTier(assetClass: string): RiskTier {
  const normalizedClass = assetClass.toLowerCase().replace(/[^a-z_]/g, '_');
  return ASSET_CLASS_RISK_TIERS[normalizedClass] || 'speculative';
}

/**
 * Determine required governance level for a transaction
 */
export function determineGovernanceLevel(
  riskTier: RiskTier,
  amount: number,
  policy: InvestmentPolicy
): GovernanceLevel {
  const thresholds = policy.transactionThresholds[riskTier];
  
  if (amount <= thresholds.autoApproveLimit) {
    return 'auto_approve';
  }
  if (amount <= thresholds.managerApproveLimit) {
    return 'manager_approve';
  }
  if (amount <= thresholds.committeeReviewLimit) {
    return 'committee_review';
  }
  if (amount <= thresholds.boardApprovalLimit) {
    return 'board_approval';
  }
  return 'special_meeting';
}

/**
 * Check if a transaction would violate portfolio limits
 */
export function checkPortfolioLimits(
  portfolioId: string,
  riskTier: RiskTier,
  transactionAmount: number,
  totalPortfolioValue: number,
  policy: InvestmentPolicy
): { allowed: boolean; reason?: string; currentPercentage: number; newPercentage: number } {
  const allocations = portfolioAllocations.get(portfolioId) || new Map();
  const currentTierValue = (allocations.get(riskTier) || 0) * totalPortfolioValue / 100;
  const newTierValue = currentTierValue + transactionAmount;
  const newPercentage = (newTierValue / totalPortfolioValue) * 100;
  const currentPercentage = allocations.get(riskTier) || 0;
  
  const limits = policy.tierLimits[riskTier];
  
  if (newPercentage > limits.maxPercentage) {
    return {
      allowed: false,
      reason: `Transaction would exceed ${riskTier} tier limit of ${limits.maxPercentage}%`,
      currentPercentage,
      newPercentage
    };
  }
  
  return { allowed: true, currentPercentage, newPercentage };
}

/**
 * Check if an asset is prohibited
 */
export function isAssetProhibited(
  assetClass: string,
  ticker: string | undefined,
  policy: InvestmentPolicy
): { prohibited: boolean; reason?: string } {
  const normalizedClass = assetClass.toLowerCase().replace(/[^a-z_]/g, '_');
  
  if (policy.prohibitedAssetClasses.includes(normalizedClass)) {
    return { prohibited: true, reason: `Asset class "${assetClass}" is prohibited by policy` };
  }
  
  if (ticker && policy.prohibitedTickers.includes(ticker.toUpperCase())) {
    return { prohibited: true, reason: `Ticker "${ticker}" is prohibited by policy` };
  }
  
  return { prohibited: false };
}

/**
 * Create a new transaction request
 */
export function createTransactionRequest(params: {
  type: TransactionRequest['type'];
  assetClass: string;
  ticker?: string;
  amount: number;
  quantity?: number;
  requestedBy: string;
  notes?: string;
  policyId?: string;
  portfolioId?: string;
  totalPortfolioValue?: number;
}): { success: boolean; request?: TransactionRequest; error?: string } {
  const policy = params.policyId ? policies.get(params.policyId) : defaultPolicy;
  if (!policy) {
    return { success: false, error: 'Policy not found' };
  }
  
  // Check if asset is prohibited
  const prohibitedCheck = isAssetProhibited(params.assetClass, params.ticker, policy);
  if (prohibitedCheck.prohibited) {
    return { success: false, error: prohibitedCheck.reason };
  }
  
  // Determine risk tier
  const riskTier = getRiskTier(params.assetClass);
  
  // Check portfolio limits if portfolio info provided
  if (params.portfolioId && params.totalPortfolioValue && params.type === 'buy') {
    const limitCheck = checkPortfolioLimits(
      params.portfolioId,
      riskTier,
      params.amount,
      params.totalPortfolioValue,
      policy
    );
    if (!limitCheck.allowed) {
      return { success: false, error: limitCheck.reason };
    }
  }
  
  // Determine required governance level
  const governanceLevel = determineGovernanceLevel(riskTier, params.amount, policy);
  
  const request: TransactionRequest = {
    id: crypto.randomUUID(),
    type: params.type,
    assetClass: params.assetClass,
    ticker: params.ticker,
    amount: params.amount,
    quantity: params.quantity,
    riskTier,
    requiredGovernanceLevel: governanceLevel,
    status: governanceLevel === 'auto_approve' ? 'auto_approved' : 'awaiting_approval',
    requestedBy: params.requestedBy,
    requestedAt: new Date(),
    notes: params.notes
  };
  
  // Auto-approve if allowed
  if (governanceLevel === 'auto_approve') {
    request.approvedBy = 'SYSTEM';
    request.approvedAt = new Date();
  }
  
  transactionRequests.set(request.id, request);
  return { success: true, request };
}

/**
 * Approve a transaction request
 */
export function approveTransactionRequest(
  requestId: string,
  approvedBy: string,
  approverLevel: GovernanceLevel
): { success: boolean; request?: TransactionRequest; error?: string } {
  const request = transactionRequests.get(requestId);
  if (!request) {
    return { success: false, error: 'Transaction request not found' };
  }
  
  if (request.status !== 'awaiting_approval') {
    return { success: false, error: `Cannot approve request with status: ${request.status}` };
  }
  
  // Check if approver has sufficient authority
  const levelHierarchy: Record<GovernanceLevel, number> = {
    'auto_approve': 0,
    'manager_approve': 1,
    'committee_review': 2,
    'board_approval': 3,
    'special_meeting': 4
  };
  
  if (levelHierarchy[approverLevel] < levelHierarchy[request.requiredGovernanceLevel]) {
    return { success: false, error: `Insufficient authority. Required: ${request.requiredGovernanceLevel}, Provided: ${approverLevel}` };
  }
  
  request.status = 'approved';
  request.approvedBy = approvedBy;
  request.approvedAt = new Date();
  
  transactionRequests.set(requestId, request);
  return { success: true, request };
}

/**
 * Reject a transaction request
 */
export function rejectTransactionRequest(
  requestId: string,
  rejectedBy: string,
  reason: string
): { success: boolean; request?: TransactionRequest; error?: string } {
  const request = transactionRequests.get(requestId);
  if (!request) {
    return { success: false, error: 'Transaction request not found' };
  }
  
  if (request.status !== 'awaiting_approval') {
    return { success: false, error: `Cannot reject request with status: ${request.status}` };
  }
  
  request.status = 'rejected';
  request.rejectionReason = reason;
  
  transactionRequests.set(requestId, request);
  return { success: true, request };
}

/**
 * Execute an approved transaction
 */
export function executeTransaction(
  requestId: string,
  executedBy: string
): { success: boolean; request?: TransactionRequest; error?: string } {
  const request = transactionRequests.get(requestId);
  if (!request) {
    return { success: false, error: 'Transaction request not found' };
  }
  
  if (request.status !== 'approved' && request.status !== 'auto_approved') {
    return { success: false, error: `Cannot execute request with status: ${request.status}` };
  }
  
  request.status = 'executed';
  request.executedAt = new Date();
  
  transactionRequests.set(requestId, request);
  return { success: true, request };
}

/**
 * Get all transaction requests with optional filters
 */
export function getTransactionRequests(filters?: {
  status?: TransactionRequest['status'];
  riskTier?: RiskTier;
  governanceLevel?: GovernanceLevel;
  requestedBy?: string;
  fromDate?: Date;
  toDate?: Date;
}): TransactionRequest[] {
  let requests = Array.from(transactionRequests.values());
  
  if (filters) {
    if (filters.status) {
      requests = requests.filter(r => r.status === filters.status);
    }
    if (filters.riskTier) {
      requests = requests.filter(r => r.riskTier === filters.riskTier);
    }
    if (filters.governanceLevel) {
      requests = requests.filter(r => r.requiredGovernanceLevel === filters.governanceLevel);
    }
    if (filters.requestedBy) {
      requests = requests.filter(r => r.requestedBy === filters.requestedBy);
    }
    if (filters.fromDate) {
      requests = requests.filter(r => r.requestedAt >= filters.fromDate!);
    }
    if (filters.toDate) {
      requests = requests.filter(r => r.requestedAt <= filters.toDate!);
    }
  }
  
  return requests.sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());
}

/**
 * Get pending requests requiring approval
 */
export function getPendingApprovals(governanceLevel?: GovernanceLevel): TransactionRequest[] {
  let requests = Array.from(transactionRequests.values())
    .filter(r => r.status === 'awaiting_approval');
  
  if (governanceLevel) {
    const levelHierarchy: Record<GovernanceLevel, number> = {
      'auto_approve': 0,
      'manager_approve': 1,
      'committee_review': 2,
      'board_approval': 3,
      'special_meeting': 4
    };
    
    requests = requests.filter(r => 
      levelHierarchy[r.requiredGovernanceLevel] <= levelHierarchy[governanceLevel]
    );
  }
  
  return requests.sort((a, b) => a.requestedAt.getTime() - b.requestedAt.getTime());
}

/**
 * Update portfolio allocation
 */
export function updatePortfolioAllocation(
  portfolioId: string,
  allocations: Record<RiskTier, number>
): void {
  const allocationMap = new Map<RiskTier, number>();
  for (const [tier, percentage] of Object.entries(allocations)) {
    allocationMap.set(tier as RiskTier, percentage);
  }
  portfolioAllocations.set(portfolioId, allocationMap);
}

/**
 * Get portfolio allocation
 */
export function getPortfolioAllocation(portfolioId: string): Record<RiskTier, number> {
  const allocations = portfolioAllocations.get(portfolioId);
  if (!allocations) {
    return RISK_TIERS.reduce((acc, tier) => ({ ...acc, [tier]: 0 }), {} as Record<RiskTier, number>);
  }
  
  const result: Record<RiskTier, number> = {} as Record<RiskTier, number>;
  for (const tier of RISK_TIERS) {
    result[tier] = allocations.get(tier) || 0;
  }
  return result;
}

/**
 * Calculate rebalancing recommendations
 */
export function calculateRebalancingRecommendations(
  portfolioId: string,
  totalPortfolioValue: number,
  policy: InvestmentPolicy
): Array<{
  tier: RiskTier;
  currentPercentage: number;
  targetPercentage: number;
  difference: number;
  action: 'buy' | 'sell' | 'hold';
  amount: number;
}> {
  const currentAllocation = getPortfolioAllocation(portfolioId);
  const recommendations: Array<{
    tier: RiskTier;
    currentPercentage: number;
    targetPercentage: number;
    difference: number;
    action: 'buy' | 'sell' | 'hold';
    amount: number;
  }> = [];
  
  for (const tier of RISK_TIERS) {
    const current = currentAllocation[tier];
    const limits = policy.tierLimits[tier];
    
    // Target is midpoint of min/max, or 0 if max is 0
    const target = limits.maxPercentage > 0 
      ? (limits.minPercentage + limits.maxPercentage) / 2 
      : 0;
    
    const difference = current - target;
    const toleranceBand = 5; // 5% tolerance before recommending action
    
    let action: 'buy' | 'sell' | 'hold' = 'hold';
    let amount = 0;
    
    if (difference > toleranceBand) {
      action = 'sell';
      amount = (difference / 100) * totalPortfolioValue;
    } else if (difference < -toleranceBand) {
      action = 'buy';
      amount = Math.abs(difference / 100) * totalPortfolioValue;
    }
    
    recommendations.push({
      tier,
      currentPercentage: current,
      targetPercentage: target,
      difference,
      action,
      amount
    });
  }
  
  return recommendations;
}

/**
 * Get policy by ID
 */
export function getPolicy(policyId: string): InvestmentPolicy | undefined {
  return policies.get(policyId);
}

/**
 * Get default policy
 */
export function getDefaultPolicy(): InvestmentPolicy {
  return defaultPolicy;
}

/**
 * Update policy
 */
export function updatePolicy(
  policyId: string,
  updates: Partial<Omit<InvestmentPolicy, 'id'>>
): { success: boolean; policy?: InvestmentPolicy; error?: string } {
  const policy = policies.get(policyId);
  if (!policy) {
    return { success: false, error: 'Policy not found' };
  }
  
  const updatedPolicy = { ...policy, ...updates };
  policies.set(policyId, updatedPolicy);
  return { success: true, policy: updatedPolicy };
}

/**
 * Generate governance summary report
 */
export function generateGovernanceSummary(): {
  totalRequests: number;
  byStatus: Record<TransactionRequest['status'], number>;
  byRiskTier: Record<RiskTier, number>;
  byGovernanceLevel: Record<GovernanceLevel, number>;
  pendingApprovals: number;
  totalApprovedValue: number;
  totalRejectedValue: number;
  averageApprovalTime: number; // in hours
} {
  const requests = Array.from(transactionRequests.values());
  
  const byStatus: Record<TransactionRequest['status'], number> = {
    pending: 0,
    auto_approved: 0,
    awaiting_approval: 0,
    approved: 0,
    rejected: 0,
    executed: 0,
    cancelled: 0
  };
  
  const byRiskTier: Record<RiskTier, number> = {
    cash: 0,
    stablecoin: 0,
    index: 0,
    stock: 0,
    volatile_crypto: 0,
    speculative: 0,
    property: 0
  };
  
  const byGovernanceLevel: Record<GovernanceLevel, number> = {
    auto_approve: 0,
    manager_approve: 0,
    committee_review: 0,
    board_approval: 0,
    special_meeting: 0
  };
  
  let totalApprovedValue = 0;
  let totalRejectedValue = 0;
  let totalApprovalTime = 0;
  let approvalCount = 0;
  
  for (const request of requests) {
    byStatus[request.status]++;
    byRiskTier[request.riskTier]++;
    byGovernanceLevel[request.requiredGovernanceLevel]++;
    
    if (request.status === 'approved' || request.status === 'executed' || request.status === 'auto_approved') {
      totalApprovedValue += request.amount;
      
      if (request.approvedAt && request.requestedAt) {
        const approvalTime = (request.approvedAt.getTime() - request.requestedAt.getTime()) / (1000 * 60 * 60);
        totalApprovalTime += approvalTime;
        approvalCount++;
      }
    }
    
    if (request.status === 'rejected') {
      totalRejectedValue += request.amount;
    }
  }
  
  return {
    totalRequests: requests.length,
    byStatus,
    byRiskTier,
    byGovernanceLevel,
    pendingApprovals: byStatus.awaiting_approval,
    totalApprovedValue,
    totalRejectedValue,
    averageApprovalTime: approvalCount > 0 ? totalApprovalTime / approvalCount : 0
  };
}

/**
 * Clear all data (for testing)
 */
export function clearAllData(): void {
  transactionRequests.clear();
  portfolioAllocations.clear();
  // Keep default policy
}
