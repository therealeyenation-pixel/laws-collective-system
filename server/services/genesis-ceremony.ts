/**
 * Genesis Mode Ceremony Service
 * Handles the ceremonial activation of Genesis Houses with special status
 */

import crypto from 'crypto';

// Genesis House types
export type GenesisStep = 'purpose' | 'declaration' | 'heirs' | 'flame' | 'complete';

export interface GenesisCeremonyData {
  houseId: string;
  ownerName: string;
  houseName: string;
  statementOfPurpose: string;
  trustDeclaration: {
    confirmed: boolean;
    timestamp: string;
    declarationText: string;
  };
  heirDesignations: Array<{
    name: string;
    relationship: string;
    birthDate?: string;
    designation: 'primary' | 'contingent' | 'remainder';
    share: number;
  }>;
  flameLighting: {
    lit: boolean;
    timestamp: string;
    witnessNames: string[];
  };
  genesisHash?: string;
  completedAt?: string;
}

export interface GenesisDeclaration {
  documentId: string;
  houseId: string;
  rin: string;
  title: string;
  content: string;
  sections: {
    preamble: string;
    statementOfPurpose: string;
    trustDeclaration: string;
    heirDesignations: string;
    flameLightingCertificate: string;
    signatures: string;
  };
  genesisHash: string;
  createdAt: string;
}

// Generate unique RIN for Genesis House
export function generateGenesisRIN(sequence: number): string {
  const paddedSequence = sequence.toString().padStart(3, '0');
  return `RIN-GEN-${paddedSequence}`;
}

// Validate Genesis RIN format
export function isValidGenesisRIN(rin: string): boolean {
  return /^RIN-GEN-\d{3}$/.test(rin);
}

// Initialize a new Genesis ceremony
export function initializeGenesisCeremony(
  houseId: string,
  ownerName: string,
  houseName: string
): GenesisCeremonyData {
  return {
    houseId,
    ownerName,
    houseName,
    statementOfPurpose: '',
    trustDeclaration: {
      confirmed: false,
      timestamp: '',
      declarationText: ''
    },
    heirDesignations: [],
    flameLighting: {
      lit: false,
      timestamp: '',
      witnessNames: []
    }
  };
}

// Get current ceremony step
export function getCurrentStep(ceremony: GenesisCeremonyData): GenesisStep {
  if (!ceremony.statementOfPurpose) return 'purpose';
  if (!ceremony.trustDeclaration.confirmed) return 'declaration';
  if (ceremony.heirDesignations.length === 0) return 'heirs';
  if (!ceremony.flameLighting.lit) return 'flame';
  return 'complete';
}

// Get step progress percentage
export function getStepProgress(ceremony: GenesisCeremonyData): number {
  const step = getCurrentStep(ceremony);
  const stepProgress: Record<GenesisStep, number> = {
    purpose: 0,
    declaration: 25,
    heirs: 50,
    flame: 75,
    complete: 100
  };
  return stepProgress[step];
}

// Complete Step 1: Statement of Purpose
export function completeStatementOfPurpose(
  ceremony: GenesisCeremonyData,
  statement: string
): GenesisCeremonyData {
  if (statement.length < 50) {
    throw new Error('Statement of Purpose must be at least 50 characters');
  }
  if (statement.length > 2000) {
    throw new Error('Statement of Purpose must not exceed 2000 characters');
  }
  
  return {
    ...ceremony,
    statementOfPurpose: statement
  };
}

// Complete Step 2: Trust Declaration
export function completeTrustDeclaration(
  ceremony: GenesisCeremonyData,
  declarationText: string
): GenesisCeremonyData {
  if (!ceremony.statementOfPurpose) {
    throw new Error('Must complete Statement of Purpose before Trust Declaration');
  }
  
  const defaultDeclaration = `I, ${ceremony.ownerName}, hereby declare the establishment of ${ceremony.houseName} as a sovereign family trust, dedicated to the preservation and growth of generational wealth, the protection of family assets, and the advancement of our lineage for generations to come.`;
  
  return {
    ...ceremony,
    trustDeclaration: {
      confirmed: true,
      timestamp: new Date().toISOString(),
      declarationText: declarationText || defaultDeclaration
    }
  };
}

