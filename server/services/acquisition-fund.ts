/**
 * Land & Buildings Acquisition Fund Service
 * 
 * Manages designated funds for land and building acquisitions, including:
 * - Fund categories and designations
 * - Donation allocation to funds
 * - Grant allocation to funds
 * - Fund balance tracking
 * - Transfer rules between funds
 * - Fund-specific reporting
 */

// Fund categories
export const FUND_CATEGORIES = [
  {
    id: "land_acquisition",
    name: "Land Acquisition Fund",
    description: "Designated for purchasing land parcels for community development",
    targetAmount: 500000,
    priority: 1,
    allowedSources: ["donation", "grant", "transfer", "investment_return"],
    restrictions: ["land_purchase", "land_development", "land_survey", "land_assessment"],
  },
  {
    id: "building_acquisition",
    name: "Building Acquisition Fund",
    description: "Designated for purchasing existing buildings and structures",
    targetAmount: 750000,
    priority: 2,
    allowedSources: ["donation", "grant", "transfer", "investment_return"],
    restrictions: ["building_purchase", "building_inspection", "building_assessment"],
  },
  {
    id: "construction",
    name: "Construction Fund",
    description: "Designated for new construction projects",
    targetAmount: 1000000,
    priority: 3,
    allowedSources: ["donation", "grant", "transfer", "loan"],
    restrictions: ["new_construction", "permits", "architectural_services", "engineering"],
  },
  {
    id: "renovation",
    name: "Renovation & Improvement Fund",
    description: "Designated for renovating and improving existing properties",
    targetAmount: 250000,
    priority: 4,
    allowedSources: ["donation", "grant", "transfer"],
    restrictions: ["renovation", "repairs", "improvements", "maintenance"],
  },
  {
    id: "emergency_housing",
    name: "Emergency Housing Fund",
    description: "Designated for urgent housing needs and emergency shelter",
    targetAmount: 100000,
    priority: 5,
    allowedSources: ["donation", "grant", "transfer"],
    restrictions: ["emergency_housing", "temporary_shelter", "housing_assistance"],
  },
  {
    id: "general_operations",
    name: "General Operations Fund",
    description: "General fund for operational expenses",
    targetAmount: 200000,
    priority: 10,
    allowedSources: ["donation", "grant", "transfer", "revenue"],
    restrictions: [],
  },
] as const;

export type FundCategoryId = typeof FUND_CATEGORIES[number]["id"];

// Fund transaction types
export const TRANSACTION_TYPES = [
  "donation",
  "grant_allocation",
  "transfer_in",
  "transfer_out",
  "disbursement",
  "investment_return",
  "adjustment",
  "refund",
] as const;

export type TransactionType = typeof TRANSACTION_TYPES[number];

// Fund transaction
export interface FundTransaction {
  id: string;
  fundId: FundCategoryId;
  type: TransactionType;
  amount: number;
  description: string;
  referenceId?: string; // donation ID, grant ID, etc.
  referenceType?: "donation" | "grant" | "transfer" | "disbursement";
  sourceHouseId?: string;
  destinationHouseId?: string;
  approvedBy?: string;
  approvedAt?: Date;
  notes?: string;
  createdAt: Date;
  createdBy: string;
}

// Fund balance
export interface FundBalance {
  fundId: FundCategoryId;
  fundName: string;
  currentBalance: number;
  targetAmount: number;
  percentageOfTarget: number;
  totalInflows: number;
  totalOutflows: number;
  pendingDisbursements: number;
  availableBalance: number;
  lastUpdated: Date;
}

// Donation allocation
export interface DonationAllocation {
  donationId: string;
  donorName: string;
  donorEmail: string;
  totalAmount: number;
  allocations: Array<{
    fundId: FundCategoryId;
    amount: number;
    percentage: number;
  }>;
  designatedFund?: FundCategoryId;
  isDesignated: boolean;
  createdAt: Date;
}

// Grant allocation
export interface GrantAllocation {
  grantId: string;
  grantName: string;
  grantorName: string;
  totalAmount: number;
  allocations: Array<{
    fundId: FundCategoryId;
    amount: number;
    percentage: number;
    restrictedUse?: string;
  }>;
  restrictions: string[];
  createdAt: Date;
}

// Transfer request
export interface TransferRequest {
  id: string;
  fromFundId: FundCategoryId;
  toFundId: FundCategoryId;
  amount: number;
  reason: string;
  requestedBy: string;
  requestedAt: Date;
  status: "pending" | "approved" | "rejected" | "completed";
  approvedBy?: string;
  approvedAt?: Date;
  rejectedReason?: string;
  completedAt?: Date;
}

