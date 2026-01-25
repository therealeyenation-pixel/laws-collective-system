/**
 * S.W.A.L. Tokenomics System Tests
 * Tests for the Journey to Sovereignty token system
 */

import { describe, it, expect } from 'vitest';

// Import the S.W.A.L. modules with correct exports
import {
  SWAL_PHASES,
  SWAL_TOTAL_SUPPLY,
  SWAL_PHASE_ORDER,
  SWAL_RESERVE_POOL,
  SWAL_PUBLIC_SUPPLY,
  SWALPhase,
  calculateTokenValue,
  calculateDiscountedPrice,
  canUnlockPhase,
  getNextPhase,
  calculatePortfolioValue,
  determineNFTRarity,
  generateBlockchainHash,
  generateNFTMetadata,
  ROYALTY_CONFIG,
  calculateRoyalties,
  MEMBERSHIP_BENEFITS,
  NFT_RARITY_DISTRIBUTION,
} from '../client/src/lib/laws-quest/swal-tokenomics';

import {
  SWALUnlockEngine,
  initializeSWALSystem,
} from '../client/src/lib/laws-quest/swal-unlock-engine';

import {
  NFT_COLLECTIONS,
  generateNFTTraits,
  calculateTraitRarityScore,
  getCollectionByPhase,
  generateNFTDisplayData,
} from '../client/src/lib/laws-quest/swal-nft-collections';

