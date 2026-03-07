/**
 * Simulator Certificates Service
 * Handles simulator ordering, certificate generation, and blockchain recording
 */

// Official simulator order: Business → Business Plan → Grant → Financial → Trust → Contracts → Blockchain → Operations → Insurance
export const SIMULATOR_ORDER = [
  {
    id: 1,
    key: "business",
    title: "Business Foundations",
    description: "Learn business structures, entity types, and formation basics",
    icon: "Building2",
    route: "/simulators/business",
    certificateType: "business_foundations",
    tokensReward: 500,
    prerequisites: []
  },
  {
    id: 2,
    key: "business-plan",
    title: "Business Plan",
    description: "Create comprehensive business plans with mission, market analysis, and financials",
    icon: "FileText",
    route: "/simulators/business-plan",
    certificateType: "business_plan",
    tokensReward: 750,
    prerequisites: ["business"]
  },
  {
    id: 3,
    key: "grant",
    title: "Grant Writing",
    description: "Master grant research, proposal writing, and funding strategies",
    icon: "Award",
    route: "/simulators/grant",
    certificateType: "grant_writing",
    tokensReward: 750,
    prerequisites: ["business-plan"]
  },
  {
    id: 4,
    key: "financial",
    title: "Financial Management",
    description: "Personal and business financial literacy, budgeting, and planning",
    icon: "DollarSign",
    route: "/simulators/financial",
    certificateType: "financial_management",
    tokensReward: 750,
    prerequisites: ["business"]
  },
  {
    id: 5,
    key: "trust",
    title: "Trust & Estate",
    description: "Learn trust structures, estate planning, and asset protection",
    icon: "Shield",
    route: "/simulators/trust",
    certificateType: "trust_estate",
    tokensReward: 1000,
    prerequisites: ["financial"]
  },
  {
    id: 6,
    key: "contracts",
    title: "Contracts & Legal",
    description: "Contract fundamentals, legal documents, and compliance",
    icon: "Scale",
    route: "/simulators/contracts",
    certificateType: "contracts_legal",
    tokensReward: 750,
    prerequisites: ["business"]
  },
  {
    id: 7,
    key: "blockchain",
    title: "Blockchain & Crypto",
    description: "Cryptocurrency, smart contracts, and decentralized finance",
    icon: "Blocks",
    route: "/simulators/blockchain",
    certificateType: "blockchain_crypto",
    tokensReward: 1000,
    prerequisites: ["financial"]
  },
  {
    id: 8,
    key: "operations",
    title: "Entity Operations",
    description: "Day-to-day business operations, HR, and management",
    icon: "Settings",
    route: "/simulators/operations",
    certificateType: "entity_operations",
    tokensReward: 750,
    prerequisites: ["business"]
  },
  {
    id: 9,
    key: "insurance",
    title: "Insurance Planning",
    description: "Personal and business insurance coverage strategies",
    icon: "Umbrella",
    route: "/simulators/insurance",
    certificateType: "insurance_planning",
    tokensReward: 500,
    prerequisites: ["business", "financial"]
  }
];

export interface SimulatorCertificate {
  id: number;
  userId: number;
  simulatorKey: string;
  certificateType: string;
  title: string;
  description: string;
  issuedAt: Date;
  blockchainHash?: string;
  blockNumber?: number;
  downloadUrl?: string;
}

export interface CertificateGenerationResult {
  success: boolean;
  certificate?: SimulatorCertificate;
  blockchainRecord?: {
    hash: string;
    blockNumber: number;
    timestamp: Date;
  };
  error?: string;
}

/**
 * Get ordered list of simulators
 */
export function getSimulatorOrder() {
  return SIMULATOR_ORDER;
}

/**
 * Get simulator by key
 */
export function getSimulatorByKey(key: string) {
  return SIMULATOR_ORDER.find(s => s.key === key);
}

/**
 * Get simulator by ID
 */
export function getSimulatorById(id: number) {
  return SIMULATOR_ORDER.find(s => s.id === id);
}

/**
 * Check if user has completed prerequisites for a simulator
 */
export function checkPrerequisites(
  simulatorKey: string,
  completedSimulators: string[]
): { canAccess: boolean; missingPrerequisites: string[] } {
  const simulator = getSimulatorByKey(simulatorKey);
  if (!simulator) {
    return { canAccess: false, missingPrerequisites: [] };
  }

  const missing = simulator.prerequisites.filter(
    prereq => !completedSimulators.includes(prereq)
  );

  return {
    canAccess: missing.length === 0,
    missingPrerequisites: missing
  };
}

/**
 * Generate certificate data for a completed simulator
 */
export function generateCertificateData(
  userId: number,
  userName: string,
  simulatorKey: string
): Omit<SimulatorCertificate, 'id' | 'blockchainHash' | 'blockNumber' | 'downloadUrl'> | null {
  const simulator = getSimulatorByKey(simulatorKey);
  if (!simulator) return null;

  return {
    userId,
    simulatorKey,
    certificateType: simulator.certificateType,
    title: `${simulator.title} Certificate of Completion`,
    description: `This certifies that ${userName} has successfully completed the ${simulator.title} simulator course and demonstrated proficiency in ${simulator.description.toLowerCase()}.`,
    issuedAt: new Date()
  };
}

/**
 * Generate blockchain record data for certificate
 */
