/**
 * Core Admin Layer Build Service
 * Finance & Grants, HR & Identity, Legal & Contracts, Technology & Infrastructure
 */

// Finance & Grants Types
export interface FinanceAccount {
  id: number;
  name: string;
  type: "asset" | "liability" | "equity" | "revenue" | "expense";
  accountNumber: string;
  balance: number;
  currency: string;
  status: "active" | "inactive" | "frozen";
}

export interface Grant {
  id: number;
  name: string;
  funder: string;
  amount: number;
  startDate: Date;
  endDate: Date;
  status: "pending" | "active" | "reporting" | "closed";
  spentAmount: number;
  remainingAmount: number;
  complianceStatus: "compliant" | "at_risk" | "non_compliant";
}

export interface BudgetLine {
  id: number;
  grantId?: number;
  category: string;
  description: string;
  budgetedAmount: number;
  actualAmount: number;
  variance: number;
  variancePercent: number;
}

// HR & Identity Types
export interface Employee {
  id: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  hireDate: Date;
  status: "active" | "on_leave" | "terminated";
  manager?: number;
  salary: number;
  payFrequency: "weekly" | "biweekly" | "monthly";
}

export interface IdentityRecord {
  id: number;
  userId: number;
  idType: "employee_id" | "member_id" | "contractor_id" | "visitor_id";
  idNumber: string;
  issuedDate: Date;
  expiryDate?: Date;
  status: "active" | "expired" | "revoked";
  accessLevel: "basic" | "standard" | "elevated" | "admin";
}

export interface TimeOffRequest {
  id: number;
  employeeId: number;
  type: "vacation" | "sick" | "personal" | "bereavement" | "jury_duty";
  startDate: Date;
  endDate: Date;
  status: "pending" | "approved" | "denied" | "cancelled";
  approvedBy?: number;
  notes?: string;
}

// Legal & Contracts Types
export interface LegalContract {
  id: number;
  title: string;
  type: "employment" | "vendor" | "client" | "partnership" | "nda" | "lease";
  parties: string[];
  startDate: Date;
  endDate?: Date;
  value?: number;
  status: "draft" | "review" | "active" | "expired" | "terminated";
  signedDate?: Date;
  documentUrl?: string;
}

export interface LegalMatter {
  id: number;
  title: string;
  type: "litigation" | "compliance" | "regulatory" | "ip" | "corporate";
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "critical";
  assignedTo?: number;
  dueDate?: Date;
  resolution?: string;
}

export interface ComplianceRequirement {
  id: number;
  name: string;
  category: "federal" | "state" | "local" | "industry";
  description: string;
  dueDate: Date;
  frequency: "one_time" | "monthly" | "quarterly" | "annual";
  status: "pending" | "in_progress" | "completed" | "overdue";
  responsibleParty: number;
}

// Technology & Infrastructure Types
export interface TechAsset {
  id: number;
  name: string;
  type: "hardware" | "software" | "service" | "license";
  vendor: string;
  purchaseDate: Date;
  expiryDate?: Date;
  cost: number;
  recurringCost?: number;
  status: "active" | "maintenance" | "retired";
  assignedTo?: number;
}

export interface SystemIntegration {
  id: number;
  name: string;
  type: "api" | "database" | "file_transfer" | "webhook";
  sourceSystem: string;
  targetSystem: string;
  status: "active" | "inactive" | "error";
  lastSync?: Date;
  frequency: "realtime" | "hourly" | "daily" | "weekly";
}

export interface InfrastructureService {
  id: number;
  name: string;
  type: "compute" | "storage" | "network" | "security" | "backup";
  provider: string;
  status: "healthy" | "degraded" | "down";
  monthlyCost: number;
  sla: number; // percentage
  uptime: number; // percentage
}

// Finance Functions
export function calculateBudgetVariance(budgeted: number, actual: number): { variance: number; variancePercent: number } {
  const variance = budgeted - actual;
  const variancePercent = budgeted === 0 ? 0 : (variance / budgeted) * 100;
  return { variance, variancePercent };
}

export function getGrantBurnRate(grant: Grant): number {
  const totalDays = (grant.endDate.getTime() - grant.startDate.getTime()) / (1000 * 60 * 60 * 24);
  const elapsedDays = (Date.now() - grant.startDate.getTime()) / (1000 * 60 * 60 * 24);
  if (elapsedDays <= 0) return 0;
  return grant.spentAmount / elapsedDays;
}

