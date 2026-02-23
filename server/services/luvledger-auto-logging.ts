/**
 * LuvLedger Auto-Logging Service
 * Phase 50.1: Automatic logging of business events to LuvLedger
 */

// Event Types for Auto-Logging
export type AutoLogEventType =
  | "business_creation"
  | "business_dissolution"
  | "property_acquisition"
  | "property_disposition"
  | "worker_hire"
  | "worker_termination"
  | "contractor_engagement"
  | "contractor_termination"
  | "entity_formation"
  | "entity_dissolution"
  | "asset_acquisition"
  | "asset_disposition"
  | "contract_execution"
  | "contract_termination"
  | "grant_award"
  | "grant_completion"
  | "loan_origination"
  | "loan_payoff"
  | "investment_made"
  | "investment_exit"
  | "trust_creation"
  | "trust_termination"
  | "succession_event"
  | "governance_change"
  | "compliance_filing"
  | "tax_filing"
  | "legal_action"
  | "insurance_policy"
  | "certificate_issuance";

// Event Category
export type EventCategory =
  | "entity"
  | "property"
  | "personnel"
  | "financial"
  | "legal"
  | "compliance"
  | "governance";

// Auto-Log Entry
export interface AutoLogEntry {
  id: string;
  eventType: AutoLogEventType;
  category: EventCategory;
  timestamp: string;
  entityId?: string;
  entityName?: string;
  houseId?: string;
  houseName?: string;
  description: string;
  details: Record<string, unknown>;
  financialImpact?: {
    amount: number;
    currency: string;
    direction: "inflow" | "outflow" | "neutral";
  };
  relatedDocuments?: string[];
  relatedEntities?: string[];
  createdBy: string;
  status: "logged" | "pending_review" | "verified" | "archived";
  blockchainHash?: string;
  metadata?: Record<string, unknown>;
}

// Event Configuration
interface EventConfig {
  eventType: AutoLogEventType;
  category: EventCategory;
  requiresApproval: boolean;
  blockchainAnchor: boolean;
  notifyOwner: boolean;
  retentionYears: number;
}