export function generateBlockchainRecordData(certificate: {
  userId: number;
  certificateType: string;
  title: string;
  issuedAt: Date;
}) {
  const dataString = JSON.stringify({
    type: "CERTIFICATE_ISSUANCE",
    userId: certificate.userId,
    certificateType: certificate.certificateType,
    title: certificate.title,
    issuedAt: certificate.issuedAt.toISOString(),
    timestamp: Date.now()
  });

  // Generate hash (in production, use proper crypto)
  const hash = `0x${Buffer.from(dataString).toString('hex').slice(0, 64)}`;

  return {
    hash,
    data: dataString
  };
}

/**
 * Get certificate display information
 */
export function getCertificateDisplayInfo(certificateType: string) {
  const simulator = SIMULATOR_ORDER.find(s => s.certificateType === certificateType);
  if (!simulator) return null;

  return {
    title: simulator.title,
    icon: simulator.icon,
    color: getCertificateColor(certificateType),
    badgeLevel: getCertificateBadgeLevel(certificateType)
  };
}

function getCertificateColor(certificateType: string): string {
  const colors: Record<string, string> = {
    business_foundations: "#3B82F6", // blue
    business_plan: "#8B5CF6", // purple
    grant_writing: "#10B981", // green
    financial_management: "#F59E0B", // amber
    trust_estate: "#6366F1", // indigo
    contracts_legal: "#EF4444", // red
    blockchain_crypto: "#14B8A6", // teal
    entity_operations: "#EC4899", // pink
    insurance_planning: "#06B6D4" // cyan
  };
  return colors[certificateType] || "#6B7280";
}

function getCertificateBadgeLevel(certificateType: string): string {
  const levels: Record<string, string> = {
    business_foundations: "Foundation",
    business_plan: "Practitioner",
    grant_writing: "Specialist",
    financial_management: "Practitioner",
    trust_estate: "Advanced",
    contracts_legal: "Specialist",
    blockchain_crypto: "Advanced",
    entity_operations: "Practitioner",
    insurance_planning: "Foundation"
  };
  return levels[certificateType] || "Standard";
}

/**
 * Calculate user's overall simulator progress
 */
export function calculateSimulatorProgress(completedSimulators: string[]) {
  const totalSimulators = SIMULATOR_ORDER.length;
  const completedCount = completedSimulators.length;
  const progressPercent = Math.round((completedCount / totalSimulators) * 100);

  const nextSimulator = SIMULATOR_ORDER.find(s => {
    if (completedSimulators.includes(s.key)) return false;
    const { canAccess } = checkPrerequisites(s.key, completedSimulators);
    return canAccess;
  });

  const totalTokensEarned = SIMULATOR_ORDER
    .filter(s => completedSimulators.includes(s.key))
    .reduce((sum, s) => sum + s.tokensReward, 0);

  const totalTokensPossible = SIMULATOR_ORDER.reduce((sum, s) => sum + s.tokensReward, 0);

  return {
    completedCount,
    totalSimulators,
    progressPercent,
    nextSimulator: nextSimulator ? {
      key: nextSimulator.key,
      title: nextSimulator.title,
      route: nextSimulator.route
    } : null,
    isComplete: completedCount === totalSimulators,
    totalTokensEarned,
    totalTokensPossible,
    simulators: SIMULATOR_ORDER.map(s => ({
      ...s,
      completed: completedSimulators.includes(s.key),
      canAccess: checkPrerequisites(s.key, completedSimulators).canAccess
    }))
  };
}

/**
 * Get certificate template HTML for PDF generation
 */
export function getCertificateTemplate(
  userName: string,
  certificateTitle: string,
  simulatorTitle: string,
  issuedDate: Date,
  blockchainHash?: string
): string {
  const formattedDate = issuedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Georgia', serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: #f5f5f5;
      padding: 40px;
      text-align: center;
    }
    .certificate {
      border: 4px double #d4af37;
      padding: 60px;
      max-width: 800px;
      margin: 0 auto;
      background: rgba(255,255,255,0.05);
    }
    .header {
      font-size: 14px;
      letter-spacing: 3px;
      color: #d4af37;
      margin-bottom: 20px;
    }
    .title {
      font-size: 36px;
      font-weight: bold;
      color: #d4af37;
      margin: 20px 0;
    }
    .subtitle {
      font-size: 18px;
      margin: 20px 0;
    }
    .recipient {
      font-size: 32px;
      font-style: italic;
      color: #fff;
      margin: 30px 0;
      border-bottom: 2px solid #d4af37;
      padding-bottom: 10px;
      display: inline-block;
    }
    .description {
      font-size: 16px;
      line-height: 1.6;
      margin: 30px 0;
    }
    .date {
      font-size: 14px;
      margin-top: 40px;
    }
    .blockchain {
      font-size: 10px;
      color: #888;
      margin-top: 20px;
      word-break: break-all;
    }
    .seal {
      margin-top: 30px;
      font-size: 24px;
      color: #d4af37;
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="header">LUVONPURPOSE AUTONOMOUS WEALTH SYSTEM</div>
    <div class="title">Certificate of Completion</div>
    <div class="subtitle">${simulatorTitle} Simulator</div>
    <div class="subtitle">This is to certify that</div>
    <div class="recipient">${userName}</div>
    <div class="description">
      has successfully completed all requirements of the ${simulatorTitle} Simulator
      and has demonstrated proficiency in the knowledge and skills required
      for this certification.
    </div>
    <div class="date">Issued on ${formattedDate}</div>
    ${blockchainHash ? `<div class="blockchain">Blockchain Verified: ${blockchainHash}</div>` : ''}
    <div class="seal">🏛️ The The L.A.W.S. Collective</div>
  </div>
</body>
</html>
  `;
}
