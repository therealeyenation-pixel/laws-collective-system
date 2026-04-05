/**
 * L.A.W.S. Quest - Commercial Game Product
 * Owned by The L.A.W.S. Collective, LLC
 * 
 * Mini-game definitions and logic for quest completion
 */

import type { MiniGameType, MiniGameConfig, CharacterStats } from "./types";

// ============================================
// MINI-GAME QUESTION BANKS
// ============================================

export interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: number;
  realm: "land" | "air" | "water" | "self";
  tags: string[];
}

export interface MathProblem {
  id: string;
  question: string;
  answer: number;
  tolerance?: number;
  explanation: string;
  difficulty: number;
  category: "budget" | "savings" | "investment" | "debt" | "percentage";
}

export interface ReflectionPrompt {
  id: string;
  prompt: string;
  followUp?: string;
  realm: "land" | "air" | "water" | "self";
  difficulty: number;
  minWords?: number;
}

export interface MemoryCard {
  id: string;
  content: string;
  type: "concept" | "term" | "icon";
  matchId: string;
  realm: "land" | "air" | "water" | "self";
}

export interface WordPuzzle {
  id: string;
  type: "scramble" | "fill-blank" | "definition";
  word: string;
  hint: string;
  definition: string;
  difficulty: number;
  realm: "land" | "air" | "water" | "self";
}

// ============================================
// TRIVIA QUESTIONS BY REALM
// ============================================