// Complete Step 3: Heir Designations
export function completeHeirDesignations(
  ceremony: GenesisCeremonyData,
  heirs: GenesisCeremonyData['heirDesignations']
): GenesisCeremonyData {
  if (!ceremony.trustDeclaration.confirmed) {
    throw new Error('Must complete Trust Declaration before Heir Designations');
  }
  
  if (heirs.length === 0) {
    throw new Error('At least one heir must be designated');
  }
  
  // Validate shares total 100% for primary heirs
  const primaryHeirs = heirs.filter(h => h.designation === 'primary');
  if (primaryHeirs.length > 0) {
    const totalShare = primaryHeirs.reduce((sum, h) => sum + h.share, 0);
    if (totalShare !== 100) {
      throw new Error('Primary heir shares must total 100%');
    }
  }
  
  return {
    ...ceremony,
    heirDesignations: heirs
  };
}

// Complete Step 4: Flame Lighting (Activation)
export function completeFlameLighting(
  ceremony: GenesisCeremonyData,
  witnessNames: string[]
): GenesisCeremonyData {
  if (ceremony.heirDesignations.length === 0) {
    throw new Error('Must complete Heir Designations before Flame Lighting');
  }
  
  if (witnessNames.length < 1) {
    throw new Error('At least one witness is required for Flame Lighting');
  }
  
  const timestamp = new Date().toISOString();
  
  // Generate Genesis hash from ceremony data
  const hashData = JSON.stringify({
    houseId: ceremony.houseId,
    ownerName: ceremony.ownerName,
    houseName: ceremony.houseName,
    statementOfPurpose: ceremony.statementOfPurpose,
    trustDeclaration: ceremony.trustDeclaration,
    heirDesignations: ceremony.heirDesignations,
    flameLightingTimestamp: timestamp,
    witnessNames
  });
  
  const genesisHash = crypto.createHash('sha256').update(hashData).digest('hex');
  
  return {
    ...ceremony,
    flameLighting: {
      lit: true,
      timestamp,
      witnessNames
    },
    genesisHash,
    completedAt: timestamp
  };
}