describe('S.W.A.L. Tokenomics', () => {
  describe('Token Supply', () => {
    it('should have correct total supply of 10,000 tokens', () => {
      expect(SWAL_TOTAL_SUPPLY).toBe(10000);
    });

    it('should have correct reserve and public supply', () => {
      expect(SWAL_RESERVE_POOL).toBe(2500);
      expect(SWAL_PUBLIC_SUPPLY).toBe(7500);
      expect(SWAL_RESERVE_POOL + SWAL_PUBLIC_SUPPLY).toBe(SWAL_TOTAL_SUPPLY);
    });

    it('should have 5 phases in correct order', () => {
      expect(SWAL_PHASE_ORDER).toEqual(['self', 'water', 'air', 'land', 'sovereignty']);
      expect(SWAL_PHASE_ORDER.length).toBe(5);
    });

    it('should have correct supply distribution across phases', () => {
      const totalPhaseSupply = Object.values(SWAL_PHASES).reduce(
        (sum, phase) => sum + phase.totalSupply,
        0
      );
      // 2500 + 2000 + 1500 + 1000 + 500 = 7500 (public supply)
      expect(totalPhaseSupply).toBe(SWAL_PUBLIC_SUPPLY);
    });

    it('should have decreasing supply per phase (increasing scarcity)', () => {
      const supplies = SWAL_PHASE_ORDER.map(id => SWAL_PHASES[id].totalSupply);
      // SELF: 2500, WATER: 2000, AIR: 1500, LAND: 1000, SOVEREIGNTY: 500
      for (let i = 1; i < supplies.length; i++) {
        expect(supplies[i]).toBeLessThan(supplies[i - 1]);
      }
    });
  });

  describe('Token Pricing', () => {
    it('should have increasing base prices per phase', () => {
      const prices = SWAL_PHASE_ORDER.map(id => SWAL_PHASES[id].basePrice);
      // $10, $25, $50, $100, $250
      for (let i = 1; i < prices.length; i++) {
        expect(prices[i]).toBeGreaterThan(prices[i - 1]);
      }
    });

    it('should have correct value multipliers (1x to 16x)', () => {
      expect(SWAL_PHASES.self.valueMultiplier).toBe(1);
      expect(SWAL_PHASES.water.valueMultiplier).toBe(2);
      expect(SWAL_PHASES.air.valueMultiplier).toBe(4);
      expect(SWAL_PHASES.land.valueMultiplier).toBe(8);
      expect(SWAL_PHASES.sovereignty.valueMultiplier).toBe(16);
    });

    it('should calculate membership discounts correctly', () => {
      const basePrice = 100;
      
      // Public: no discount
      expect(calculateDiscountedPrice(basePrice, 'public')).toBe(100);
      
      // Academy: 25% off
      expect(calculateDiscountedPrice(basePrice, 'academy')).toBe(75);
      
      // Employee: 50% off
      expect(calculateDiscountedPrice(basePrice, 'employee')).toBe(50);
    });

    it('should have correct membership benefits defined', () => {
      expect(MEMBERSHIP_BENEFITS.public.tokenDiscount).toBe(0);
      expect(MEMBERSHIP_BENEFITS.academy.tokenDiscount).toBe(0.25);
      expect(MEMBERSHIP_BENEFITS.employee.tokenDiscount).toBe(0.5);
    });

    it('should calculate dynamic token value based on remaining supply', () => {
      const phase: SWALPhase = 'self';
      const phaseConfig = SWAL_PHASES[phase];
      
      // Full supply: base price
      const fullSupplyValue = calculateTokenValue(phase, phaseConfig.totalSupply);
      expect(fullSupplyValue).toBe(phaseConfig.basePrice);
      
      // Half supply: higher value
      const halfSupplyValue = calculateTokenValue(phase, phaseConfig.totalSupply / 2);
      expect(halfSupplyValue).toBeGreaterThan(phaseConfig.basePrice);
      
      // Low supply: even higher value
      const lowSupplyValue = calculateTokenValue(phase, phaseConfig.totalSupply * 0.1);
      expect(lowSupplyValue).toBeGreaterThan(halfSupplyValue);
    });
  });

  describe('Phase Progression', () => {
    it('should have correct phase order indices', () => {
      expect(SWAL_PHASES.self.order).toBe(1);
      expect(SWAL_PHASES.water.order).toBe(2);
      expect(SWAL_PHASES.air.order).toBe(3);
      expect(SWAL_PHASES.land.order).toBe(4);
      expect(SWAL_PHASES.sovereignty.order).toBe(5);
    });

    it('should determine if phase can be unlocked based on progress', () => {
      const progress = {
        currentPhase: 'water' as SWALPhase,
        unlockedPhases: ['self'] as SWALPhase[],
        ownedTokens: [],
        nfts: [],
        totalSpent: 10,
        portfolioValue: 10,
      };
      const userLevel = 15;
      const realmStats = { self: 10, water: 5, air: 0, land: 0, sovereignty: 0 };
      
      // Can unlock water (current phase, previous completed)
      const waterResult = canUnlockPhase('water', progress, userLevel, realmStats);
      expect(waterResult.canUnlock).toBe(true);
      
      // Cannot unlock air yet (water not completed)
      const airResult = canUnlockPhase('air', progress, userLevel, realmStats);
      expect(airResult.canUnlock).toBe(false);
    });

    it('should get next phase correctly', () => {
      expect(getNextPhase('self')).toBe('water');
      expect(getNextPhase('water')).toBe('air');
      expect(getNextPhase('air')).toBe('land');
      expect(getNextPhase('land')).toBe('sovereignty');
      expect(getNextPhase('sovereignty')).toBeNull();
    });
  });

  describe('Portfolio Value', () => {
    it('should calculate portfolio value based on owned tokens', () => {
      const ownedTokens = [
        { 
          id: '1',
          phase: 'self' as SWALPhase,
          tier: 'genesis' as const,
          tokenNumber: 1,
          mintedAt: Date.now(),
          ownerId: 'user1',
          purchasePrice: 10,
          currentValue: 10,
          status: 'owned' as const,
          blockchainHash: 'hash1',
        },
        { 
          id: '2',
          phase: 'water' as SWALPhase,
          tier: 'flow' as const,
          tokenNumber: 1,
          mintedAt: Date.now(),
          ownerId: 'user1',
          purchasePrice: 25,
          currentValue: 50,
          status: 'owned' as const,
          blockchainHash: 'hash2',
        },
      ];
      
      const value = calculatePortfolioValue(ownedTokens);
      
      // Value should be sum of currentValue
      expect(value).toBe(60);
    });
  });

  describe('NFT Rarity', () => {
    it('should have 5 rarity tiers defined', () => {
      expect(Object.keys(NFT_RARITY_DISTRIBUTION)).toHaveLength(5);
      expect(NFT_RARITY_DISTRIBUTION.common).toBeDefined();
      expect(NFT_RARITY_DISTRIBUTION.legendary).toBeDefined();
    });

    it('should determine NFT rarity with membership bonus', () => {
      // Run multiple times to verify it returns valid rarities
      for (let i = 0; i < 10; i++) {
        const publicRarity = determineNFTRarity('public');
        const academyRarity = determineNFTRarity('academy');
        const employeeRarity = determineNFTRarity('employee');
        
        expect(['common', 'uncommon', 'rare', 'epic', 'legendary']).toContain(publicRarity);
        expect(['common', 'uncommon', 'rare', 'epic', 'legendary']).toContain(academyRarity);
        expect(['common', 'uncommon', 'rare', 'epic', 'legendary']).toContain(employeeRarity);
      }
    });
  });

  describe('Blockchain Hash', () => {
    it('should generate unique blockchain hashes', () => {
      const hash1 = generateBlockchainHash({ userId: 'user1', timestamp: 1 });
      const hash2 = generateBlockchainHash({ userId: 'user2', timestamp: 2 });
      
      expect(hash1).not.toBe(hash2);
      expect(hash1.length).toBeGreaterThan(0);
      expect(hash2.length).toBeGreaterThan(0);
    });

    it('should generate hash with correct format', () => {
      const data = { userId: 'user1', timestamp: 12345 };
      const hash = generateBlockchainHash(data);
      
      // Hash should start with 0x and be a valid hex string
      expect(hash.startsWith('0x')).toBe(true);
      expect(hash.length).toBeGreaterThan(10);
    });
  });
});