export const TRIVIA_BANK: TriviaQuestion[] = [
  // LAND REALM - Ancestry, Property, Resources
  {
    id: "land-t-1",
    question: "What is the foundation of generational wealth according to historical patterns?",
    options: ["Stock market investments", "Land and property ownership", "Cryptocurrency", "Lottery winnings"],
    correctIndex: 1,
    explanation: "Throughout history, land ownership has been the primary vehicle for building and transferring generational wealth.",
    difficulty: 1,
    realm: "land",
    tags: ["wealth", "property"],
  },
  {
    id: "land-t-2",
    question: "Why is documenting family history important?",
    options: ["Social media content", "Identity and cultural connection", "Legal requirements", "Entertainment"],
    correctIndex: 1,
    explanation: "Understanding your family history provides a sense of identity, cultural connection, and valuable lessons from ancestors' experiences.",
    difficulty: 1,
    realm: "land",
    tags: ["ancestry", "identity"],
  },
  {
    id: "land-t-3",
    question: "What is a deed in property ownership?",
    options: ["A promise to pay", "A legal document proving ownership", "A type of loan", "A rental agreement"],
    correctIndex: 1,
    explanation: "A deed is a legal document that transfers ownership of property from one party to another.",
    difficulty: 2,
    realm: "land",
    tags: ["property", "legal"],
  },
  {
    id: "land-t-4",
    question: "What does 'sovereignty' mean in the context of land ownership?",
    options: ["Being a king", "Self-governance and supreme authority", "Paying no taxes", "Living alone"],
    correctIndex: 1,
    explanation: "Sovereignty refers to having supreme authority and self-governance over one's own territory and affairs.",
    difficulty: 2,
    realm: "land",
    tags: ["sovereignty", "governance"],
  },
  {
    id: "land-t-5",
    question: "What is an allodial title?",
    options: ["A type of mortgage", "Complete ownership free of any superior landlord", "A rental agreement", "A tax document"],
    correctIndex: 1,
    explanation: "An allodial title represents complete ownership of land, free from any obligations to a superior landlord or government.",
    difficulty: 3,
    realm: "land",
    tags: ["property", "sovereignty"],
  },
  {
    id: "land-t-6",
    question: "What is the primary purpose of a land trust?",
    options: ["Tax evasion", "Privacy and asset protection", "Avoiding all laws", "Free land"],
    correctIndex: 1,
    explanation: "Land trusts provide privacy for property owners and can offer asset protection benefits.",
    difficulty: 3,
    realm: "land",
    tags: ["trust", "property"],
  },
  {
    id: "land-t-7",
    question: "What is sustainable resource management?",
    options: ["Using resources as fast as possible", "Managing resources to meet present needs without compromising future generations", "Hoarding resources", "Selling all resources"],
    correctIndex: 1,
    explanation: "Sustainable resource management ensures resources are used wisely to meet current needs while preserving them for future generations.",
    difficulty: 2,
    realm: "land",
    tags: ["sustainability", "resources"],
  },

  // AIR REALM - Knowledge, Communication, Education
  {
    id: "air-t-1",
    question: "What is the best long-term investment in yourself?",
    options: ["Designer clothes", "Education and skill development", "Luxury cars", "Social media followers"],
    correctIndex: 1,
    explanation: "Education and continuous skill development provide returns throughout your entire life.",
    difficulty: 1,
    realm: "air",
    tags: ["education", "investment"],
  },
  {
    id: "air-t-2",
    question: "What is active listening?",
    options: ["Listening while exercising", "Fully concentrating and responding to a speaker", "Hearing background noise", "Multitasking while someone talks"],
    correctIndex: 1,
    explanation: "Active listening involves fully concentrating, understanding, responding, and remembering what is being said.",
    difficulty: 1,
    realm: "air",
    tags: ["communication", "skills"],
  },
  {
    id: "air-t-3",
    question: "What is financial literacy?",
    options: ["Reading financial newspapers", "Understanding how money works and making informed decisions", "Being wealthy", "Having a finance degree"],
    correctIndex: 1,
    explanation: "Financial literacy is the ability to understand and effectively use various financial skills, including budgeting, investing, and debt management.",
    difficulty: 1,
    realm: "air",
    tags: ["finance", "education"],
  },
  {
    id: "air-t-4",
    question: "What is compound learning?",
    options: ["Studying chemistry", "Knowledge building upon previous knowledge exponentially", "Learning in groups", "Memorizing facts"],
    correctIndex: 1,
    explanation: "Compound learning is when new knowledge builds upon existing knowledge, creating exponential growth in understanding.",
    difficulty: 2,
    realm: "air",
    tags: ["learning", "growth"],
  },
  {
    id: "air-t-5",
    question: "What is critical thinking?",
    options: ["Being critical of others", "Analyzing information objectively to form judgments", "Negative thinking", "Quick decision making"],
    correctIndex: 1,
    explanation: "Critical thinking involves analyzing information objectively and making reasoned judgments based on evidence.",
    difficulty: 2,
    realm: "air",
    tags: ["thinking", "analysis"],
  },
  {
    id: "air-t-6",
    question: "What makes communication effective?",
    options: ["Speaking loudly", "Clarity, active listening, and mutual understanding", "Using complex words", "Talking more than others"],
    correctIndex: 1,
    explanation: "Effective communication requires clarity in message, active listening, and ensuring mutual understanding between parties.",
    difficulty: 2,
    realm: "air",
    tags: ["communication", "skills"],
  },

  // WATER REALM - Emotions, Healing, Balance
  {
    id: "water-t-1",
    question: "What is emotional intelligence?",
    options: ["Being emotional", "Recognizing and managing your own and others' emotions", "Hiding feelings", "Being logical only"],
    correctIndex: 1,
    explanation: "Emotional intelligence is the ability to recognize, understand, and manage your own emotions and those of others.",
    difficulty: 1,
    realm: "water",
    tags: ["emotions", "intelligence"],
  },
  {
    id: "water-t-2",
    question: "What is the first step in emotional healing?",
    options: ["Forgetting the past", "Acknowledging the wound", "Seeking revenge", "Ignoring feelings"],
    correctIndex: 1,
    explanation: "Healing begins with acknowledging that a wound exists and accepting its impact on your life.",
    difficulty: 1,
    realm: "water",
    tags: ["healing", "awareness"],
  },
  {
    id: "water-t-3",
    question: "How does chronic stress affect decision-making?",
    options: ["Improves focus", "Impairs judgment and rational thinking", "Has no effect", "Makes you smarter"],
    correctIndex: 1,
    explanation: "Chronic stress impairs the prefrontal cortex, leading to poor judgment and reactive rather than thoughtful decisions.",
    difficulty: 2,
    realm: "water",
    tags: ["stress", "decisions"],
  },
  {
    id: "water-t-4",
    question: "What is mindfulness?",
    options: ["Thinking about the future", "Being fully present in the current moment", "Analyzing the past", "Multitasking"],
    correctIndex: 1,
    explanation: "Mindfulness is the practice of being fully present and engaged in the current moment without judgment.",
    difficulty: 2,
    realm: "water",
    tags: ["mindfulness", "presence"],
  },
  {
    id: "water-t-5",
    question: "What is the purpose of forgiveness?",
    options: ["Letting others off the hook", "Freeing yourself from resentment", "Forgetting what happened", "Being weak"],
    correctIndex: 1,
    explanation: "Forgiveness is primarily for your own benefit—it frees you from the burden of carrying resentment and anger.",
    difficulty: 2,
    realm: "water",
    tags: ["forgiveness", "healing"],
  },
  {
    id: "water-t-6",
    question: "What is emotional regulation?",
    options: ["Suppressing all emotions", "Managing emotional responses appropriately", "Never feeling emotions", "Always being happy"],
    correctIndex: 1,
    explanation: "Emotional regulation is the ability to manage and respond to emotional experiences in healthy, appropriate ways.",
    difficulty: 3,
    realm: "water",
    tags: ["emotions", "regulation"],
  },

  // SELF REALM - Purpose, Finance, Skills
  {
    id: "self-t-1",
    question: "What is a budget?",
    options: ["A restriction on fun", "A plan for managing income and expenses", "A punishment", "A type of account"],
    correctIndex: 1,
    explanation: "A budget is a financial plan that helps you track and manage your income and expenses to achieve your goals.",
    difficulty: 1,
    realm: "self",
    tags: ["budget", "finance"],
  },
  {
    id: "self-t-2",
    question: "What is compound interest?",
    options: ["Interest on a loan", "Interest earned on both principal and accumulated interest", "A bank fee", "A type of tax"],
    correctIndex: 1,
    explanation: "Compound interest is interest calculated on both the initial principal and the accumulated interest from previous periods.",
    difficulty: 1,
    realm: "self",
    tags: ["interest", "investment"],
  },
  {
    id: "self-t-3",
    question: "What is an emergency fund?",
    options: ["Money for vacations", "Savings for unexpected expenses", "Investment account", "Retirement fund"],
    correctIndex: 1,
    explanation: "An emergency fund is savings set aside specifically for unexpected expenses like medical bills, car repairs, or job loss.",
    difficulty: 1,
    realm: "self",
    tags: ["savings", "emergency"],
  },
  {
    id: "self-t-4",
    question: "What builds a good credit score?",
    options: ["Ignoring bills", "Consistent on-time payments", "Maxing out credit cards", "Closing all accounts"],
    correctIndex: 1,
    explanation: "A good credit score is built through consistent on-time payments, low credit utilization, and responsible credit management.",
    difficulty: 2,
    realm: "self",
    tags: ["credit", "finance"],
  },
  {
    id: "self-t-5",
    question: "What is the 50/30/20 budget rule?",
    options: ["50% savings, 30% needs, 20% wants", "50% needs, 30% wants, 20% savings", "50% wants, 30% savings, 20% needs", "50% taxes, 30% needs, 20% wants"],
    correctIndex: 1,
    explanation: "The 50/30/20 rule suggests allocating 50% of income to needs, 30% to wants, and 20% to savings and debt repayment.",
    difficulty: 2,
    realm: "self",
    tags: ["budget", "rule"],
  },
  {
    id: "self-t-6",
    question: "What is diversification in investing?",
    options: ["Putting all money in one stock", "Spreading investments across different assets", "Only investing in real estate", "Day trading"],
    correctIndex: 1,
    explanation: "Diversification means spreading investments across different asset types to reduce risk.",
    difficulty: 3,
    realm: "self",
    tags: ["investment", "risk"],
  },
];

