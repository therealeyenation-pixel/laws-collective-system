/**
 * L.A.W.S. Quest - Commercial Game Product
 * Owned by The L.A.W.S. Collective, LLC
 * 
 * Token Economy System - Connecting Game Rewards to LuvLedger
 * 
 * This system manages the in-game token economy and provides
 * integration points for connecting to the real-world LuvLedger
 * system when players are L.A.W.S. Collective members.
 */

// ============================================
// TOKEN TYPES AND INTERFACES
// ============================================

export interface TokenBalance {
  gameTokens: number;           // In-game currency
  redeemableTokens: number;     // Tokens eligible for LuvLedger conversion
  lifetimeEarned: number;       // Total tokens ever earned
  lifetimeSpent: number;        // Total tokens ever spent
  lifetimeRedeemed: number;     // Total tokens converted to LuvLedger
}

export interface TokenTransaction {
  id: string;
  timestamp: number;
  type: "earn" | "spend" | "redeem" | "bonus" | "transfer";
  amount: number;
  source: TokenSource;
  description: string;
  balanceAfter: number;
}

export type TokenSource = 
  | "quest_completion"
  | "achievement"
  | "daily_login"
  | "streak_bonus"
  | "mini_game"
  | "npc_reward"
  | "house_income"
  | "shop_purchase"
  | "crafting"
  | "luvledger_redemption"
  | "academy_bonus"
  | "employee_bonus"
  | "referral"
  | "event"
  | "admin";

// ============================================
// TOKEN EARNING RATES
// ============================================

export interface TokenEarningRate {
  source: TokenSource;
  baseAmount: number;
  description: string;
  multiplierEligible: boolean;
}

export const TOKEN_EARNING_RATES: TokenEarningRate[] = [
  // Quest Rewards
  {
    source: "quest_completion",
    baseAmount: 25,
    description: "Base reward for completing a quest",
    multiplierEligible: true,
  },
  
  // Achievements
  {
    source: "achievement",
    baseAmount: 50,
    description: "Base reward for unlocking an achievement",
    multiplierEligible: true,
  },
  
  // Daily Activities
  {
    source: "daily_login",
    baseAmount: 10,
    description: "Daily login reward",
    multiplierEligible: true,
  },
  {
    source: "streak_bonus",
    baseAmount: 5,
    description: "Per-day streak bonus (multiplied by streak length)",
    multiplierEligible: true,
  },
  
  // Mini-games
  {
    source: "mini_game",
    baseAmount: 15,
    description: "Base reward for completing a mini-game",
    multiplierEligible: true,
  },
  
  // NPC Interactions
  {
    source: "npc_reward",
    baseAmount: 20,
    description: "Rewards from NPC affinity milestones",
    multiplierEligible: true,
  },
  
  // House System
  {
    source: "house_income",
    baseAmount: 1,
    description: "Per-day income from House land holdings",
    multiplierEligible: false,
  },
  
  // Special Bonuses
  {
    source: "academy_bonus",
    baseAmount: 100,
    description: "Bonus for L.A.W.S. Academy members",
    multiplierEligible: false,
  },
  {
    source: "employee_bonus",
    baseAmount: 150,
    description: "Bonus for L.A.W.S. Collective employees",
    multiplierEligible: false,
  },
  {
    source: "referral",
    baseAmount: 50,
    description: "Bonus for referring new players",
    multiplierEligible: false,
  },
];

// ============================================
// TOKEN MULTIPLIERS
// ============================================

export interface TokenMultiplier {
  id: string;
  name: string;
  description: string;
  multiplier: number;
  source: MultiplierSource;
  duration?: number;  // In hours, undefined = permanent
  stackable: boolean;
}

export type MultiplierSource = 
  | "membership_tier"
  | "streak"
  | "event"
  | "item"
  | "achievement"
  | "house_bonus";

