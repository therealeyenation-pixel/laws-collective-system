/**
 * S.W.A.L. Unlock Engine
 * Manages phased realm unlocks, token purchases, and NFT generation
 */

import {
  SWALPhase,
  SWALToken,
  SWALPurchase,
  SWALNFT,
  SWALUnlock,
  SWALUserProgress,
  SWAL_PHASES,
  SWAL_PHASE_ORDER,
  SWAL_TOTAL_SUPPLY,
  calculateTokenValue,
  calculateDiscountedPrice,
  determineNFTRarity,
  generateBlockchainHash,
  canUnlockPhase,
  generateNFTMetadata,
  getPhaseStats,
} from './swal-tokenomics';

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

export interface SWALSystemState {
  // Token supply tracking per phase
  tokenSupply: Record<SWALPhase, {
    total: number;
    sold: number;
    reserved: number;
    burned: number;
  }>;
  
  // All minted tokens
  tokens: SWALToken[];
  
  // All purchases
  purchases: SWALPurchase[];
  
  // All minted NFTs
  nfts: SWALNFT[];
  
  // All unlocks
  unlocks: SWALUnlock[];
  
  // System metrics
  metrics: {
    totalRevenue: number;
    totalTokensSold: number;
    totalNFTsMinted: number;
    averageTokenPrice: number;
    currentPhaseActive: SWALPhase;
  };
}

/**
 * Initialize system state
 */
export function initializeSWALSystem(): SWALSystemState {
  const tokenSupply: SWALSystemState['tokenSupply'] = {} as SWALSystemState['tokenSupply'];
  
  for (const phase of SWAL_PHASE_ORDER) {
    const config = SWAL_PHASES[phase];
    tokenSupply[phase] = {
      total: config.totalSupply,
      sold: 0,
      reserved: phase === 'self' ? 625 : // 25% of 2500 reserved for academy/employee
               phase === 'water' ? 500 :
               phase === 'air' ? 375 :
               phase === 'land' ? 250 :
               125, // sovereignty
      burned: 0,
    };
  }
  
  return {
    tokenSupply,
    tokens: [],
    purchases: [],
    nfts: [],
    unlocks: [],
    metrics: {
      totalRevenue: 0,
      totalTokensSold: 0,
      totalNFTsMinted: 0,
      averageTokenPrice: 0,
      currentPhaseActive: 'self',
    },
  };
}

// ============================================================================
// TOKEN OPERATIONS
// ============================================================================

/**
 * Purchase a token for a specific phase
 */