// ============================================
// MATH PROBLEMS FOR FINANCIAL LITERACY
// ============================================

export const MATH_BANK: MathProblem[] = [
  // Budget calculations
  {
    id: "math-1",
    question: "If you save $200 per month for 12 months, how much will you have saved?",
    answer: 2400,
    explanation: "$200 × 12 months = $2,400",
    difficulty: 1,
    category: "savings",
  },
  {
    id: "math-2",
    question: "Your monthly income is $4,000. Using the 50/30/20 rule, how much should go to needs?",
    answer: 2000,
    explanation: "$4,000 × 50% = $2,000 for needs",
    difficulty: 1,
    category: "budget",
  },
  {
    id: "math-3",
    question: "You have $1,000 and spend 25% on groceries. How much is left?",
    answer: 750,
    explanation: "$1,000 × 25% = $250 spent, $1,000 - $250 = $750 remaining",
    difficulty: 1,
    category: "budget",
  },
  {
    id: "math-4",
    question: "If you invest $5,000 and earn 8% annual interest, how much interest do you earn in one year?",
    answer: 400,
    explanation: "$5,000 × 8% = $400 interest",
    difficulty: 2,
    category: "investment",
  },
  {
    id: "math-5",
    question: "Your credit card has a $2,000 balance with 18% APR. What is the annual interest charge?",
    answer: 360,
    explanation: "$2,000 × 18% = $360 annual interest",
    difficulty: 2,
    category: "debt",
  },
  {
    id: "math-6",
    question: "You want to save $6,000 in 2 years. How much must you save per month?",
    answer: 250,
    explanation: "$6,000 ÷ 24 months = $250 per month",
    difficulty: 2,
    category: "savings",
  },
  {
    id: "math-7",
    question: "Your rent is $1,200/month. What percentage of a $4,000 monthly income is this?",
    answer: 30,
    explanation: "$1,200 ÷ $4,000 × 100 = 30%",
    difficulty: 2,
    category: "percentage",
  },
  {
    id: "math-8",
    question: "If you pay $500/month on a $10,000 debt with no interest, how many months to pay it off?",
    answer: 20,
    explanation: "$10,000 ÷ $500 = 20 months",
    difficulty: 2,
    category: "debt",
  },
  {
    id: "math-9",
    question: "You invest $10,000 at 6% compound interest annually. What's the total after 1 year?",
    answer: 10600,
    explanation: "$10,000 × 1.06 = $10,600",
    difficulty: 3,
    category: "investment",
  },
  {
    id: "math-10",
    question: "Your business made $50,000 revenue with $35,000 in expenses. What's the profit margin percentage?",
    answer: 30,
    explanation: "Profit = $50,000 - $35,000 = $15,000. Margin = $15,000 ÷ $50,000 × 100 = 30%",
    difficulty: 3,
    category: "percentage",
  },
];