export const MULTIPLIER_TIERS: TokenMultiplier[] = [
  // Membership Tiers
  {
    id: "mult-free",
    name: "Free Player",
    description: "Standard earning rate",
    multiplier: 1.0,
    source: "membership_tier",
    stackable: false,
  },
  {
    id: "mult-academy",
    name: "Academy Member",
    description: "L.A.W.S. Academy enrollment bonus",
    multiplier: 1.5,
    source: "membership_tier",
    stackable: false,
  },
  {
    id: "mult-employee",
    name: "Collective Employee",
    description: "L.A.W.S. Collective employee bonus",
    multiplier: 2.0,
    source: "membership_tier",
    stackable: false,
  },
  
  // Streak Multipliers
  {
    id: "mult-streak-7",
    name: "Week Warrior",
    description: "7-day login streak",
    multiplier: 1.1,
    source: "streak",
    stackable: true,
  },
  {
    id: "mult-streak-30",
    name: "Monthly Master",
    description: "30-day login streak",
    multiplier: 1.25,
    source: "streak",
    stackable: true,
  },
  {
    id: "mult-streak-100",
    name: "Century Champion",
    description: "100-day login streak",
    multiplier: 1.5,
    source: "streak",
    stackable: true,
  },
  
  // House Bonuses
  {
    id: "mult-house-5",
    name: "Established House",
    description: "House Level 5+ bonus",
    multiplier: 1.1,
    source: "house_bonus",
    stackable: true,
  },
  {
    id: "mult-house-10",
    name: "Dynasty Bonus",
    description: "House Level 10 bonus",
    multiplier: 1.25,
    source: "house_bonus",
    stackable: true,
  },
];

// ============================================
// LUVLEDGER INTEGRATION
// ============================================

export interface LuvLedgerConnection {
  isConnected: boolean;
  membershipType: "none" | "academy" | "employee" | "collective_member";
  luvLedgerId?: string;
  lastSyncTimestamp?: number;
  conversionRate: number;  // Game tokens to LuvLedger points ratio
  minimumRedemption: number;
  lifetimeRedeemed: number;
}

export interface RedemptionRequest {
  id: string;
  timestamp: number;
  gameTokens: number;
  luvLedgerPoints: number;
  status: "pending" | "processing" | "completed" | "failed";
  luvLedgerId: string;
  transactionRef?: string;
}

// Conversion rates based on membership
export const CONVERSION_RATES: Record<string, number> = {
  none: 0,           // Free players cannot redeem
  academy: 100,      // 100 game tokens = 1 LuvLedger point
  employee: 50,      // 50 game tokens = 1 LuvLedger point (better rate)
  collective_member: 75,  // 75 game tokens = 1 LuvLedger point
};

export const MINIMUM_REDEMPTION = 500; // Minimum game tokens to redeem

// ============================================
// TOKEN ECONOMY FUNCTIONS
// ============================================

export function createTokenBalance(): TokenBalance {
  return {
    gameTokens: 0,
    redeemableTokens: 0,
    lifetimeEarned: 0,
    lifetimeSpent: 0,
    lifetimeRedeemed: 0,
  };
}

export function earnTokens(
  balance: TokenBalance,
  amount: number,
  source: TokenSource,
  multipliers: TokenMultiplier[] = []
): { newBalance: TokenBalance; transaction: TokenTransaction; finalAmount: number } {
  // Calculate multiplier
  let totalMultiplier = 1.0;
  const rate = TOKEN_EARNING_RATES.find(r => r.source === source);
  
  if (rate?.multiplierEligible) {
    for (const mult of multipliers) {
      totalMultiplier *= mult.multiplier;
    }
  }
  
  const finalAmount = Math.round(amount * totalMultiplier);
  
  const newBalance: TokenBalance = {
    ...balance,
    gameTokens: balance.gameTokens + finalAmount,
    redeemableTokens: balance.redeemableTokens + finalAmount,
    lifetimeEarned: balance.lifetimeEarned + finalAmount,
  };
  
  const transaction: TokenTransaction = {
    id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    type: "earn",
    amount: finalAmount,
    source,
    description: rate?.description || "Token earned",
    balanceAfter: newBalance.gameTokens,
  };
  
  return { newBalance, transaction, finalAmount };
}