export function purchaseToken(
  state: SWALSystemState,
  userId: string,
  phase: SWALPhase,
  membershipType: 'public' | 'academy' | 'employee'
): { success: boolean; token?: SWALToken; purchase?: SWALPurchase; error?: string } {
  const supply = state.tokenSupply[phase];
  const config = SWAL_PHASES[phase];
  
  // Check availability
  const available = supply.total - supply.sold - supply.reserved;
  if (available <= 0) {
    return { success: false, error: `No tokens available for ${config.name} phase` };
  }
  
  // Calculate price
  const basePrice = calculateTokenValue(phase, available);
  const finalPrice = calculateDiscountedPrice(basePrice, membershipType);
  
  // Create token
  const tokenNumber = supply.sold + 1;
  const token: SWALToken = {
    id: `swal-${phase}-${tokenNumber}`,
    phase,
    tier: config.tier,
    tokenNumber,
    mintedAt: Date.now(),
    ownerId: userId,
    purchasePrice: finalPrice,
    currentValue: basePrice,
    status: 'owned',
    blockchainHash: generateBlockchainHash({
      type: 'token_mint',
      phase,
      tokenNumber,
      userId,
      price: finalPrice,
    }),
  };
  
  // Create purchase record
  const purchase: SWALPurchase = {
    id: `purchase-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    tokenId: token.id,
    phase,
    purchasePrice: finalPrice,
    purchasedAt: Date.now(),
    transactionHash: generateBlockchainHash({
      type: 'purchase',
      tokenId: token.id,
      userId,
      amount: finalPrice,
    }),
  };
  
  // Update state
  state.tokens.push(token);
  state.purchases.push(purchase);
  state.tokenSupply[phase].sold++;
  state.metrics.totalTokensSold++;
  state.metrics.totalRevenue += finalPrice;
  state.metrics.averageTokenPrice = state.metrics.totalRevenue / state.metrics.totalTokensSold;
  
  return { success: true, token, purchase };
}

/**
 * Earn a token (for Academy/Employee members)
 */
export function earnToken(
  state: SWALSystemState,
  userId: string,
  phase: SWALPhase,
  reason: 'academy_progress' | 'employee_benefit' | 'achievement'
): { success: boolean; token?: SWALToken; error?: string } {
  const supply = state.tokenSupply[phase];
  const config = SWAL_PHASES[phase];
  
  // Check reserved availability
  if (supply.reserved <= 0) {
    return { success: false, error: `No reserved tokens available for ${config.name} phase` };
  }
  
  // Create token (earned tokens have 0 purchase price)
  const tokenNumber = supply.sold + supply.total - supply.reserved + 1;
  const token: SWALToken = {
    id: `swal-${phase}-earned-${tokenNumber}`,
    phase,
    tier: config.tier,
    tokenNumber,
    mintedAt: Date.now(),
    ownerId: userId,
    purchasePrice: 0,
    currentValue: calculateTokenValue(phase, supply.total - supply.sold),
    status: 'owned',
    blockchainHash: generateBlockchainHash({
      type: 'token_earned',
      phase,
      tokenNumber,
      userId,
      reason,
    }),
  };
  
  // Update state
  state.tokens.push(token);
  state.tokenSupply[phase].reserved--;
  
  return { success: true, token };
}

/**
 * Burn a token to unlock a phase (generates NFT)
 */
export function burnTokenForUnlock(
  state: SWALSystemState,
  userId: string,
  tokenId: string,
  completionData: {
    level: number;
    realmStats: Record<string, number>;
    questsCompleted: number;
    timePlayed: number;
  },
  membershipType: 'public' | 'academy' | 'employee'
): { success: boolean; nft?: SWALNFT; unlock?: SWALUnlock; error?: string } {
  // Find token
  const tokenIndex = state.tokens.findIndex(t => t.id === tokenId && t.ownerId === userId);
  if (tokenIndex === -1) {
    return { success: false, error: 'Token not found or not owned by user' };
  }
  
  const token = state.tokens[tokenIndex];
  if (token.status !== 'owned') {
    return { success: false, error: 'Token is not available for burning' };
  }
  
  const phase = token.phase;
  const config = SWAL_PHASES[phase];
  
  // Determine NFT rarity
  const rarity = determineNFTRarity(membershipType);
  
  // Generate NFT
  const nftData = generateNFTMetadata(phase, userId, completionData, rarity);
  const nft: SWALNFT = {
    ...nftData,
    id: `nft-${phase}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    mintedAt: Date.now(),
    blockchainHash: generateBlockchainHash({
      type: 'nft_mint',
      phase,
      userId,
      rarity,
      completionData,
    }),
    tokenId,
  };
  
  // Create unlock record
  const unlock: SWALUnlock = {
    id: `unlock-${phase}-${userId}-${Date.now()}`,
    userId,
    phase,
    unlockedAt: Date.now(),
    tokenId,
    nftId: nft.id,
    blockchainHash: generateBlockchainHash({
      type: 'phase_unlock',
      phase,
      userId,
      tokenId,
      nftId: nft.id,
    }),
  };
  
  // Update token status
  state.tokens[tokenIndex].status = 'burned';
  state.tokenSupply[phase].burned++;
  
  // Add NFT and unlock
  state.nfts.push(nft);
  state.unlocks.push(unlock);
  state.metrics.totalNFTsMinted++;
  
  return { success: true, nft, unlock };
}

// ============================================================================
// USER PROGRESS
// ============================================================================

/**
 * Get user's S.W.A.L. progress
 */
export function getUserProgress(
  state: SWALSystemState,
  userId: string,
  membershipType: 'public' | 'academy' | 'employee'
): SWALUserProgress {
  const ownedTokens = state.tokens.filter(t => t.ownerId === userId && t.status === 'owned');
  const earnedNFTs = state.nfts.filter(n => n.userId === userId);
  const userUnlocks = state.unlocks.filter(u => u.userId === userId);
  const unlockedPhases = userUnlocks.map(u => u.phase);
  
  // Determine current phase (highest unlocked or first)
  let currentPhase: SWALPhase = 'self';
  for (const phase of SWAL_PHASE_ORDER) {
    if (unlockedPhases.includes(phase)) {
      const nextPhaseIndex = SWAL_PHASE_ORDER.indexOf(phase) + 1;
      if (nextPhaseIndex < SWAL_PHASE_ORDER.length) {
        currentPhase = SWAL_PHASE_ORDER[nextPhaseIndex];
      } else {
        currentPhase = 'sovereignty'; // Completed all
      }
    }
  }
  
  const totalInvested = state.purchases
    .filter(p => p.userId === userId)
    .reduce((sum, p) => sum + p.purchasePrice, 0);
  
  const portfolioValue = ownedTokens.reduce((sum, t) => sum + t.currentValue, 0);
  
  return {
    userId,
    currentPhase,
    unlockedPhases,
    ownedTokens,
    earnedNFTs,
    totalInvested,
    portfolioValue,
    membershipType,
  };
}

/**
 * Check if user can purchase a token for a phase
 */