describe('S.W.A.L. Unlock Engine', () => {
  describe('Engine Creation', () => {
    it('should create unlock engine with initial state', () => {
      const engine = new SWALUnlockEngine();
      const state = engine.getState();
      
      expect(engine).toBeDefined();
      expect(state).toBeDefined();
      expect(state.tokenSupply).toBeDefined();
      expect(state.tokenSupply.self.total).toBe(2500);
    });

    it('should initialize system with correct supply per phase', () => {
      const state = initializeSWALSystem();
      
      expect(state.tokenSupply.self.total).toBe(2500);
      expect(state.tokenSupply.water.total).toBe(2000);
      expect(state.tokenSupply.air.total).toBe(1500);
      expect(state.tokenSupply.land.total).toBe(1000);
      expect(state.tokenSupply.sovereignty.total).toBe(500);
    });
  });

  describe('Token Purchase', () => {
    it('should allow purchasing tokens when supply available', () => {
      const engine = new SWALUnlockEngine();
      
      // Can purchase SELF tokens
      const result = engine.canPurchaseToken('self');
      expect(result.canPurchase).toBe(true);
    });

    it('should track purchases correctly', () => {
      const engine = new SWALUnlockEngine();
      
      const result = engine.purchaseToken('user123', 'self', 'public');
      
      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();
      expect(result.token?.phase).toBe('self');
    });
  });

  describe('Membership Benefits', () => {
    it('should apply academy discount to purchase price', () => {
      const engine = new SWALUnlockEngine();
      
      const publicResult = engine.purchaseToken('user1', 'self', 'public');
      const academyEngine = new SWALUnlockEngine();
      const academyResult = academyEngine.purchaseToken('user2', 'self', 'academy');
      
      // Academy gets 25% discount (with rounding)
      expect(academyResult.token?.purchasePrice).toBeCloseTo(publicResult.token!.purchasePrice * 0.75, 1);
    });

    it('should apply employee discount to purchase price', () => {
      const engine = new SWALUnlockEngine();
      
      const publicResult = engine.purchaseToken('user1', 'self', 'public');
      const employeeEngine = new SWALUnlockEngine();
      const employeeResult = employeeEngine.purchaseToken('user2', 'self', 'employee');
      
      // Employee gets 50% discount (with rounding)
      expect(employeeResult.token?.purchasePrice).toBeCloseTo(publicResult.token!.purchasePrice * 0.5, 1);
    });
  });

  describe('Analytics', () => {
    it('should provide system analytics', () => {
      const engine = new SWALUnlockEngine();
      const analytics = engine.getAnalytics();
      
      expect(analytics).toBeDefined();
      // Check that analytics object has expected structure
      expect(typeof analytics).toBe('object');
    });
  });
});