// Disbursement request
export interface DisbursementRequest {
  id: string;
  fundId: FundCategoryId;
  amount: number;
  purpose: string;
  vendor?: string;
  invoiceNumber?: string;
  propertyId?: string;
  requestedBy: string;
  requestedAt: Date;
  status: "pending" | "approved" | "rejected" | "disbursed";
  approvedBy?: string;
  approvedAt?: Date;
  disbursedAt?: Date;
  checkNumber?: string;
  rejectedReason?: string;
}

// Generate transaction ID
export function generateTransactionId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TXN-${timestamp}-${random}`;
}

// Generate transfer request ID
export function generateTransferRequestId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TRF-${timestamp}-${random}`;
}

// Generate disbursement request ID
export function generateDisbursementRequestId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `DSB-${timestamp}-${random}`;
}

// Get fund category by ID
export function getFundCategory(fundId: FundCategoryId) {
  return FUND_CATEGORIES.find(f => f.id === fundId);
}

// Create fund transaction
export function createFundTransaction(
  fundId: FundCategoryId,
  type: TransactionType,
  amount: number,
  description: string,
  createdBy: string,
  options?: {
    referenceId?: string;
    referenceType?: "donation" | "grant" | "transfer" | "disbursement";
    sourceHouseId?: string;
    destinationHouseId?: string;
    notes?: string;
  }
): FundTransaction {
  return {
    id: generateTransactionId(),
    fundId,
    type,
    amount,
    description,
    referenceId: options?.referenceId,
    referenceType: options?.referenceType,
    sourceHouseId: options?.sourceHouseId,
    destinationHouseId: options?.destinationHouseId,
    notes: options?.notes,
    createdAt: new Date(),
    createdBy,
  };
}

// Allocate donation to fund
export function allocateDonation(
  donationId: string,
  donorName: string,
  donorEmail: string,
  totalAmount: number,
  designatedFund?: FundCategoryId
): DonationAllocation {
  const allocations: DonationAllocation["allocations"] = [];

  if (designatedFund) {
    // Entire donation goes to designated fund
    allocations.push({
      fundId: designatedFund,
      amount: totalAmount,
      percentage: 100,
    });
  } else {
    // Default allocation based on fund priorities
    // 40% to Land Acquisition, 30% to Building Acquisition, 20% to Construction, 10% to General
    allocations.push(
      { fundId: "land_acquisition", amount: totalAmount * 0.4, percentage: 40 },
      { fundId: "building_acquisition", amount: totalAmount * 0.3, percentage: 30 },
      { fundId: "construction", amount: totalAmount * 0.2, percentage: 20 },
      { fundId: "general_operations", amount: totalAmount * 0.1, percentage: 10 }
    );
  }

  return {
    donationId,
    donorName,
    donorEmail,
    totalAmount,
    allocations,
    designatedFund,
    isDesignated: !!designatedFund,
    createdAt: new Date(),
  };
}

// Allocate grant to fund
export function allocateGrant(
  grantId: string,
  grantName: string,
  grantorName: string,
  totalAmount: number,
  allocations: Array<{ fundId: FundCategoryId; amount: number; restrictedUse?: string }>,
  restrictions: string[] = []
): GrantAllocation {
  const totalAllocated = allocations.reduce((sum, a) => sum + a.amount, 0);
  
  return {
    grantId,
    grantName,
    grantorName,
    totalAmount,
    allocations: allocations.map(a => ({
      ...a,
      percentage: (a.amount / totalAllocated) * 100,
    })),
    restrictions,
    createdAt: new Date(),
  };
}

// Create transfer request
export function createTransferRequest(
  fromFundId: FundCategoryId,
  toFundId: FundCategoryId,
  amount: number,
  reason: string,
  requestedBy: string
): TransferRequest {
  return {
    id: generateTransferRequestId(),
    fromFundId,
    toFundId,
    amount,
    reason,
    requestedBy,
    requestedAt: new Date(),
    status: "pending",
  };
}

// Approve transfer request
export function approveTransferRequest(
  request: TransferRequest,
  approvedBy: string
): TransferRequest {
  return {
    ...request,
    status: "approved",
    approvedBy,
    approvedAt: new Date(),
  };
}

// Complete transfer request
export function completeTransferRequest(request: TransferRequest): TransferRequest {
  if (request.status !== "approved") {
    throw new Error("Transfer must be approved before completion");
  }
  return {
    ...request,
    status: "completed",
    completedAt: new Date(),
  };
}