export function canPurchaseToken(
  state: SWALSystemState,
  phase: SWALPhase
): { canPurchase: boolean; price: number; remaining: number; reason?: string } {
  const supply = state.tokenSupply[phase];
  const available = supply.total - supply.sold - supply.reserved;
  const price = calculateTokenValue(phase, available);
  
  if (available <= 0) {
    return { canPurchase: false, price, remaining: 0, reason: 'Sold out' };
  }
  
  return { canPurchase: true, price, remaining: available };
}

// ============================================================================
// ANALYTICS
// ============================================================================

/**
 * Get system-wide analytics
 */
export function getSystemAnalytics(state: SWALSystemState): {
  phases: Record<SWALPhase, ReturnType<typeof getPhaseStats>>;
  totalSupply: number;
  totalSold: number;
  totalBurned: number;
  totalRevenue: number;
  averagePrice: number;
  nftsByCollection: Record<string, number>;
  nftsByRarity: Record<string, number>;
} {
  const phases: Record<SWALPhase, ReturnType<typeof getPhaseStats>> = {} as Record<SWALPhase, ReturnType<typeof getPhaseStats>>;
  
  let totalSold = 0;
  let totalBurned = 0;
  
  for (const phase of SWAL_PHASE_ORDER) {
    const supply = state.tokenSupply[phase];
    phases[phase] = getPhaseStats(phase, supply.sold);
    totalSold += supply.sold;
    totalBurned += supply.burned;
  }
  
  // NFT analytics
  const nftsByCollection: Record<string, number> = {};
  const nftsByRarity: Record<string, number> = {};
  
  for (const nft of state.nfts) {
    nftsByCollection[nft.collection] = (nftsByCollection[nft.collection] || 0) + 1;
    nftsByRarity[nft.rarity] = (nftsByRarity[nft.rarity] || 0) + 1;
  }
  
  return {
    phases,
    totalSupply: SWAL_TOTAL_SUPPLY,
    totalSold,
    totalBurned,
    totalRevenue: state.metrics.totalRevenue,
    averagePrice: state.metrics.averageTokenPrice,
    nftsByCollection,
    nftsByRarity,
  };
}

/**
 * Get price history simulation (for charts)
 */
export function simulatePriceHistory(phase: SWALPhase): Array<{ sold: number; price: number }> {
  const config = SWAL_PHASES[phase];
  const history: Array<{ sold: number; price: number }> = [];
  
  for (let sold = 0; sold <= config.totalSupply; sold += Math.ceil(config.totalSupply / 20)) {
    const remaining = config.totalSupply - sold;
    const price = calculateTokenValue(phase, remaining);
    history.push({ sold, price });
  }
  
  return history;
}

/**
 * Project future token values
 */
export function projectFutureValue(
  phase: SWALPhase,
  currentSold: number,
  projectedSales: number
): { currentPrice: number; projectedPrice: number; appreciation: number } {
  const config = SWAL_PHASES[phase];
  const currentRemaining = config.totalSupply - currentSold;
  const projectedRemaining = Math.max(0, currentRemaining - projectedSales);
  
  const currentPrice = calculateTokenValue(phase, currentRemaining);
  const projectedPrice = calculateTokenValue(phase, projectedRemaining);
  const appreciation = ((projectedPrice - currentPrice) / currentPrice) * 100;
  
  return { currentPrice, projectedPrice, appreciation };
}

// ============================================================================
// EXPORT ENGINE
// ============================================================================

export class SWALUnlockEngine {
  private state: SWALSystemState;
  
  constructor(initialState?: SWALSystemState) {
    this.state = initialState || initializeSWALSystem();
  }
  
  getState(): SWALSystemState {
    return this.state;
  }
  
  purchaseToken(userId: string, phase: SWALPhase, membershipType: 'public' | 'academy' | 'employee') {
    return purchaseToken(this.state, userId, phase, membershipType);
  }
  
  earnToken(userId: string, phase: SWALPhase, reason: 'academy_progress' | 'employee_benefit' | 'achievement') {
    return earnToken(this.state, userId, phase, reason);
  }
  
  burnTokenForUnlock(
    userId: string,
    tokenId: string,
    completionData: Parameters<typeof burnTokenForUnlock>[3],
    membershipType: 'public' | 'academy' | 'employee'
  ) {
    return burnTokenForUnlock(this.state, userId, tokenId, completionData, membershipType);
  }
  
  getUserProgress(userId: string, membershipType: 'public' | 'academy' | 'employee') {
    return getUserProgress(this.state, userId, membershipType);
  }
  
  canPurchaseToken(phase: SWALPhase) {
    return canPurchaseToken(this.state, phase);
  }
  
  getAnalytics() {
    return getSystemAnalytics(this.state);
  }
  
  simulatePriceHistory(phase: SWALPhase) {
    return simulatePriceHistory(phase);
  }
  
  projectFutureValue(phase: SWALPhase, projectedSales: number) {
    const supply = this.state.tokenSupply[phase];
    return projectFutureValue(phase, supply.sold, projectedSales);
  }
}
