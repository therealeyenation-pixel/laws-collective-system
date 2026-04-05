/**
 * Foundation Layer Build Service
 * Monitoring & Evaluation, Risk & Contingency, Facilities & Land Registry
 */

// M&E Dashboard Types
export interface MEMetric {
  id: number;
  name: string;
  category: "output" | "outcome" | "impact";
  targetValue: number;
  currentValue: number;
  unit: string;
  frequency: "daily" | "weekly" | "monthly" | "quarterly" | "annual";
  lastUpdated: Date;
  trend: "up" | "down" | "stable";
  status: "on_track" | "at_risk" | "off_track";
}

export interface MEIndicator {
  id: number;
  metricId: number;
  period: string;
  value: number;
  notes?: string;
  recordedAt: Date;
  recordedBy: number;
}

export interface MEReport {
  id: number;
  title: string;
  reportType: "monthly" | "quarterly" | "annual" | "ad_hoc";
  periodStart: Date;
  periodEnd: Date;
  metrics: MEMetric[];
  summary: string;
  recommendations: string[];
  status: "draft" | "review" | "approved" | "published";
  createdAt: Date;
  createdBy: number;
}

// Risk & Contingency Types
export interface Risk {
  id: number;
  title: string;
  description: string;
  category: "strategic" | "operational" | "financial" | "compliance" | "reputational";
  likelihood: 1 | 2 | 3 | 4 | 5;
  impact: 1 | 2 | 3 | 4 | 5;
  riskScore: number;
  status: "identified" | "assessed" | "mitigating" | "monitoring" | "closed";
  owner: number;
  mitigationPlan: string;
  contingencyPlan: string;
  reviewDate: Date;
  createdAt: Date;
}

export interface RiskAssessment {
  id: number;
  riskId: number;
  assessedBy: number;
  assessedAt: Date;
  previousScore: number;
  newScore: number;
  notes: string;
  recommendations: string[];
}

export interface ContingencyPlan {
  id: number;
  riskId: number;
  title: string;
  triggerConditions: string[];
  actions: ContingencyAction[];
  resources: string[];
  estimatedCost: number;
  timeToActivate: string;
  lastTested: Date;
  status: "draft" | "approved" | "active" | "archived";
}

export interface ContingencyAction {
  order: number;
  action: string;
  responsible: string;
  timeframe: string;
  dependencies: string[];
}

// Facilities & Land Registry Types
export interface Facility {
  id: number;
  name: string;
  type: "office" | "warehouse" | "production" | "retail" | "residential" | "land";
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  squareFootage: number;
  capacity?: number;
  ownershipType: "owned" | "leased" | "managed";
  status: "active" | "inactive" | "under_construction" | "for_sale";
  acquiredDate: Date;
  value: number;
  annualCost: number;
}

export interface LandParcel {
  id: number;
  parcelId: string;
  name: string;
  acreage: number;
  zoning: string;
  address: string;
  county: string;
  state: string;
  ownershipType: "fee_simple" | "leasehold" | "easement" | "trust";
  acquiredDate: Date;
  purchasePrice: number;
  currentValue: number;
  taxAssessment: number;
  annualTaxes: number;
  encumbrances: string[];
  status: "active" | "pending_sale" | "in_development" | "conservation";
}

export interface FacilityMaintenance {
  id: number;
  facilityId: number;
  type: "routine" | "preventive" | "corrective" | "emergency";
  description: string;
  scheduledDate: Date;
  completedDate?: Date;
  cost: number;
  vendor?: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
}

// M&E Functions
export function calculateMetricStatus(current: number, target: number): "on_track" | "at_risk" | "off_track" {
  const percentage = (current / target) * 100;
  if (percentage >= 90) return "on_track";
  if (percentage >= 70) return "at_risk";
  return "off_track";
}

export function calculateTrend(values: number[]): "up" | "down" | "stable" {
  if (values.length < 2) return "stable";
  const recent = values.slice(-3);
  const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const first = recent[0];
  const diff = ((avg - first) / first) * 100;
  if (diff > 5) return "up";
  if (diff < -5) return "down";
  return "stable";
}

export function createMEMetricData(
  name: string,
  category: MEMetric["category"],
  targetValue: number,
  unit: string,
  frequency: MEMetric["frequency"]
): Omit<MEMetric, "id"> {
  return {
    name,
    category,
    targetValue,
    currentValue: 0,
    unit,
    frequency,
    lastUpdated: new Date(),
    trend: "stable",
    status: "on_track"
  };
}