// Reject transfer request
export function rejectTransferRequest(
  request: TransferRequest,
  rejectedReason: string
): TransferRequest {
  return {
    ...request,
    status: "rejected",
    rejectedReason,
  };
}

// Create disbursement request
export function createDisbursementRequest(
  fundId: FundCategoryId,
  amount: number,
  purpose: string,
  requestedBy: string,
  options?: {
    vendor?: string;
    invoiceNumber?: string;
    propertyId?: string;
  }
): DisbursementRequest {
  return {
    id: generateDisbursementRequestId(),
    fundId,
    amount,
    purpose,
    vendor: options?.vendor,
    invoiceNumber: options?.invoiceNumber,
    propertyId: options?.propertyId,
    requestedBy,
    requestedAt: new Date(),
    status: "pending",
  };
}

// Approve disbursement request
export function approveDisbursementRequest(
  request: DisbursementRequest,
  approvedBy: string
): DisbursementRequest {
  return {
    ...request,
    status: "approved",
    approvedBy,
    approvedAt: new Date(),
  };
}

// Complete disbursement
export function completeDisbursement(
  request: DisbursementRequest,
  checkNumber?: string
): DisbursementRequest {
  if (request.status !== "approved") {
    throw new Error("Disbursement must be approved before completion");
  }
  return {
    ...request,
    status: "disbursed",
    disbursedAt: new Date(),
    checkNumber,
  };
}

// Reject disbursement request
export function rejectDisbursementRequest(
  request: DisbursementRequest,
  rejectedReason: string
): DisbursementRequest {
  return {
    ...request,
    status: "rejected",
    rejectedReason,
  };
}

// Calculate fund balance
export function calculateFundBalance(
  fundId: FundCategoryId,
  transactions: FundTransaction[],
  pendingDisbursements: DisbursementRequest[]
): FundBalance {
  const fund = getFundCategory(fundId);
  if (!fund) {
    throw new Error(`Fund not found: ${fundId}`);
  }

  const fundTransactions = transactions.filter(t => t.fundId === fundId);
  
  let totalInflows = 0;
  let totalOutflows = 0;

  fundTransactions.forEach(t => {
    if (["donation", "grant_allocation", "transfer_in", "investment_return", "refund"].includes(t.type)) {
      totalInflows += t.amount;
    } else if (["transfer_out", "disbursement", "adjustment"].includes(t.type)) {
      totalOutflows += Math.abs(t.amount);
    }
  });

  const currentBalance = totalInflows - totalOutflows;
  
  const pendingAmount = pendingDisbursements
    .filter(d => d.fundId === fundId && (d.status === "pending" || d.status === "approved"))
    .reduce((sum, d) => sum + d.amount, 0);

  return {
    fundId,
    fundName: fund.name,
    currentBalance,
    targetAmount: fund.targetAmount,
    percentageOfTarget: (currentBalance / fund.targetAmount) * 100,
    totalInflows,
    totalOutflows,
    pendingDisbursements: pendingAmount,
    availableBalance: currentBalance - pendingAmount,
    lastUpdated: new Date(),
  };
}

// Calculate all fund balances
export function calculateAllFundBalances(
  transactions: FundTransaction[],
  pendingDisbursements: DisbursementRequest[]
): FundBalance[] {
  return FUND_CATEGORIES.map(fund => 
    calculateFundBalance(fund.id, transactions, pendingDisbursements)
  );
}

