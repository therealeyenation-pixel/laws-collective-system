import { describe, it, expect } from 'vitest';
import {
  generateGenesisRIN,
  isValidGenesisRIN,
  initializeGenesisCeremony,
  getCurrentStep,
  getStepProgress,
  completeStatementOfPurpose,
  completeTrustDeclaration,
  completeHeirDesignations,
  completeFlameLighting,
  generateGenesisDeclaration,
  validateCeremonyCompletion,
  getCeremonySummary
} from './services/genesis-ceremony';

describe('Genesis Ceremony Service', () => {
  describe('generateGenesisRIN', () => {
    it('should generate RIN with correct format', () => {
      expect(generateGenesisRIN(1)).toBe('RIN-GEN-001');
      expect(generateGenesisRIN(42)).toBe('RIN-GEN-042');
      expect(generateGenesisRIN(999)).toBe('RIN-GEN-999');
    });
  });

  describe('isValidGenesisRIN', () => {
    it('should validate correct Genesis RIN format', () => {
      expect(isValidGenesisRIN('RIN-GEN-001')).toBe(true);
      expect(isValidGenesisRIN('RIN-GEN-999')).toBe(true);
    });

    it('should reject invalid RIN formats', () => {
      expect(isValidGenesisRIN('RIN-001')).toBe(false);
      expect(isValidGenesisRIN('GEN-001')).toBe(false);
      expect(isValidGenesisRIN('RIN-GEN-1')).toBe(false);
      expect(isValidGenesisRIN('RIN-GEN-ABCD')).toBe(false);
    });
  });

  describe('initializeGenesisCeremony', () => {
    it('should create empty ceremony with house info', () => {
      const ceremony = initializeGenesisCeremony('house-1', 'John Doe', 'House of Doe');
      
      expect(ceremony.houseId).toBe('house-1');
      expect(ceremony.ownerName).toBe('John Doe');
      expect(ceremony.houseName).toBe('House of Doe');
      expect(ceremony.statementOfPurpose).toBe('');
      expect(ceremony.trustDeclaration.confirmed).toBe(false);
      expect(ceremony.heirDesignations).toHaveLength(0);
      expect(ceremony.flameLighting.lit).toBe(false);
    });
  });

  describe('getCurrentStep', () => {
    it('should return purpose for new ceremony', () => {
      const ceremony = initializeGenesisCeremony('house-1', 'John', 'House');
      expect(getCurrentStep(ceremony)).toBe('purpose');
    });

    it('should return declaration after purpose complete', () => {
      let ceremony = initializeGenesisCeremony('house-1', 'John', 'House');
      ceremony = completeStatementOfPurpose(ceremony, 'A'.repeat(100));
      expect(getCurrentStep(ceremony)).toBe('declaration');
    });
  });

  describe('getStepProgress', () => {
    it('should return 0 for new ceremony', () => {
      const ceremony = initializeGenesisCeremony('house-1', 'John', 'House');
      expect(getStepProgress(ceremony)).toBe(0);
    });

    it('should return 25 after purpose complete', () => {
      let ceremony = initializeGenesisCeremony('house-1', 'John', 'House');
      ceremony = completeStatementOfPurpose(ceremony, 'A'.repeat(100));
      expect(getStepProgress(ceremony)).toBe(25);
    });
  });

  describe('completeStatementOfPurpose', () => {
    it('should set statement of purpose', () => {
      let ceremony = initializeGenesisCeremony('house-1', 'John', 'House');
      const statement = 'Our purpose is to build generational wealth and preserve our family legacy for 100 years and beyond.';
      ceremony = completeStatementOfPurpose(ceremony, statement);
      expect(ceremony.statementOfPurpose).toBe(statement);
    });

    it('should reject statement under 50 characters', () => {
      const ceremony = initializeGenesisCeremony('house-1', 'John', 'House');
      expect(() => completeStatementOfPurpose(ceremony, 'Too short')).toThrow('at least 50 characters');
    });

    it('should reject statement over 2000 characters', () => {
      const ceremony = initializeGenesisCeremony('house-1', 'John', 'House');
      expect(() => completeStatementOfPurpose(ceremony, 'A'.repeat(2001))).toThrow('not exceed 2000 characters');
    });
  });

  describe('completeTrustDeclaration', () => {
    it('should confirm trust declaration', () => {
      let ceremony = initializeGenesisCeremony('house-1', 'John Doe', 'House of Doe');
      ceremony = completeStatementOfPurpose(ceremony, 'A'.repeat(100));
      ceremony = completeTrustDeclaration(ceremony, '');
      
      expect(ceremony.trustDeclaration.confirmed).toBe(true);
      expect(ceremony.trustDeclaration.timestamp).toBeTruthy();
      expect(ceremony.trustDeclaration.declarationText).toContain('John Doe');
      expect(ceremony.trustDeclaration.declarationText).toContain('House of Doe');
    });

    it('should require statement of purpose first', () => {
      const ceremony = initializeGenesisCeremony('house-1', 'John', 'House');
      expect(() => completeTrustDeclaration(ceremony, '')).toThrow('Must complete Statement of Purpose');
    });
  });

  describe('completeHeirDesignations', () => {
    it('should set heir designations', () => {
      let ceremony = initializeGenesisCeremony('house-1', 'John', 'House');
      ceremony = completeStatementOfPurpose(ceremony, 'A'.repeat(100));
      ceremony = completeTrustDeclaration(ceremony, '');
      
      const heirs = [
        { name: 'Jane Doe', relationship: 'Spouse', designation: 'primary' as const, share: 50 },
        { name: 'John Jr', relationship: 'Child', designation: 'primary' as const, share: 50 }
      ];
      
      ceremony = completeHeirDesignations(ceremony, heirs);
      expect(ceremony.heirDesignations).toHaveLength(2);
    });

    it('should require trust declaration first', () => {
      let ceremony = initializeGenesisCeremony('house-1', 'John', 'House');
      ceremony = completeStatementOfPurpose(ceremony, 'A'.repeat(100));
      
      expect(() => completeHeirDesignations(ceremony, [])).toThrow('Must complete Trust Declaration');
    });

    it('should require at least one heir', () => {
      let ceremony = initializeGenesisCeremony('house-1', 'John', 'House');
      ceremony = completeStatementOfPurpose(ceremony, 'A'.repeat(100));
      ceremony = completeTrustDeclaration(ceremony, '');
      
      expect(() => completeHeirDesignations(ceremony, [])).toThrow('At least one heir');
    });

    it('should require primary heirs to total 100%', () => {
      let ceremony = initializeGenesisCeremony('house-1', 'John', 'House');
      ceremony = completeStatementOfPurpose(ceremony, 'A'.repeat(100));
      ceremony = completeTrustDeclaration(ceremony, '');
      
      const heirs = [
        { name: 'Jane', relationship: 'Spouse', designation: 'primary' as const, share: 40 }
      ];
      
      expect(() => completeHeirDesignations(ceremony, heirs)).toThrow('must total 100%');
    });
  });

  describe('completeFlameLighting', () => {
    it('should complete flame lighting with witnesses', () => {
      let ceremony = initializeGenesisCeremony('house-1', 'John', 'House');
      ceremony = completeStatementOfPurpose(ceremony, 'A'.repeat(100));
      ceremony = completeTrustDeclaration(ceremony, '');
      ceremony = completeHeirDesignations(ceremony, [
        { name: 'Jane', relationship: 'Spouse', designation: 'primary' as const, share: 100 }
      ]);
      
      ceremony = completeFlameLighting(ceremony, ['Witness One', 'Witness Two']);
      
      expect(ceremony.flameLighting.lit).toBe(true);
      expect(ceremony.flameLighting.timestamp).toBeTruthy();
      expect(ceremony.flameLighting.witnessNames).toHaveLength(2);
      expect(ceremony.genesisHash).toBeTruthy();
      expect(ceremony.completedAt).toBeTruthy();
    });

    it('should require at least one witness', () => {
      let ceremony = initializeGenesisCeremony('house-1', 'John', 'House');
      ceremony = completeStatementOfPurpose(ceremony, 'A'.repeat(100));
      ceremony = completeTrustDeclaration(ceremony, '');
      ceremony = completeHeirDesignations(ceremony, [
        { name: 'Jane', relationship: 'Spouse', designation: 'primary' as const, share: 100 }
      ]);
      
      expect(() => completeFlameLighting(ceremony, [])).toThrow('At least one witness');
    });
  });

  describe('generateGenesisDeclaration', () => {
    it('should generate complete declaration document', () => {
      let ceremony = initializeGenesisCeremony('house-1', 'John Doe', 'House of Doe');
      ceremony = completeStatementOfPurpose(ceremony, 'Our purpose is to build generational wealth and preserve our family legacy for 100 years and beyond.');
      ceremony = completeTrustDeclaration(ceremony, '');
      ceremony = completeHeirDesignations(ceremony, [
        { name: 'Jane Doe', relationship: 'Spouse', designation: 'primary' as const, share: 100 }
      ]);
      ceremony = completeFlameLighting(ceremony, ['Witness One']);
      
      const declaration = generateGenesisDeclaration(ceremony, 'RIN-GEN-001');
      
      expect(declaration.documentId).toContain('GEN-DOC-');
      expect(declaration.houseId).toBe('house-1');
      expect(declaration.rin).toBe('RIN-GEN-001');
      expect(declaration.title).toContain('House of Doe');
      expect(declaration.content).toContain('GENESIS DECLARATION');
      expect(declaration.content).toContain('ARTICLE I: STATEMENT OF PURPOSE');
      expect(declaration.content).toContain('ARTICLE II: TRUST DECLARATION');
      expect(declaration.content).toContain('ARTICLE III: HEIR DESIGNATIONS');
      expect(declaration.content).toContain('ARTICLE IV: FLAME LIGHTING CERTIFICATE');
      expect(declaration.content).toContain('ARTICLE V: SIGNATURES');
      expect(declaration.genesisHash).toBeTruthy();
    });

    it('should require complete ceremony', () => {
      const ceremony = initializeGenesisCeremony('house-1', 'John', 'House');
      expect(() => generateGenesisDeclaration(ceremony, 'RIN-GEN-001')).toThrow('must be complete');
    });
  });

  describe('validateCeremonyCompletion', () => {
    it('should return valid for complete ceremony', () => {
      let ceremony = initializeGenesisCeremony('house-1', 'John', 'House');
      ceremony = completeStatementOfPurpose(ceremony, 'A'.repeat(100));
      ceremony = completeTrustDeclaration(ceremony, '');
      ceremony = completeHeirDesignations(ceremony, [
        { name: 'Jane', relationship: 'Spouse', designation: 'primary' as const, share: 100 }
      ]);
      ceremony = completeFlameLighting(ceremony, ['Witness']);
      
      const result = validateCeremonyCompletion(ceremony);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for incomplete ceremony', () => {
      const ceremony = initializeGenesisCeremony('house-1', 'John', 'House');
      const result = validateCeremonyCompletion(ceremony);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('getCeremonySummary', () => {
    it('should return summary for new ceremony', () => {
      const ceremony = initializeGenesisCeremony('house-1', 'John Doe', 'House of Doe');
      const summary = getCeremonySummary(ceremony);
      
      expect(summary.houseName).toBe('House of Doe');
      expect(summary.ownerName).toBe('John Doe');
      expect(summary.currentStep).toBe('purpose');
      expect(summary.progress).toBe(0);
      expect(summary.completedSteps).toHaveLength(0);
      expect(summary.pendingSteps).toHaveLength(4);
      expect(summary.isComplete).toBe(false);
    });

    it('should return summary for complete ceremony', () => {
      let ceremony = initializeGenesisCeremony('house-1', 'John', 'House');
      ceremony = completeStatementOfPurpose(ceremony, 'A'.repeat(100));
      ceremony = completeTrustDeclaration(ceremony, '');
      ceremony = completeHeirDesignations(ceremony, [
        { name: 'Jane', relationship: 'Spouse', designation: 'primary' as const, share: 100 }
      ]);
      ceremony = completeFlameLighting(ceremony, ['Witness']);
      
      const summary = getCeremonySummary(ceremony);
      
      expect(summary.currentStep).toBe('complete');
      expect(summary.progress).toBe(100);
      expect(summary.completedSteps).toHaveLength(4);
      expect(summary.pendingSteps).toHaveLength(0);
      expect(summary.isComplete).toBe(true);
      expect(summary.heirCount).toBe(1);
      expect(summary.witnessCount).toBe(1);
    });
  });
});