export function generateMEReportSummary(metrics: MEMetric[]): {
  totalMetrics: number;
  onTrack: number;
  atRisk: number;
  offTrack: number;
  overallHealth: "healthy" | "warning" | "critical";
} {
  const onTrack = metrics.filter(m => m.status === "on_track").length;
  const atRisk = metrics.filter(m => m.status === "at_risk").length;
  const offTrack = metrics.filter(m => m.status === "off_track").length;
  
  let overallHealth: "healthy" | "warning" | "critical" = "healthy";
  if (offTrack > metrics.length * 0.3) overallHealth = "critical";
  else if (atRisk > metrics.length * 0.3) overallHealth = "warning";

  return {
    totalMetrics: metrics.length,
    onTrack,
    atRisk,
    offTrack,
    overallHealth
  };
}

// Risk Functions
export function calculateRiskScore(likelihood: number, impact: number): number {
  return likelihood * impact;
}

export function getRiskLevel(score: number): "low" | "medium" | "high" | "critical" {
  if (score <= 4) return "low";
  if (score <= 9) return "medium";
  if (score <= 16) return "high";
  return "critical";
}

export function createRiskData(
  title: string,
  description: string,
  category: Risk["category"],
  likelihood: Risk["likelihood"],
  impact: Risk["impact"],
  owner: number
): Omit<Risk, "id"> {
  return {
    title,
    description,
    category,
    likelihood,
    impact,
    riskScore: calculateRiskScore(likelihood, impact),
    status: "identified",
    owner,
    mitigationPlan: "",
    contingencyPlan: "",
    reviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    createdAt: new Date()
  };
}

export function prioritizeRisks(risks: Risk[]): Risk[] {
  return [...risks].sort((a, b) => b.riskScore - a.riskScore);
}

export function getRiskMatrix(): { likelihood: number; impact: number; level: string }[] {
  const matrix = [];
  for (let l = 1; l <= 5; l++) {
    for (let i = 1; i <= 5; i++) {
      matrix.push({
        likelihood: l,
        impact: i,
        level: getRiskLevel(l * i)
      });
    }
  }
  return matrix;
}

// Facilities Functions
export function calculateFacilityROI(facility: Facility, annualRevenue: number): number {
  if (facility.annualCost === 0) return 0;
  return ((annualRevenue - facility.annualCost) / facility.value) * 100;
}

export function createFacilityData(
  name: string,
  type: Facility["type"],
  address: string,
  city: string,
  state: string,
  zipCode: string,
  squareFootage: number,
  ownershipType: Facility["ownershipType"],
  value: number,
  annualCost: number
): Omit<Facility, "id"> {
  return {
    name,
    type,
    address,
    city,
    state,
    zipCode,
    country: "USA",
    squareFootage,
    ownershipType,
    status: "active",
    acquiredDate: new Date(),
    value,
    annualCost
  };
}

export function createLandParcelData(
  parcelId: string,
  name: string,
  acreage: number,
  zoning: string,
  address: string,
  county: string,
  state: string,
  ownershipType: LandParcel["ownershipType"],
  purchasePrice: number
): Omit<LandParcel, "id"> {
  return {
    parcelId,
    name,
    acreage,
    zoning,
    address,
    county,
    state,
    ownershipType,
    acquiredDate: new Date(),
    purchasePrice,
    currentValue: purchasePrice,
    taxAssessment: purchasePrice * 0.8,
    annualTaxes: purchasePrice * 0.8 * 0.015, // Estimated 1.5% tax rate
    encumbrances: [],
    status: "active"
  };
}

export function calculateLandAppreciation(parcel: LandParcel): number {
  const yearsOwned = (Date.now() - parcel.acquiredDate.getTime()) / (365 * 24 * 60 * 60 * 1000);
  if (yearsOwned === 0) return 0;
  return ((parcel.currentValue - parcel.purchasePrice) / parcel.purchasePrice / yearsOwned) * 100;
}

export function getFoundationLayerSummary() {
  return {
    modules: ["Monitoring & Evaluation", "Risk & Contingency", "Facilities & Land Registry"],
    meCategories: ["output", "outcome", "impact"],
    meFrequencies: ["daily", "weekly", "monthly", "quarterly", "annual"],
    riskCategories: ["strategic", "operational", "financial", "compliance", "reputational"],
    riskLevels: ["low", "medium", "high", "critical"],
    facilityTypes: ["office", "warehouse", "production", "retail", "residential", "land"],
    ownershipTypes: ["owned", "leased", "managed", "fee_simple", "leasehold", "easement", "trust"]
  };
}