// Event Configurations
const EVENT_CONFIGS: Record<AutoLogEventType, EventConfig> = {
  business_creation: {
    eventType: "business_creation",
    category: "entity",
    requiresApproval: false,
    blockchainAnchor: true,
    notifyOwner: true,
    retentionYears: 100
  },
  business_dissolution: {
    eventType: "business_dissolution",
    category: "entity",
    requiresApproval: true,
    blockchainAnchor: true,
    notifyOwner: true,
    retentionYears: 100
  },
  property_acquisition: {
    eventType: "property_acquisition",
    category: "property",
    requiresApproval: false,
    blockchainAnchor: true,
    notifyOwner: true,
    retentionYears: 100
  },
  property_disposition: {
    eventType: "property_disposition",
    category: "property",
    requiresApproval: true,
    blockchainAnchor: true,
    notifyOwner: true,
    retentionYears: 100
  },
  worker_hire: {
    eventType: "worker_hire",
    category: "personnel",
    requiresApproval: false,
    blockchainAnchor: false,
    notifyOwner: false,
    retentionYears: 7
  },
  worker_termination: {
    eventType: "worker_termination",
    category: "personnel",
    requiresApproval: false,
    blockchainAnchor: false,
    notifyOwner: false,
    retentionYears: 7
  },
  contractor_engagement: {
    eventType: "contractor_engagement",
    category: "personnel",
    requiresApproval: false,
    blockchainAnchor: false,
    notifyOwner: false,
    retentionYears: 7
  },
  contractor_termination: {
    eventType: "contractor_termination",
    category: "personnel",
    requiresApproval: false,
    blockchainAnchor: false,
    notifyOwner: false,
    retentionYears: 7
  },
  entity_formation: {
    eventType: "entity_formation",
    category: "entity",
    requiresApproval: false,
    blockchainAnchor: true,
    notifyOwner: true,
    retentionYears: 100
  },
  entity_dissolution: {
    eventType: "entity_dissolution",
    category: "entity",
    requiresApproval: true,
    blockchainAnchor: true,
    notifyOwner: true,
    retentionYears: 100
  },
  asset_acquisition: {
    eventType: "asset_acquisition",
    category: "financial",
    requiresApproval: false,
    blockchainAnchor: true,
    notifyOwner: false,
    retentionYears: 10
  },
  asset_disposition: {
    eventType: "asset_disposition",
    category: "financial",
    requiresApproval: false,
    blockchainAnchor: true,
    notifyOwner: false,
    retentionYears: 10
  },
  contract_execution: {
    eventType: "contract_execution",
    category: "legal",
    requiresApproval: false,
    blockchainAnchor: true,
    notifyOwner: false,
    retentionYears: 10
  },
  contract_termination: {
    eventType: "contract_termination",
    category: "legal",
    requiresApproval: false,
    blockchainAnchor: true,
    notifyOwner: false,
    retentionYears: 10
  },
  grant_award: {
    eventType: "grant_award",
    category: "financial",
    requiresApproval: false,
    blockchainAnchor: true,
    notifyOwner: true,
    retentionYears: 10
  },
  grant_completion: {
    eventType: "grant_completion",
    category: "financial",
    requiresApproval: false,
    blockchainAnchor: true,
    notifyOwner: true,
    retentionYears: 10
  },
  loan_origination: {
    eventType: "loan_origination",
    category: "financial",
    requiresApproval: false,
    blockchainAnchor: true,
    notifyOwner: true,
    retentionYears: 10
  },
  loan_payoff: {
    eventType: "loan_payoff",
    category: "financial",
    requiresApproval: false,
    blockchainAnchor: true,
    notifyOwner: true,
    retentionYears: 10
  },
  investment_made: {
    eventType: "investment_made",
    category: "financial",
    requiresApproval: false,
    blockchainAnchor: true,
    notifyOwner: true,
    retentionYears: 10
  },
  investment_exit: {
    eventType: "investment_exit",
    category: "financial",
    requiresApproval: false,
    blockchainAnchor: true,
    notifyOwner: true,
    retentionYears: 10
  },
  trust_creation: {
    eventType: "trust_creation",
    category: "entity",
    requiresApproval: false,
    blockchainAnchor: true,
    notifyOwner: true,
    retentionYears: 100
  },
  trust_termination: {
    eventType: "trust_termination",
    category: "entity",
    requiresApproval: true,
    blockchainAnchor: true,
    notifyOwner: true,
    retentionYears: 100
  },
  succession_event: {
    eventType: "succession_event",
    category: "governance",
    requiresApproval: true,
    blockchainAnchor: true,
    notifyOwner: true,
    retentionYears: 100
  },
  governance_change: {
    eventType: "governance_change",
    category: "governance",
    requiresApproval: true,
    blockchainAnchor: true,
    notifyOwner: true,
    retentionYears: 100
  },
  compliance_filing: {
    eventType: "compliance_filing",
    category: "compliance",
    requiresApproval: false,
    blockchainAnchor: false,
    notifyOwner: false,
    retentionYears: 7
  },
  tax_filing: {
    eventType: "tax_filing",
    category: "compliance",
    requiresApproval: false,
    blockchainAnchor: false,
    notifyOwner: false,
    retentionYears: 7
  },
  legal_action: {
    eventType: "legal_action",
    category: "legal",
    requiresApproval: false,
    blockchainAnchor: true,
    notifyOwner: true,
    retentionYears: 20
  },
  insurance_policy: {
    eventType: "insurance_policy",
    category: "financial",
    requiresApproval: false,
    blockchainAnchor: false,
    notifyOwner: false,
    retentionYears: 10
  },
  certificate_issuance: {
    eventType: "certificate_issuance",
    category: "compliance",
    requiresApproval: false,
    blockchainAnchor: true,
    notifyOwner: false,
    retentionYears: 100
  }
};