// ============================================
// REFLECTION PROMPTS
// ============================================

export const REFLECTION_BANK: ReflectionPrompt[] = [
  // LAND
  {
    id: "ref-land-1",
    prompt: "What do you know about your grandparents' lives? Where did they live and what did they do?",
    followUp: "How might their experiences have shaped your family's values?",
    realm: "land",
    difficulty: 1,
    minWords: 20,
  },
  {
    id: "ref-land-2",
    prompt: "What traditions does your family practice? Where do you think they originated?",
    realm: "land",
    difficulty: 2,
    minWords: 30,
  },
  {
    id: "ref-land-3",
    prompt: "If you could ask your ancestors one question, what would it be and why?",
    realm: "land",
    difficulty: 2,
    minWords: 25,
  },
  {
    id: "ref-land-4",
    prompt: "What does 'home' mean to you beyond just a physical place?",
    realm: "land",
    difficulty: 3,
    minWords: 40,
  },

  // AIR
  {
    id: "ref-air-1",
    prompt: "What is the most valuable thing you've ever learned? How has it changed your life?",
    realm: "air",
    difficulty: 1,
    minWords: 25,
  },
  {
    id: "ref-air-2",
    prompt: "Describe a time when effective communication helped you solve a problem.",
    realm: "air",
    difficulty: 2,
    minWords: 30,
  },
  {
    id: "ref-air-3",
    prompt: "What skill would you most like to develop? How would it benefit your life?",
    realm: "air",
    difficulty: 2,
    minWords: 30,
  },
  {
    id: "ref-air-4",
    prompt: "How do you distinguish between information and wisdom? Give an example.",
    realm: "air",
    difficulty: 3,
    minWords: 40,
  },

  // WATER
  {
    id: "ref-water-1",
    prompt: "What emotion have you felt most strongly this week? What triggered it?",
    realm: "water",
    difficulty: 1,
    minWords: 20,
  },
  {
    id: "ref-water-2",
    prompt: "Describe a moment when you felt truly at peace. What elements created that feeling?",
    realm: "water",
    difficulty: 2,
    minWords: 30,
  },
  {
    id: "ref-water-3",
    prompt: "What is something you need to forgive yourself for? What would letting go look like?",
    realm: "water",
    difficulty: 3,
    minWords: 35,
  },
  {
    id: "ref-water-4",
    prompt: "How do you typically respond to stress? Is this response serving you well?",
    realm: "water",
    difficulty: 2,
    minWords: 30,
  },

  // SELF
  {
    id: "ref-self-1",
    prompt: "What are three things you're genuinely good at? How could you use these strengths?",
    realm: "self",
    difficulty: 1,
    minWords: 25,
  },
  {
    id: "ref-self-2",
    prompt: "Where do you see yourself in 5 years? What steps are you taking to get there?",
    realm: "self",
    difficulty: 2,
    minWords: 30,
  },
  {
    id: "ref-self-3",
    prompt: "What does financial freedom mean to you personally?",
    realm: "self",
    difficulty: 2,
    minWords: 30,
  },
  {
    id: "ref-self-4",
    prompt: "What legacy do you want to leave for future generations?",
    realm: "self",
    difficulty: 3,
    minWords: 40,
  },
];