export function getGrantProjectedSpend(grant: Grant): number {
  const burnRate = getGrantBurnRate(grant);
  const remainingDays = (grant.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  return grant.spentAmount + (burnRate * remainingDays);
}

export function createFinanceAccountData(
  name: string,
  type: FinanceAccount["type"],
  accountNumber: string,
  initialBalance: number = 0
): Omit<FinanceAccount, "id"> {
  return {
    name,
    type,
    accountNumber,
    balance: initialBalance,
    currency: "USD",
    status: "active"
  };
}

export function createGrantData(
  name: string,
  funder: string,
  amount: number,
  startDate: Date,
  endDate: Date
): Omit<Grant, "id"> {
  return {
    name,
    funder,
    amount,
    startDate,
    endDate,
    status: "pending",
    spentAmount: 0,
    remainingAmount: amount,
    complianceStatus: "compliant"
  };
}

// HR Functions
export function calculateTenure(hireDate: Date): { years: number; months: number; days: number } {
  const now = new Date();
  const diff = now.getTime() - hireDate.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const years = Math.floor(days / 365);
  const remainingDays = days % 365;
  const months = Math.floor(remainingDays / 30);
  const finalDays = remainingDays % 30;
  return { years, months, days: finalDays };
}

export function calculateTimeOffDays(startDate: Date, endDate: Date): number {
  const diff = endDate.getTime() - startDate.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
}

export function createEmployeeData(
  employeeId: string,
  firstName: string,
  lastName: string,
  email: string,
  department: string,
  position: string,
  salary: number
): Omit<Employee, "id"> {
  return {
    employeeId,
    firstName,
    lastName,
    email,
    department,
    position,
    hireDate: new Date(),
    status: "active",
    salary,
    payFrequency: "biweekly"
  };
}

export function createIdentityRecordData(
  userId: number,
  idType: IdentityRecord["idType"],
  idNumber: string,
  accessLevel: IdentityRecord["accessLevel"]
): Omit<IdentityRecord, "id"> {
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  
  return {
    userId,
    idType,
    idNumber,
    issuedDate: new Date(),
    expiryDate,
    status: "active",
    accessLevel
  };
}

// Legal Functions
export function isContractExpiring(contract: LegalContract, daysThreshold: number = 30): boolean {
  if (!contract.endDate) return false;
  const daysUntilExpiry = (contract.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  return daysUntilExpiry <= daysThreshold && daysUntilExpiry > 0;
}

export function isComplianceOverdue(requirement: ComplianceRequirement): boolean {
  return requirement.dueDate.getTime() < Date.now() && requirement.status !== "completed";
}

export function createContractData(
  title: string,
  type: LegalContract["type"],
  parties: string[],
  startDate: Date,
  endDate?: Date,
  value?: number
): Omit<LegalContract, "id"> {
  return {
    title,
    type,
    parties,
    startDate,
    endDate,
    value,
    status: "draft"
  };
}

export function createComplianceRequirementData(
  name: string,
  category: ComplianceRequirement["category"],
  description: string,
  dueDate: Date,
  frequency: ComplianceRequirement["frequency"],
  responsibleParty: number
): Omit<ComplianceRequirement, "id"> {
  return {
    name,
    category,
    description,
    dueDate,
    frequency,
    status: "pending",
    responsibleParty
  };
}

// Technology Functions
export function calculateTechAssetDepreciation(asset: TechAsset, usefulLifeYears: number): number {
  const yearsOwned = (Date.now() - asset.purchaseDate.getTime()) / (365 * 24 * 60 * 60 * 1000);
  const depreciationRate = 1 / usefulLifeYears;
  const depreciation = Math.min(asset.cost * depreciationRate * yearsOwned, asset.cost);
  return asset.cost - depreciation;
}

export function getSystemHealthStatus(services: InfrastructureService[]): "healthy" | "degraded" | "critical" {
  const downCount = services.filter(s => s.status === "down").length;
  const degradedCount = services.filter(s => s.status === "degraded").length;
  
  if (downCount > 0) return "critical";
  if (degradedCount > services.length * 0.3) return "degraded";
  return "healthy";
}

export function createTechAssetData(
  name: string,
  type: TechAsset["type"],
  vendor: string,
  cost: number,
  recurringCost?: number
): Omit<TechAsset, "id"> {
  return {
    name,
    type,
    vendor,
    purchaseDate: new Date(),
    cost,
    recurringCost,
    status: "active"
  };
}

export function createIntegrationData(
  name: string,
  type: SystemIntegration["type"],
  sourceSystem: string,
  targetSystem: string,
  frequency: SystemIntegration["frequency"]
): Omit<SystemIntegration, "id"> {
  return {
    name,
    type,
    sourceSystem,
    targetSystem,
    status: "active",
    frequency
  };
}

export function getCoreAdminLayerSummary() {
  return {
    modules: ["Finance & Grants", "HR & Identity", "Legal & Contracts", "Technology & Infrastructure"],
    financeAccountTypes: ["asset", "liability", "equity", "revenue", "expense"],
    grantStatuses: ["pending", "active", "reporting", "closed"],
    employeeStatuses: ["active", "on_leave", "terminated"],
    identityTypes: ["employee_id", "member_id", "contractor_id", "visitor_id"],
    contractTypes: ["employment", "vendor", "client", "partnership", "nda", "lease"],
    legalMatterTypes: ["litigation", "compliance", "regulatory", "ip", "corporate"],
    techAssetTypes: ["hardware", "software", "service", "license"],
    integrationTypes: ["api", "database", "file_transfer", "webhook"]
  };
}