// In-memory storage for demo (would be database in production)
const autoLogEntries: AutoLogEntry[] = [];

/**
 * Generate unique ID for log entry
 */
function generateLogId(): string {
  return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate blockchain hash (simulated)
 */
function generateBlockchainHash(entry: AutoLogEntry): string {
  const data = JSON.stringify({
    id: entry.id,
    eventType: entry.eventType,
    timestamp: entry.timestamp,
    details: entry.details
  });
  // Simulated hash - in production would use actual blockchain
  return `0x${Buffer.from(data).toString('hex').substring(0, 64)}`;
}

/**
 * Log a business creation event
 */
export function logBusinessCreation(
  businessName: string,
  businessType: string,
  jurisdiction: string,
  createdBy: string,
  details: Record<string, unknown> = {}
): AutoLogEntry {
  const entry: AutoLogEntry = {
    id: generateLogId(),
    eventType: "business_creation",
    category: "entity",
    timestamp: new Date().toISOString(),
    entityName: businessName,
    description: `Business created: ${businessName} (${businessType}) in ${jurisdiction}`,
    details: {
      businessName,
      businessType,
      jurisdiction,
      ...details
    },
    createdBy,
    status: "logged"
  };

  if (EVENT_CONFIGS.business_creation.blockchainAnchor) {
    entry.blockchainHash = generateBlockchainHash(entry);
  }

  autoLogEntries.push(entry);
  return entry;
}

/**
 * Log a property acquisition event
 */
export function logPropertyAcquisition(
  propertyAddress: string,
  propertyType: string,
  purchasePrice: number,
  currency: string,
  entityId: string,
  entityName: string,
  createdBy: string,
  details: Record<string, unknown> = {}
): AutoLogEntry {
  const entry: AutoLogEntry = {
    id: generateLogId(),
    eventType: "property_acquisition",
    category: "property",
    timestamp: new Date().toISOString(),
    entityId,
    entityName,
    description: `Property acquired: ${propertyAddress} (${propertyType}) for ${currency} ${purchasePrice.toLocaleString()}`,
    details: {
      propertyAddress,
      propertyType,
      purchasePrice,
      currency,
      ...details
    },
    financialImpact: {
      amount: purchasePrice,
      currency,
      direction: "outflow"
    },
    createdBy,
    status: "logged"
  };

  if (EVENT_CONFIGS.property_acquisition.blockchainAnchor) {
    entry.blockchainHash = generateBlockchainHash(entry);
  }

  autoLogEntries.push(entry);
  return entry;
}

/**
 * Log a property disposition event
 */
export function logPropertyDisposition(
  propertyAddress: string,
  propertyType: string,
  salePrice: number,
  currency: string,
  entityId: string,
  entityName: string,
  createdBy: string,
  details: Record<string, unknown> = {}
): AutoLogEntry {
  const entry: AutoLogEntry = {
    id: generateLogId(),
    eventType: "property_disposition",
    category: "property",
    timestamp: new Date().toISOString(),
    entityId,
    entityName,
    description: `Property sold: ${propertyAddress} (${propertyType}) for ${currency} ${salePrice.toLocaleString()}`,
    details: {
      propertyAddress,
      propertyType,
      salePrice,
      currency,
      ...details
    },
    financialImpact: {
      amount: salePrice,
      currency,
      direction: "inflow"
    },
    createdBy,
    status: "pending_review"
  };

  if (EVENT_CONFIGS.property_disposition.blockchainAnchor) {
    entry.blockchainHash = generateBlockchainHash(entry);
  }

  autoLogEntries.push(entry);
  return entry;
}

/**
 * Log a worker hire event
 */
export function logWorkerHire(
  workerName: string,
  position: string,
  department: string,
  startDate: string,
  salary: number,
  currency: string,
  entityId: string,
  entityName: string,
  createdBy: string,
  details: Record<string, unknown> = {}
): AutoLogEntry {
  const entry: AutoLogEntry = {
    id: generateLogId(),
    eventType: "worker_hire",
    category: "personnel",
    timestamp: new Date().toISOString(),
    entityId,
    entityName,
    description: `Worker hired: ${workerName} as ${position} in ${department}`,
    details: {
      workerName,
      position,
      department,
      startDate,
      salary,
      currency,
      ...details
    },
    financialImpact: {
      amount: salary,
      currency,
      direction: "outflow"
    },
    createdBy,
    status: "logged"
  };

  autoLogEntries.push(entry);
  return entry;
}

/**
 * Log a worker termination event
 */
export function logWorkerTermination(
  workerName: string,
  position: string,
  terminationDate: string,
  terminationType: "voluntary" | "involuntary" | "retirement" | "contract_end",
  entityId: string,
  entityName: string,
  createdBy: string,
  details: Record<string, unknown> = {}
): AutoLogEntry {
  const entry: AutoLogEntry = {
    id: generateLogId(),
    eventType: "worker_termination",
    category: "personnel",
    timestamp: new Date().toISOString(),
    entityId,
    entityName,
    description: `Worker terminated: ${workerName} (${position}) - ${terminationType}`,
    details: {
      workerName,
      position,
      terminationDate,
      terminationType,
      ...details
    },
    createdBy,
    status: "logged"
  };

  autoLogEntries.push(entry);
  return entry;
}

/**
 * Log a contractor engagement event
 */
export function logContractorEngagement(
  contractorName: string,
  serviceType: string,
  contractValue: number,
  currency: string,
  startDate: string,
  endDate: string,
  entityId: string,
  entityName: string,
  createdBy: string,
  details: Record<string, unknown> = {}
): AutoLogEntry {
  const entry: AutoLogEntry = {
    id: generateLogId(),
    eventType: "contractor_engagement",
    category: "personnel",
    timestamp: new Date().toISOString(),
    entityId,
    entityName,
    description: `Contractor engaged: ${contractorName} for ${serviceType}`,
    details: {
      contractorName,
      serviceType,
      contractValue,
      currency,
      startDate,
      endDate,
      ...details
    },
    financialImpact: {
      amount: contractValue,
      currency,
      direction: "outflow"
    },
    createdBy,
    status: "logged"
  };

  autoLogEntries.push(entry);
  return entry;
}

/**
 * Log an entity formation event
 */
export function logEntityFormation(
  entityName: string,
  entityType: string,
  jurisdiction: string,
  parentEntityId: string | undefined,
  createdBy: string,
  details: Record<string, unknown> = {}
): AutoLogEntry {
  const entry: AutoLogEntry = {
    id: generateLogId(),
    eventType: "entity_formation",
    category: "entity",
    timestamp: new Date().toISOString(),
    entityName,
    description: `Entity formed: ${entityName} (${entityType}) in ${jurisdiction}`,
    details: {
      entityName,
      entityType,
      jurisdiction,
      parentEntityId,
      ...details
    },
    relatedEntities: parentEntityId ? [parentEntityId] : undefined,
    createdBy,
    status: "logged"
  };

  if (EVENT_CONFIGS.entity_formation.blockchainAnchor) {
    entry.blockchainHash = generateBlockchainHash(entry);
  }

  autoLogEntries.push(entry);
  return entry;
}

/**
 * Log an asset acquisition event
 */
export function logAssetAcquisition(
  assetName: string,
  assetType: string,
  assetValue: number,
  currency: string,
  entityId: string,
  entityName: string,
  createdBy: string,
  details: Record<string, unknown> = {}
): AutoLogEntry {
  const entry: AutoLogEntry = {
    id: generateLogId(),
    eventType: "asset_acquisition",
    category: "financial",
    timestamp: new Date().toISOString(),
    entityId,
    entityName,
    description: `Asset acquired: ${assetName} (${assetType}) valued at ${currency} ${assetValue.toLocaleString()}`,
    details: {
      assetName,
      assetType,
      assetValue,
      currency,
      ...details
    },
    financialImpact: {
      amount: assetValue,
      currency,
      direction: "outflow"
    },
    createdBy,
    status: "logged"
  };

  if (EVENT_CONFIGS.asset_acquisition.blockchainAnchor) {
    entry.blockchainHash = generateBlockchainHash(entry);
  }

  autoLogEntries.push(entry);
  return entry;
}

/**
 * Log a contract execution event
 */
export function logContractExecution(
  contractTitle: string,
  contractType: string,
  contractValue: number,
  currency: string,
  counterparty: string,
  entityId: string,
  entityName: string,
  createdBy: string,
  details: Record<string, unknown> = {}
): AutoLogEntry {
  const entry: AutoLogEntry = {
    id: generateLogId(),
    eventType: "contract_execution",
    category: "legal",
    timestamp: new Date().toISOString(),
    entityId,
    entityName,
    description: `Contract executed: ${contractTitle} with ${counterparty}`,
    details: {
      contractTitle,
      contractType,
      contractValue,
      currency,
      counterparty,
      ...details
    },
    financialImpact: contractValue > 0 ? {
      amount: contractValue,
      currency,
      direction: "neutral"
    } : undefined,
    createdBy,
    status: "logged"
  };

  if (EVENT_CONFIGS.contract_execution.blockchainAnchor) {
    entry.blockchainHash = generateBlockchainHash(entry);
  }

  autoLogEntries.push(entry);
  return entry;
}

/**
 * Log a grant award event
 */
export function logGrantAward(
  grantName: string,
  grantorName: string,
  awardAmount: number,
  currency: string,
  grantPurpose: string,
  entityId: string,
  entityName: string,
  createdBy: string,
  details: Record<string, unknown> = {}
): AutoLogEntry {
  const entry: AutoLogEntry = {
    id: generateLogId(),
    eventType: "grant_award",
    category: "financial",
    timestamp: new Date().toISOString(),
    entityId,
    entityName,
    description: `Grant awarded: ${grantName} from ${grantorName} for ${currency} ${awardAmount.toLocaleString()}`,
    details: {
      grantName,
      grantorName,
      awardAmount,
      currency,
      grantPurpose,
      ...details
    },
    financialImpact: {
      amount: awardAmount,
      currency,
      direction: "inflow"
    },
    createdBy,
    status: "logged"
  };

  if (EVENT_CONFIGS.grant_award.blockchainAnchor) {
    entry.blockchainHash = generateBlockchainHash(entry);
  }

  autoLogEntries.push(entry);
  return entry;
}

/**
 * Log a loan origination event
 */
export function logLoanOrigination(
  loanType: string,
  lenderName: string,
  principalAmount: number,
  currency: string,
  interestRate: number,
  termMonths: number,
  entityId: string,
  entityName: string,
  createdBy: string,
  details: Record<string, unknown> = {}
): AutoLogEntry {
  const entry: AutoLogEntry = {
    id: generateLogId(),
    eventType: "loan_origination",
    category: "financial",
    timestamp: new Date().toISOString(),
    entityId,
    entityName,
    description: `Loan originated: ${loanType} from ${lenderName} for ${currency} ${principalAmount.toLocaleString()} at ${interestRate}%`,
    details: {
      loanType,
      lenderName,
      principalAmount,
      currency,
      interestRate,
      termMonths,
      ...details
    },
    financialImpact: {
      amount: principalAmount,
      currency,
      direction: "inflow"
    },
    createdBy,
    status: "logged"
  };

  if (EVENT_CONFIGS.loan_origination.blockchainAnchor) {
    entry.blockchainHash = generateBlockchainHash(entry);
  }

  autoLogEntries.push(entry);
  return entry;
}

/**
 * Log a trust creation event
 */
export function logTrustCreation(
  trustName: string,
  trustType: string,
  settlor: string,
  trustees: string[],
  beneficiaries: string[],
  createdBy: string,
  details: Record<string, unknown> = {}
): AutoLogEntry {
  const entry: AutoLogEntry = {
    id: generateLogId(),
    eventType: "trust_creation",
    category: "entity",
    timestamp: new Date().toISOString(),
    entityName: trustName,
    description: `Trust created: ${trustName} (${trustType}) by ${settlor}`,
    details: {
      trustName,
      trustType,
      settlor,
      trustees,
      beneficiaries,
      ...details
    },
    createdBy,
    status: "logged"
  };

  if (EVENT_CONFIGS.trust_creation.blockchainAnchor) {
    entry.blockchainHash = generateBlockchainHash(entry);
  }

  autoLogEntries.push(entry);
  return entry;
}

/**
 * Log a succession event
 */
export function logSuccessionEvent(
  eventDescription: string,
  fromPerson: string,
  toPerson: string,
  entityId: string,
  entityName: string,
  createdBy: string,
  details: Record<string, unknown> = {}
): AutoLogEntry {
  const entry: AutoLogEntry = {
    id: generateLogId(),
    eventType: "succession_event",
    category: "governance",
    timestamp: new Date().toISOString(),
    entityId,
    entityName,
    description: `Succession: ${eventDescription} - from ${fromPerson} to ${toPerson}`,
    details: {
      eventDescription,
      fromPerson,
      toPerson,
      ...details
    },
    createdBy,
    status: "pending_review"
  };

  if (EVENT_CONFIGS.succession_event.blockchainAnchor) {
    entry.blockchainHash = generateBlockchainHash(entry);
  }

  autoLogEntries.push(entry);
  return entry;
}

/**
 * Log a governance change event
 */
export function logGovernanceChange(
  changeType: string,
  changeDescription: string,
  entityId: string,
  entityName: string,
  createdBy: string,
  details: Record<string, unknown> = {}
): AutoLogEntry {
  const entry: AutoLogEntry = {
    id: generateLogId(),
    eventType: "governance_change",
    category: "governance",
    timestamp: new Date().toISOString(),
    entityId,
    entityName,
    description: `Governance change: ${changeType} - ${changeDescription}`,
    details: {
      changeType,
      changeDescription,
      ...details
    },
    createdBy,
    status: "pending_review"
  };

  if (EVENT_CONFIGS.governance_change.blockchainAnchor) {
    entry.blockchainHash = generateBlockchainHash(entry);
  }

  autoLogEntries.push(entry);
  return entry;
}

/**
 * Log a compliance filing event
 */
export function logComplianceFiling(
  filingType: string,
  jurisdiction: string,
  filingPeriod: string,
  entityId: string,
  entityName: string,
  createdBy: string,
  details: Record<string, unknown> = {}
): AutoLogEntry {
  const entry: AutoLogEntry = {
    id: generateLogId(),
    eventType: "compliance_filing",
    category: "compliance",
    timestamp: new Date().toISOString(),
    entityId,
    entityName,
    description: `Compliance filing: ${filingType} for ${filingPeriod} in ${jurisdiction}`,
    details: {
      filingType,
      jurisdiction,
      filingPeriod,
      ...details
    },
    createdBy,
    status: "logged"
  };

  autoLogEntries.push(entry);
  return entry;
}

/**
 * Log a certificate issuance event
 */
export function logCertificateIssuance(
  certificateType: string,
  recipientName: string,
  issuingEntity: string,
  certificateId: string,
  createdBy: string,
  details: Record<string, unknown> = {}
): AutoLogEntry {
  const entry: AutoLogEntry = {
    id: generateLogId(),
    eventType: "certificate_issuance",
    category: "compliance",
    timestamp: new Date().toISOString(),
    entityName: issuingEntity,
    description: `Certificate issued: ${certificateType} to ${recipientName}`,
    details: {
      certificateType,
      recipientName,
      issuingEntity,
      certificateId,
      ...details
    },
    createdBy,
    status: "logged"
  };

  if (EVENT_CONFIGS.certificate_issuance.blockchainAnchor) {
    entry.blockchainHash = generateBlockchainHash(entry);
  }

  autoLogEntries.push(entry);
  return entry;
}

/**
 * Get all log entries
 */
export function getAllLogEntries(): AutoLogEntry[] {
  return [...autoLogEntries].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

/**
 * Get log entries by entity
 */
export function getLogEntriesByEntity(entityId: string): AutoLogEntry[] {
  return autoLogEntries
    .filter(e => e.entityId === entityId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * Get log entries by category
 */
export function getLogEntriesByCategory(category: EventCategory): AutoLogEntry[] {
  return autoLogEntries
    .filter(e => e.category === category)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * Get log entries by event type
 */
export function getLogEntriesByEventType(eventType: AutoLogEventType): AutoLogEntry[] {
  return autoLogEntries
    .filter(e => e.eventType === eventType)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * Get log entries by date range
 */
export function getLogEntriesByDateRange(startDate: string, endDate: string): AutoLogEntry[] {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  
  return autoLogEntries
    .filter(e => {
      const timestamp = new Date(e.timestamp).getTime();
      return timestamp >= start && timestamp <= end;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * Get log entry by ID
 */
export function getLogEntryById(logId: string): AutoLogEntry | null {
  return autoLogEntries.find(e => e.id === logId) || null;
}

/**
 * Update log entry status
 */
export function updateLogEntryStatus(
  logId: string,
  status: AutoLogEntry["status"]
): AutoLogEntry | null {
  const entry = autoLogEntries.find(e => e.id === logId);
  if (entry) {
    entry.status = status;
    return entry;
  }
  return null;
}

/**
 * Get event configuration
 */
export function getEventConfig(eventType: AutoLogEventType): EventConfig {
  return EVENT_CONFIGS[eventType];
}

/**
 * Get all event configurations
 */
export function getAllEventConfigs(): Record<AutoLogEventType, EventConfig> {
  return { ...EVENT_CONFIGS };
}

/**
 * Get log statistics
 */
export function getLogStatistics(): {
  totalEntries: number;
  byCategory: Record<string, number>;
  byEventType: Record<string, number>;
  byStatus: Record<string, number>;
  financialSummary: {
    totalInflows: number;
    totalOutflows: number;
    netFlow: number;
  };
} {
  const byCategory: Record<string, number> = {};
  const byEventType: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  let totalInflows = 0;
  let totalOutflows = 0;

  for (const entry of autoLogEntries) {
    byCategory[entry.category] = (byCategory[entry.category] || 0) + 1;
    byEventType[entry.eventType] = (byEventType[entry.eventType] || 0) + 1;
    byStatus[entry.status] = (byStatus[entry.status] || 0) + 1;

    if (entry.financialImpact) {
      if (entry.financialImpact.direction === "inflow") {
        totalInflows += entry.financialImpact.amount;
      } else if (entry.financialImpact.direction === "outflow") {
        totalOutflows += entry.financialImpact.amount;
      }
    }
  }

  return {
    totalEntries: autoLogEntries.length,
    byCategory,
    byEventType,
    byStatus,
    financialSummary: {
      totalInflows,
      totalOutflows,
      netFlow: totalInflows - totalOutflows
    }
  };
}

/**
 * Clear all log entries (for testing)
 */
export function clearAllLogEntries(): void {
  autoLogEntries.length = 0;
}