// ============================================
// MEMORY MATCH PAIRS
// ============================================

export const MEMORY_PAIRS: { concept: string; definition: string; realm: "land" | "air" | "water" | "self" }[] = [
  // LAND
  { concept: "Deed", definition: "Legal ownership document", realm: "land" },
  { concept: "Sovereignty", definition: "Self-governance authority", realm: "land" },
  { concept: "Heritage", definition: "Inherited traditions", realm: "land" },
  { concept: "Stewardship", definition: "Responsible management", realm: "land" },
  { concept: "Legacy", definition: "What you leave behind", realm: "land" },
  { concept: "Roots", definition: "Family origins", realm: "land" },

  // AIR
  { concept: "Literacy", definition: "Ability to understand", realm: "air" },
  { concept: "Wisdom", definition: "Applied knowledge", realm: "air" },
  { concept: "Critical Thinking", definition: "Objective analysis", realm: "air" },
  { concept: "Communication", definition: "Exchange of ideas", realm: "air" },
  { concept: "Education", definition: "Systematic learning", realm: "air" },
  { concept: "Mentorship", definition: "Guidance from experience", realm: "air" },

  // WATER
  { concept: "Emotional Intelligence", definition: "Understanding feelings", realm: "water" },
  { concept: "Mindfulness", definition: "Present awareness", realm: "water" },
  { concept: "Forgiveness", definition: "Releasing resentment", realm: "water" },
  { concept: "Balance", definition: "Equilibrium in life", realm: "water" },
  { concept: "Healing", definition: "Recovery process", realm: "water" },
  { concept: "Resilience", definition: "Bouncing back", realm: "water" },

  // SELF
  { concept: "Budget", definition: "Financial plan", realm: "self" },
  { concept: "Compound Interest", definition: "Interest on interest", realm: "self" },
  { concept: "Diversification", definition: "Spreading risk", realm: "self" },
  { concept: "Purpose", definition: "Life's direction", realm: "self" },
  { concept: "Entrepreneurship", definition: "Creating business", realm: "self" },
  { concept: "Investment", definition: "Money working for you", realm: "self" },
];

// ============================================
// WORD PUZZLES
// ============================================