export function spendTokens(
  balance: TokenBalance,
  amount: number,
  source: TokenSource,
  description: string
): { success: boolean; newBalance: TokenBalance; transaction?: TokenTransaction; error?: string } {
  if (balance.gameTokens < amount) {
    return {
      success: false,
      newBalance: balance,
      error: `Insufficient tokens. Need ${amount}, have ${balance.gameTokens}`,
    };
  }
  
  const newBalance: TokenBalance = {
    ...balance,
    gameTokens: balance.gameTokens - amount,
    lifetimeSpent: balance.lifetimeSpent + amount,
  };
  
  const transaction: TokenTransaction = {
    id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    type: "spend",
    amount: -amount,
    source,
    description,
    balanceAfter: newBalance.gameTokens,
  };
  
  return { success: true, newBalance, transaction };
}

export function calculateRedemptionValue(
  gameTokens: number,
  membershipType: "none" | "academy" | "employee" | "collective_member"
): { canRedeem: boolean; luvLedgerPoints: number; error?: string } {
  if (membershipType === "none") {
    return {
      canRedeem: false,
      luvLedgerPoints: 0,
      error: "Must be an Academy member, Employee, or Collective member to redeem tokens",
    };
  }
  
  if (gameTokens < MINIMUM_REDEMPTION) {
    return {
      canRedeem: false,
      luvLedgerPoints: 0,
      error: `Minimum ${MINIMUM_REDEMPTION} tokens required for redemption`,
    };
  }
  
  const rate = CONVERSION_RATES[membershipType];
  const luvLedgerPoints = Math.floor(gameTokens / rate);
  
  return {
    canRedeem: true,
    luvLedgerPoints,
  };
}