describe('S.W.A.L. NFT Collections', () => {
  describe('Collection Structure', () => {
    it('should have 5 NFT collections', () => {
      expect(Object.keys(NFT_COLLECTIONS)).toHaveLength(5);
      expect(NFT_COLLECTIONS.the_awakening).toBeDefined();
      expect(NFT_COLLECTIONS.the_healing).toBeDefined();
      expect(NFT_COLLECTIONS.the_enlightenment).toBeDefined();
      expect(NFT_COLLECTIONS.the_foundation).toBeDefined();
      expect(NFT_COLLECTIONS.the_crown).toBeDefined();
    });

    it('should have correct collection names', () => {
      expect(NFT_COLLECTIONS.the_awakening.name).toBe('The Awakening');
      expect(NFT_COLLECTIONS.the_healing.name).toBe('The Healing');
      expect(NFT_COLLECTIONS.the_enlightenment.name).toBe('The Enlightenment');
      expect(NFT_COLLECTIONS.the_foundation.name).toBe('The Foundation');
      expect(NFT_COLLECTIONS.the_crown.name).toBe('The Crown');
    });

    it('should have traits defined for each collection', () => {
      Object.values(NFT_COLLECTIONS).forEach(collection => {
        expect(collection.traits).toBeDefined();
        expect(Array.isArray(collection.traits)).toBe(true);
        expect(collection.traits.length).toBeGreaterThan(0);
      });
    });

    it('should get collection by phase', () => {
      const selfCollection = getCollectionByPhase('self');
      expect(selfCollection.name).toBe('The Awakening');
      
      const sovereigntyCollection = getCollectionByPhase('sovereignty');
      expect(sovereigntyCollection.name).toBe('The Crown');
    });
  });

  describe('NFT Generation', () => {
    it('should generate valid NFT metadata', () => {
      const metadata = generateNFTMetadata(
        'self',
        'user123',
        {
          level: 10,
          realmStats: { self: 5, water: 3, air: 2, land: 1 },
          questsCompleted: 15,
          timePlayed: 3600,
        },
        'rare'
      );
      
      expect(metadata).toBeDefined();
      expect(metadata.name).toContain('Awakening');
      expect(metadata.collection).toBe('the_awakening');
      expect(metadata.attributes).toBeDefined();
      expect(metadata.rarity).toBe('rare');
    });

    it('should generate NFT traits based on rarity', () => {
      const traits = generateNFTTraits('the_awakening', 'common');
      
      expect(traits).toBeDefined();
      expect(Object.keys(traits).length).toBeGreaterThan(0);
    });

    it('should calculate trait rarity score', () => {
      const traits = generateNFTTraits('the_awakening', 'legendary');
      const score = calculateTraitRarityScore('the_awakening', traits);
      
      expect(score).toBeGreaterThan(0);
    });

    it('should generate full NFT display data', () => {
      const displayData = generateNFTDisplayData('the_awakening', 'rare', 42);
      
      expect(displayData.name).toContain('Awakening');
      expect(displayData.name).toContain('#42');
      expect(displayData.description).toBeDefined();
      expect(displayData.traits).toBeDefined();
      expect(displayData.rarityScore).toBeGreaterThan(0);
      expect(displayData.theme).toBeDefined();
      expect(displayData.lore).toBeDefined();
    });
  });

  describe('Royalty Structure', () => {
    it('should have correct royalty percentage', () => {
      expect(ROYALTY_CONFIG.secondaryMarketRoyalty).toBe(0.075); // 7.5%
    });

    it('should have correct royalty split ratios', () => {
      expect(ROYALTY_CONFIG.creatorShare).toBe(0.7);
      expect(ROYALTY_CONFIG.communityShare).toBe(0.2);
      expect(ROYALTY_CONFIG.platformShare).toBe(0.1);
      
      // Total should be 100%
      const totalSplit = ROYALTY_CONFIG.creatorShare + 
                         ROYALTY_CONFIG.communityShare + 
                         ROYALTY_CONFIG.platformShare;
      expect(totalSplit).toBeCloseTo(1, 10);
    });

    it('should calculate royalty split correctly', () => {
      const salePrice = 100;
      const royalties = calculateRoyalties(salePrice);
      
      // 7.5% of $100 = $7.50
      const totalRoyalty = salePrice * ROYALTY_CONFIG.secondaryMarketRoyalty;
      
      // 70% to creator, 20% to community, 10% to platform
      expect(royalties.creatorAmount).toBeCloseTo(totalRoyalty * 0.7, 2);
      expect(royalties.communityAmount).toBeCloseTo(totalRoyalty * 0.2, 2);
      expect(royalties.platformAmount).toBeCloseTo(totalRoyalty * 0.1, 2);
      
      // Total should equal royalty amount
      expect(royalties.totalRoyalty).toBeCloseTo(totalRoyalty, 2);
    });
  });
});