// Validate transfer rules
export function validateTransfer(
  fromFundId: FundCategoryId,
  toFundId: FundCategoryId,
  amount: number,
  fromBalance: number
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (fromFundId === toFundId) {
    errors.push("Cannot transfer to the same fund");
  }

  if (amount <= 0) {
    errors.push("Transfer amount must be positive");
  }

  if (amount > fromBalance) {
    errors.push("Insufficient funds for transfer");
  }

  const toFund = getFundCategory(toFundId);
  if (toFund && !toFund.allowedSources.includes("transfer")) {
    errors.push(`Fund ${toFund.name} does not accept transfers`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Validate disbursement
export function validateDisbursement(
  fundId: FundCategoryId,
  amount: number,
  purpose: string,
  availableBalance: number
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const fund = getFundCategory(fundId);

  if (!fund) {
    errors.push("Invalid fund");
    return { valid: false, errors };
  }

  if (amount <= 0) {
    errors.push("Disbursement amount must be positive");
  }

  if (amount > availableBalance) {
    errors.push("Insufficient available funds");
  }

  // Check if purpose matches fund restrictions
  if (fund.restrictions.length > 0) {
    const purposeLower = purpose.toLowerCase();
    const matchesRestriction = fund.restrictions.some(r => 
      purposeLower.includes(r.replace(/_/g, " "))
    );
    if (!matchesRestriction) {
      errors.push(`Purpose does not match fund restrictions: ${fund.restrictions.join(", ")}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Generate fund report
export interface FundReport {
  reportDate: Date;
  reportPeriod: { start: Date; end: Date };
  fundBalances: FundBalance[];
  totalAssets: number;
  totalTargetAmount: number;
  overallProgress: number;
  transactionSummary: {
    totalDonations: number;
    totalGrants: number;
    totalDisbursements: number;
    totalTransfers: number;
  };
  topDonors: Array<{ name: string; amount: number }>;
  recentTransactions: FundTransaction[];
}

export function generateFundReport(
  transactions: FundTransaction[],
  pendingDisbursements: DisbursementRequest[],
  donationAllocations: DonationAllocation[],
  periodStart: Date,
  periodEnd: Date
): FundReport {
  const balances = calculateAllFundBalances(transactions, pendingDisbursements);
  const totalAssets = balances.reduce((sum, b) => sum + b.currentBalance, 0);
  const totalTargetAmount = balances.reduce((sum, b) => sum + b.targetAmount, 0);

  const periodTransactions = transactions.filter(
    t => t.createdAt >= periodStart && t.createdAt <= periodEnd
  );

  const transactionSummary = {
    totalDonations: periodTransactions
      .filter(t => t.type === "donation")
      .reduce((sum, t) => sum + t.amount, 0),
    totalGrants: periodTransactions
      .filter(t => t.type === "grant_allocation")
      .reduce((sum, t) => sum + t.amount, 0),
    totalDisbursements: periodTransactions
      .filter(t => t.type === "disbursement")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0),
    totalTransfers: periodTransactions
      .filter(t => t.type === "transfer_in" || t.type === "transfer_out")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0),
  };

  // Calculate top donors
  const donorTotals = new Map<string, number>();
  donationAllocations.forEach(d => {
    const current = donorTotals.get(d.donorName) || 0;
    donorTotals.set(d.donorName, current + d.totalAmount);
  });
  const topDonors = Array.from(donorTotals.entries())
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);

  // Recent transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 20);

  return {
    reportDate: new Date(),
    reportPeriod: { start: periodStart, end: periodEnd },
    fundBalances: balances,
    totalAssets,
    totalTargetAmount,
    overallProgress: (totalAssets / totalTargetAmount) * 100,
    transactionSummary,
    topDonors,
    recentTransactions,
  };
}

// Dashboard widget data
export interface FundDashboardWidget {
  fundId: FundCategoryId;
  fundName: string;
  currentBalance: number;
  targetAmount: number;
  progress: number;
  monthlyChange: number;
  monthlyChangePercent: number;
  status: "on_track" | "behind" | "ahead" | "critical";
}

export function generateDashboardWidgets(
  transactions: FundTransaction[],
  pendingDisbursements: DisbursementRequest[]
): FundDashboardWidget[] {
  const balances = calculateAllFundBalances(transactions, pendingDisbursements);
  const now = new Date();
  const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

  return balances.map(balance => {
    // Calculate monthly change
    const monthTransactions = transactions.filter(
      t => t.fundId === balance.fundId && t.createdAt >= monthAgo
    );
    
    let monthlyChange = 0;
    monthTransactions.forEach(t => {
      if (["donation", "grant_allocation", "transfer_in", "investment_return"].includes(t.type)) {
        monthlyChange += t.amount;
      } else if (["transfer_out", "disbursement"].includes(t.type)) {
        monthlyChange -= Math.abs(t.amount);
      }
    });

    const previousBalance = balance.currentBalance - monthlyChange;
    const monthlyChangePercent = previousBalance > 0 
      ? (monthlyChange / previousBalance) * 100 
      : 0;

    // Determine status
    let status: FundDashboardWidget["status"];
    if (balance.percentageOfTarget >= 100) {
      status = "ahead";
    } else if (balance.percentageOfTarget >= 75) {
      status = "on_track";
    } else if (balance.percentageOfTarget >= 50) {
      status = "behind";
    } else {
      status = "critical";
    }

    return {
      fundId: balance.fundId,
      fundName: balance.fundName,
      currentBalance: balance.currentBalance,
      targetAmount: balance.targetAmount,
      progress: balance.percentageOfTarget,
      monthlyChange,
      monthlyChangePercent,
      status,
    };
  });
}