export function redeemTokens(
  balance: TokenBalance,
  amount: number,
  connection: LuvLedgerConnection
): { success: boolean; newBalance: TokenBalance; request?: RedemptionRequest; error?: string } {
  const redemptionCalc = calculateRedemptionValue(amount, connection.membershipType);
  
  if (!redemptionCalc.canRedeem) {
    return {
      success: false,
      newBalance: balance,
      error: redemptionCalc.error,
    };
  }
  
  if (balance.redeemableTokens < amount) {
    return {
      success: false,
      newBalance: balance,
      error: `Insufficient redeemable tokens. Have ${balance.redeemableTokens}, need ${amount}`,
    };
  }
  
  const newBalance: TokenBalance = {
    ...balance,
    gameTokens: balance.gameTokens - amount,
    redeemableTokens: balance.redeemableTokens - amount,
    lifetimeRedeemed: balance.lifetimeRedeemed + amount,
  };
  
  const request: RedemptionRequest = {
    id: `redeem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    gameTokens: amount,
    luvLedgerPoints: redemptionCalc.luvLedgerPoints,
    status: "pending",
    luvLedgerId: connection.luvLedgerId || "",
  };
  
  return { success: true, newBalance, request };
}

// ============================================
// DAILY REWARDS SYSTEM
// ============================================

export interface DailyReward {
  day: number;
  tokens: number;
  bonusItem?: string;
  description: string;
}

export const DAILY_REWARDS: DailyReward[] = [
  { day: 1, tokens: 10, description: "Welcome back!" },
  { day: 2, tokens: 15, description: "Day 2 streak!" },
  { day: 3, tokens: 20, description: "Keep it up!" },
  { day: 4, tokens: 25, description: "Halfway there!" },
  { day: 5, tokens: 30, description: "Almost a week!" },
  { day: 6, tokens: 35, description: "One more day!" },
  { day: 7, tokens: 50, bonusItem: "energy-tea", description: "Weekly bonus!" },
  { day: 14, tokens: 75, bonusItem: "exp-scroll", description: "Two week champion!" },
  { day: 30, tokens: 150, bonusItem: "energy-elixir", description: "Monthly master!" },
  { day: 60, tokens: 300, bonusItem: "boost-self", description: "Dedicated player!" },
  { day: 100, tokens: 500, bonusItem: "exp-tome", description: "Century achievement!" },
];

export function getDailyReward(streakDays: number): DailyReward {
  // Find the highest applicable reward
  let reward = DAILY_REWARDS[0];
  
  for (const r of DAILY_REWARDS) {
    if (streakDays >= r.day) {
      reward = r;
    }
  }
  
  // For days beyond defined rewards, use base + streak bonus
  if (streakDays > 100) {
    return {
      day: streakDays,
      tokens: 10 + (streakDays * 2),
      description: `${streakDays}-day streak!`,
    };
  }
  
  return reward;
}

// ============================================
// QUEST REWARD CALCULATIONS
// ============================================

export interface QuestRewardCalculation {
  baseTokens: number;
  difficultyBonus: number;
  performanceBonus: number;
  streakBonus: number;
  membershipBonus: number;
  totalTokens: number;
  experienceGained: number;
}

export function calculateQuestReward(
  questDifficulty: number,
  performanceScore: number,  // 0-100
  streakDays: number,
  membershipType: "none" | "academy" | "employee" | "collective_member",
  isFirstCompletion: boolean
): QuestRewardCalculation {
  // Base tokens scale with difficulty
  const baseTokens = 15 + (questDifficulty * 10);
  
  // Difficulty bonus
  const difficultyBonus = questDifficulty > 2 ? (questDifficulty - 2) * 5 : 0;
  
  // Performance bonus (up to 50% extra for perfect score)
  const performanceBonus = Math.round(baseTokens * (performanceScore / 200));
  
  // Streak bonus (1% per day, max 30%)
  const streakMultiplier = Math.min(0.30, streakDays * 0.01);
  const streakBonus = Math.round(baseTokens * streakMultiplier);
  
  // Membership bonus
  let membershipMultiplier = 0;
  switch (membershipType) {
    case "academy": membershipMultiplier = 0.25; break;
    case "employee": membershipMultiplier = 0.50; break;
    case "collective_member": membershipMultiplier = 0.35; break;
  }
  const membershipBonus = Math.round(baseTokens * membershipMultiplier);
  
  // First completion bonus (50% extra)
  const firstCompletionBonus = isFirstCompletion ? Math.round(baseTokens * 0.5) : 0;
  
  const totalTokens = baseTokens + difficultyBonus + performanceBonus + streakBonus + membershipBonus + firstCompletionBonus;
  
  // Experience scales similarly
  const experienceGained = Math.round(totalTokens * 1.5);
  
  return {
    baseTokens,
    difficultyBonus,
    performanceBonus,
    streakBonus,
    membershipBonus,
    totalTokens,
    experienceGained,
  };
}

// ============================================
// ACHIEVEMENT REWARDS
// ============================================

export interface AchievementReward {
  achievementId: string;
  tokens: number;
  bonusItems: string[];
  title?: string;
}

export function getAchievementReward(achievementId: string, rarity: string): AchievementReward {
  let tokens = 50;
  const bonusItems: string[] = [];
  
  switch (rarity) {
    case "common":
      tokens = 25;
      break;
    case "uncommon":
      tokens = 50;
      bonusItems.push("energy-tea");
      break;
    case "rare":
      tokens = 100;
      bonusItems.push("exp-scroll");
      break;
    case "epic":
      tokens = 250;
      bonusItems.push("energy-elixir", "exp-scroll");
      break;
    case "legendary":
      tokens = 500;
      bonusItems.push("energy-surge", "exp-tome");
      break;
  }
  
  return {
    achievementId,
    tokens,
    bonusItems,
  };
}

// ============================================
// ECONOMY STATISTICS
// ============================================

export interface EconomyStats {
  totalTokensInCirculation: number;
  totalTokensEarned: number;
  totalTokensSpent: number;
  totalTokensRedeemed: number;
  averagePlayerBalance: number;
  topEarners: { playerId: string; tokens: number }[];
  dailyEarningRate: number;
  dailySpendingRate: number;
}

export function calculatePlayerWealthRank(
  playerBalance: number,
  allPlayerBalances: number[]
): { rank: number; percentile: number } {
  const sorted = [...allPlayerBalances].sort((a, b) => b - a);
  const rank = sorted.findIndex(b => b <= playerBalance) + 1;
  const percentile = Math.round((1 - (rank / sorted.length)) * 100);
  
  return { rank, percentile };
}

// ============================================
// EXPORT SUMMARY
// ============================================

export const TOKEN_ECONOMY = {
  earningRates: TOKEN_EARNING_RATES,
  multipliers: MULTIPLIER_TIERS,
  conversionRates: CONVERSION_RATES,
  minimumRedemption: MINIMUM_REDEMPTION,
  dailyRewards: DAILY_REWARDS,
};