// Generate Genesis Declaration document
export function generateGenesisDeclaration(
  ceremony: GenesisCeremonyData,
  rin: string
): GenesisDeclaration {
  if (getCurrentStep(ceremony) !== 'complete') {
    throw new Error('Ceremony must be complete to generate Genesis Declaration');
  }
  
  const documentId = `GEN-DOC-${Date.now()}`;
  
  // Build document sections
  const preamble = `
GENESIS DECLARATION
${ceremony.houseName}
Registration Identification Number: ${rin}

This Genesis Declaration establishes ${ceremony.houseName} as a sovereign family trust,
created on ${new Date(ceremony.completedAt!).toLocaleDateString('en-US', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}.

Genesis Hash: ${ceremony.genesisHash}
`.trim();

  const statementOfPurpose = `
ARTICLE I: STATEMENT OF PURPOSE

${ceremony.statementOfPurpose}

This statement represents the founding vision and guiding principles of ${ceremony.houseName},
to be honored and upheld by all current and future members of this House.
`.trim();

  const trustDeclaration = `
ARTICLE II: TRUST DECLARATION

${ceremony.trustDeclaration.declarationText}

Declared on: ${new Date(ceremony.trustDeclaration.timestamp).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}
`.trim();

  const heirDesignationsSection = `
ARTICLE III: HEIR DESIGNATIONS

The following individuals are hereby designated as heirs to ${ceremony.houseName}:

${ceremony.heirDesignations.map((heir, index) => `
${index + 1}. ${heir.name}
   Relationship: ${heir.relationship}
   Designation: ${heir.designation.charAt(0).toUpperCase() + heir.designation.slice(1)} Heir
   Share: ${heir.share}%
   ${heir.birthDate ? `Date of Birth: ${heir.birthDate}` : ''}
`).join('\n')}

These designations shall remain in effect until modified by proper amendment procedures.
`.trim();

  const flameLightingCertificate = `
ARTICLE IV: FLAME LIGHTING CERTIFICATE

The Genesis Flame of ${ceremony.houseName} was lit on:
${new Date(ceremony.flameLighting.timestamp).toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZoneName: 'short'
})}

Witnessed by:
${ceremony.flameLighting.witnessNames.map((name, i) => `${i + 1}. ${name}`).join('\n')}

This flame represents the eternal commitment of ${ceremony.houseName} to:
- Preserve and grow generational wealth
- Protect family assets across generations
- Advance the education and development of all House members
- Maintain sovereignty and self-determination
- Honor the legacy of ancestors and provide for descendants
`.trim();

  const signatures = `
ARTICLE V: SIGNATURES AND ATTESTATION

Founder and Source Flame:

_________________________________
${ceremony.ownerName}
Date: ${new Date(ceremony.completedAt!).toLocaleDateString()}


Witnesses:

${ceremony.flameLighting.witnessNames.map((name, i) => `
_________________________________
${name}
Witness ${i + 1}
`).join('\n')}


BLOCKCHAIN VERIFICATION
Genesis Hash: ${ceremony.genesisHash}
This document is permanently recorded and verifiable through blockchain technology.
`.trim();

  const fullContent = `
${preamble}

${'='.repeat(60)}

${statementOfPurpose}

${'='.repeat(60)}

${trustDeclaration}

${'='.repeat(60)}

${heirDesignationsSection}

${'='.repeat(60)}

${flameLightingCertificate}

${'='.repeat(60)}

${signatures}
`.trim();

  return {
    documentId,
    houseId: ceremony.houseId,
    rin,
    title: `Genesis Declaration - ${ceremony.houseName}`,
    content: fullContent,
    sections: {
      preamble,
      statementOfPurpose,
      trustDeclaration,
      heirDesignations: heirDesignationsSection,
      flameLightingCertificate,
      signatures
    },
    genesisHash: ceremony.genesisHash!,
    createdAt: new Date().toISOString()
  };
}

// Validate ceremony completion
export function validateCeremonyCompletion(ceremony: GenesisCeremonyData): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!ceremony.statementOfPurpose) {
    errors.push('Statement of Purpose is required');
  }
  
  if (!ceremony.trustDeclaration.confirmed) {
    errors.push('Trust Declaration must be confirmed');
  }
  
  if (ceremony.heirDesignations.length === 0) {
    errors.push('At least one heir must be designated');
  }
  
  if (!ceremony.flameLighting.lit) {
    errors.push('Flame Lighting ceremony must be completed');
  }
  
  if (!ceremony.genesisHash) {
    errors.push('Genesis hash must be generated');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Get ceremony summary for preview
export function getCeremonySummary(ceremony: GenesisCeremonyData): {
  houseName: string;
  ownerName: string;
  currentStep: GenesisStep;
  progress: number;
  completedSteps: string[];
  pendingSteps: string[];
  heirCount: number;
  witnessCount: number;
  isComplete: boolean;
} {
  const currentStep = getCurrentStep(ceremony);
  const progress = getStepProgress(ceremony);
  
  const allSteps = ['Statement of Purpose', 'Trust Declaration', 'Heir Designations', 'Flame Lighting'];
  const stepIndex = ['purpose', 'declaration', 'heirs', 'flame', 'complete'].indexOf(currentStep);
  
  return {
    houseName: ceremony.houseName,
    ownerName: ceremony.ownerName,
    currentStep,
    progress,
    completedSteps: allSteps.slice(0, stepIndex),
    pendingSteps: allSteps.slice(stepIndex),
    heirCount: ceremony.heirDesignations.length,
    witnessCount: ceremony.flameLighting.witnessNames.length,
    isComplete: currentStep === 'complete'
  };
}