export const WORD_BANK: WordPuzzle[] = [
  { id: "word-1", type: "scramble", word: "BUDGET", hint: "Financial plan", definition: "A plan for managing income and expenses", difficulty: 1, realm: "self" },
  { id: "word-2", type: "scramble", word: "LEGACY", hint: "What you leave behind", definition: "Something handed down from an ancestor", difficulty: 1, realm: "land" },
  { id: "word-3", type: "scramble", word: "WISDOM", hint: "Applied knowledge", definition: "The quality of having experience and good judgment", difficulty: 1, realm: "air" },
  { id: "word-4", type: "scramble", word: "BALANCE", hint: "Equilibrium", definition: "A state of stability between opposing forces", difficulty: 2, realm: "water" },
  { id: "word-5", type: "scramble", word: "SOVEREIGNTY", hint: "Self-rule", definition: "Supreme authority over one's own affairs", difficulty: 3, realm: "land" },
  { id: "word-6", type: "scramble", word: "INVESTMENT", hint: "Money growing", definition: "Allocating resources to generate income or profit", difficulty: 2, realm: "self" },
  { id: "word-7", type: "scramble", word: "MINDFULNESS", hint: "Present moment", definition: "Being fully aware of the present moment", difficulty: 3, realm: "water" },
  { id: "word-8", type: "scramble", word: "COMMUNICATION", hint: "Sharing ideas", definition: "The exchange of information between people", difficulty: 2, realm: "air" },
];

// ============================================
// MINI-GAME HELPERS
// ============================================

export function getQuestionsForRealm(realm: "land" | "air" | "water" | "self", count: number, difficulty: number): TriviaQuestion[] {
  const realmQuestions = TRIVIA_BANK.filter(q => q.realm === realm && q.difficulty <= difficulty + 1);
  return shuffleArray(realmQuestions).slice(0, count);
}

export function getMathProblems(count: number, difficulty: number): MathProblem[] {
  const problems = MATH_BANK.filter(p => p.difficulty <= difficulty + 1);
  return shuffleArray(problems).slice(0, count);
}

export function getReflectionPrompts(realm: "land" | "air" | "water" | "self", count: number): ReflectionPrompt[] {
  const prompts = REFLECTION_BANK.filter(p => p.realm === realm);
  return shuffleArray(prompts).slice(0, count);
}

export function getMemoryPairs(realm: "land" | "air" | "water" | "self" | "all", pairCount: number): { concept: string; definition: string }[] {
  let pairs = realm === "all" 
    ? MEMORY_PAIRS 
    : MEMORY_PAIRS.filter(p => p.realm === realm);
  return shuffleArray(pairs).slice(0, pairCount);
}

export function getWordPuzzles(realm: "land" | "air" | "water" | "self" | "all", count: number, difficulty: number): WordPuzzle[] {
  let puzzles = realm === "all"
    ? WORD_BANK.filter(w => w.difficulty <= difficulty + 1)
    : WORD_BANK.filter(w => w.realm === realm && w.difficulty <= difficulty + 1);
  return shuffleArray(puzzles).slice(0, count);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function scrambleWord(word: string): string {
  return shuffleArray(word.split('')).join('');
}

export function calculateScore(correct: number, total: number, timeBonus: number = 0): number {
  const baseScore = Math.round((correct / total) * 100);
  return Math.min(100, baseScore + timeBonus);
}

export function getPassingMessage(score: number, passingScore: number): string {
  if (score >= 90) return "Outstanding! You've mastered this challenge!";
  if (score >= 80) return "Excellent work! Your understanding is strong.";
  if (score >= passingScore) return "Well done! You've passed the challenge.";
  if (score >= passingScore - 10) return "So close! Review and try again.";
  return "Keep learning! Practice makes progress.";
}

// ============================================
// MINI-GAME STATE MANAGEMENT
// ============================================

export interface MiniGameSession {
  type: MiniGameType;
  config: MiniGameConfig;
  startTime: number;
  currentIndex: number;
  answers: any[];
  score: number;
  completed: boolean;
  passed: boolean;
}

export function createMiniGameSession(type: MiniGameType, config: MiniGameConfig): MiniGameSession {
  return {
    type,
    config,
    startTime: Date.now(),
    currentIndex: 0,
    answers: [],
    score: 0,
    completed: false,
    passed: false,
  };
}

export function completeMiniGame(session: MiniGameSession, finalScore: number): MiniGameSession {
  return {
    ...session,
    score: finalScore,
    completed: true,
    passed: finalScore >= session.config.passingScore,
  };
}
