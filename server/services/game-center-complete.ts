/**
 * Game Center Complete Service
 * Full implementation of Fleet Command, Hearts, Knowledge Quest, and Advanced Escape Room
 */

// ============================================================================
// FLEET COMMAND - Naval Strategy Game
// ============================================================================

export type ShipType = 'carrier' | 'battleship' | 'cruiser' | 'submarine' | 'destroyer';
export type CellState = 'empty' | 'ship' | 'hit' | 'miss' | 'sunk';

export interface FleetCommandGame {
  id: string;
  status: 'setup' | 'playing' | 'finished';
  currentPlayer: 1 | 2;
  player1: FleetPlayer;
  player2: FleetPlayer;
  winner?: 1 | 2;
  moves: FleetMove[];
  startedAt: number;
  finishedAt?: number;
}

export interface FleetPlayer {
  id: string;
  name: string;
  board: CellState[][];
  ships: Ship[];
  shotsRemaining: number;
}

export interface Ship {
  type: ShipType;
  size: number;
  positions: { row: number; col: number }[];
  hits: number;
  sunk: boolean;
}

export interface FleetMove {
  player: 1 | 2;
  row: number;
  col: number;
  result: 'hit' | 'miss' | 'sunk';
  timestamp: number;
}

const SHIP_SIZES: Record<ShipType, number> = {
  carrier: 5,
  battleship: 4,
  cruiser: 3,
  submarine: 3,
  destroyer: 2
};

export function createFleetCommandGame(player1Name: string, player2Name: string): FleetCommandGame {
  const createEmptyBoard = (): CellState[][] => 
    Array(10).fill(null).map(() => Array(10).fill('empty'));

  return {
    id: `FLEET-${Date.now().toString(36).toUpperCase()}`,
    status: 'setup',
    currentPlayer: 1,
    player1: {
      id: `P1-${Date.now().toString(36)}`,
      name: player1Name,
      board: createEmptyBoard(),
      ships: [],
      shotsRemaining: 0
    },
    player2: {
      id: `P2-${Date.now().toString(36)}`,
      name: player2Name,
      board: createEmptyBoard(),
      ships: [],
      shotsRemaining: 0
    },
    moves: [],
    startedAt: Date.now()
  };
}

export function placeShip(
  game: FleetCommandGame,
  playerNum: 1 | 2,
  shipType: ShipType,
  startRow: number,
  startCol: number,
  horizontal: boolean
): boolean {
  const player = playerNum === 1 ? game.player1 : game.player2;
  const size = SHIP_SIZES[shipType];
  const positions: { row: number; col: number }[] = [];

  // Check if ship already placed
  if (player.ships.some(s => s.type === shipType)) return false;

  // Calculate positions and validate
  for (let i = 0; i < size; i++) {
    const row = horizontal ? startRow : startRow + i;
    const col = horizontal ? startCol + i : startCol;

    if (row < 0 || row >= 10 || col < 0 || col >= 10) return false;
    if (player.board[row][col] !== 'empty') return false;

    positions.push({ row, col });
  }

  // Place ship
  const ship: Ship = {
    type: shipType,
    size,
    positions,
    hits: 0,
    sunk: false
  };

  positions.forEach(pos => {
    player.board[pos.row][pos.col] = 'ship';
  });

  player.ships.push(ship);
  return true;
}

export function startFleetGame(game: FleetCommandGame): boolean {
  if (game.player1.ships.length !== 5 || game.player2.ships.length !== 5) return false;
  game.status = 'playing';
  return true;
}

export function fireShot(game: FleetCommandGame, row: number, col: number): FleetMove | null {
  if (game.status !== 'playing') return null;

  const attacker = game.currentPlayer;
  const defender = attacker === 1 ? game.player2 : game.player1;

  if (row < 0 || row >= 10 || col < 0 || col >= 10) return null;
  if (defender.board[row][col] === 'hit' || defender.board[row][col] === 'miss') return null;

  let result: 'hit' | 'miss' | 'sunk' = 'miss';

  if (defender.board[row][col] === 'ship') {
    defender.board[row][col] = 'hit';
    result = 'hit';

    // Find and update ship
    for (const ship of defender.ships) {
      const hitPos = ship.positions.find(p => p.row === row && p.col === col);
      if (hitPos) {
        ship.hits++;
        if (ship.hits === ship.size) {
          ship.sunk = true;
          result = 'sunk';
          ship.positions.forEach(p => {
            defender.board[p.row][p.col] = 'sunk';
          });
        }
        break;
      }
    }
  } else {
    defender.board[row][col] = 'miss';
  }

  const move: FleetMove = {
    player: attacker,
    row,
    col,
    result,
    timestamp: Date.now()
  };

  game.moves.push(move);

  // Check for winner
  if (defender.ships.every(s => s.sunk)) {
    game.status = 'finished';
    game.winner = attacker;
    game.finishedAt = Date.now();
  } else {
    game.currentPlayer = attacker === 1 ? 2 : 1;
  }

  return move;
}

// ============================================================================
// HEARTS - Card Game
// ============================================================================

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
  value: number;
}

export interface HeartsGame {
  id: string;
  status: 'passing' | 'playing' | 'finished';
  players: HeartsPlayer[];
  currentTrick: TrickCard[];
  tricks: Trick[];
  heartsBroken: boolean;
  round: number;
  passDirection: 'left' | 'right' | 'across' | 'none';
  leadPlayer: number;
  currentPlayer: number;
}

export interface HeartsPlayer {
  id: string;
  name: string;
  hand: Card[];
  score: number;
  roundScore: number;
  cardsToPass: Card[];
  isAI: boolean;
}

export interface TrickCard {
  playerIndex: number;
  card: Card;
}

export interface Trick {
  cards: TrickCard[];
  winner: number;
  points: number;
}

const RANK_VALUES: Record<Rank, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

function createDeck(): Card[] {
  const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const deck: Card[] = [];

  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank, value: RANK_VALUES[rank] });
    }
  }

  return deck;
}

function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function createHeartsGame(playerNames: string[]): HeartsGame {
  if (playerNames.length !== 4) throw new Error('Hearts requires exactly 4 players');

  const deck = shuffleDeck(createDeck());
  const players: HeartsPlayer[] = playerNames.map((name, i) => ({
    id: `HP-${Date.now().toString(36)}-${i}`,
    name,
    hand: deck.slice(i * 13, (i + 1) * 13).sort((a, b) => {
      const suitOrder = { clubs: 0, diamonds: 1, spades: 2, hearts: 3 };
      if (suitOrder[a.suit] !== suitOrder[b.suit]) return suitOrder[a.suit] - suitOrder[b.suit];
      return a.value - b.value;
    }),
    score: 0,
    roundScore: 0,
    cardsToPass: [],
    isAI: i > 0 // First player is human, rest are AI
  }));

  // Find player with 2 of clubs
  const leadPlayer = players.findIndex(p => 
    p.hand.some(c => c.suit === 'clubs' && c.rank === '2')
  );

  return {
    id: `HEARTS-${Date.now().toString(36).toUpperCase()}`,
    status: 'passing',
    players,
    currentTrick: [],
    tricks: [],
    heartsBroken: false,
    round: 1,
    passDirection: 'left',
    leadPlayer,
    currentPlayer: leadPlayer
  };
}

export function passCards(game: HeartsGame, playerIndex: number, cards: Card[]): boolean {
  if (game.status !== 'passing') return false;
  if (cards.length !== 3) return false;

  const player = game.players[playerIndex];
  
  // Verify player has these cards
  for (const card of cards) {
    const idx = player.hand.findIndex(c => c.suit === card.suit && c.rank === card.rank);
    if (idx === -1) return false;
  }

  player.cardsToPass = cards;
  return true;
}

export function executeCardPass(game: HeartsGame): boolean {
  if (game.passDirection === 'none') {
    game.status = 'playing';
    return true;
  }

  // Check all players have selected cards
  if (!game.players.every(p => p.cardsToPass.length === 3)) return false;

  const offsets = { left: 1, right: 3, across: 2, none: 0 };
  const offset = offsets[game.passDirection];

  // Remove cards from hands and collect
  const passedCards = game.players.map(p => {
    const cards = p.cardsToPass;
    p.hand = p.hand.filter(c => !cards.some(pc => pc.suit === c.suit && pc.rank === c.rank));
    p.cardsToPass = [];
    return cards;
  });

  // Distribute to recipients
  game.players.forEach((p, i) => {
    const fromIndex = (i - offset + 4) % 4;
    p.hand.push(...passedCards[fromIndex]);
    p.hand.sort((a, b) => {
      const suitOrder = { clubs: 0, diamonds: 1, spades: 2, hearts: 3 };
      if (suitOrder[a.suit] !== suitOrder[b.suit]) return suitOrder[a.suit] - suitOrder[b.suit];
      return a.value - b.value;
    });
  });

  game.status = 'playing';
  return true;
}

export function playCard(game: HeartsGame, playerIndex: number, card: Card): boolean {
  if (game.status !== 'playing') return false;
  if (playerIndex !== game.currentPlayer) return false;

  const player = game.players[playerIndex];
  const cardIndex = player.hand.findIndex(c => c.suit === card.suit && c.rank === card.rank);
  if (cardIndex === -1) return false;

  // First trick must lead 2 of clubs
  if (game.tricks.length === 0 && game.currentTrick.length === 0) {
    if (card.suit !== 'clubs' || card.rank !== '2') return false;
  }

  // Must follow suit if possible
  if (game.currentTrick.length > 0) {
    const leadSuit = game.currentTrick[0].card.suit;
    const hasSuit = player.hand.some(c => c.suit === leadSuit);
    if (hasSuit && card.suit !== leadSuit) return false;
  }

  // Can't lead hearts until broken (unless only hearts left)
  if (game.currentTrick.length === 0 && card.suit === 'hearts' && !game.heartsBroken) {
    if (player.hand.some(c => c.suit !== 'hearts')) return false;
  }

  // Can't play hearts or queen of spades on first trick
  if (game.tricks.length === 0) {
    if (card.suit === 'hearts' || (card.suit === 'spades' && card.rank === 'Q')) {
      if (player.hand.some(c => c.suit !== 'hearts' && !(c.suit === 'spades' && c.rank === 'Q'))) {
        return false;
      }
    }
  }

  // Play the card
  player.hand.splice(cardIndex, 1);
  game.currentTrick.push({ playerIndex, card });

  // Check if hearts broken
  if (card.suit === 'hearts') game.heartsBroken = true;

  // If trick complete, determine winner
  if (game.currentTrick.length === 4) {
    const leadSuit = game.currentTrick[0].card.suit;
    let winnerIndex = 0;
    let highestValue = 0;

    game.currentTrick.forEach((tc, i) => {
      if (tc.card.suit === leadSuit && tc.card.value > highestValue) {
        highestValue = tc.card.value;
        winnerIndex = i;
      }
    });

    const winner = game.currentTrick[winnerIndex].playerIndex;
    let points = 0;
    game.currentTrick.forEach(tc => {
      if (tc.card.suit === 'hearts') points += 1;
      if (tc.card.suit === 'spades' && tc.card.rank === 'Q') points += 13;
    });

    game.players[winner].roundScore += points;

    game.tricks.push({
      cards: [...game.currentTrick],
      winner,
      points
    });

    game.currentTrick = [];
    game.currentPlayer = winner;

    // Check if round over
    if (game.players[0].hand.length === 0) {
      endHeartsRound(game);
    }
  } else {
    game.currentPlayer = (game.currentPlayer + 1) % 4;
  }

  return true;
}

function endHeartsRound(game: HeartsGame): void {
  // Check for shooting the moon
  const moonShooter = game.players.findIndex(p => p.roundScore === 26);
  if (moonShooter !== -1) {
    game.players.forEach((p, i) => {
      if (i === moonShooter) {
        p.score += 0;
      } else {
        p.score += 26;
      }
    });
  } else {
    game.players.forEach(p => {
      p.score += p.roundScore;
    });
  }

  // Check for game over (100 points)
  if (game.players.some(p => p.score >= 100)) {
    game.status = 'finished';
  } else {
    // Start new round
    game.round++;
    game.players.forEach(p => p.roundScore = 0);
    game.tricks = [];
    game.heartsBroken = false;
    
    const directions: ('left' | 'right' | 'across' | 'none')[] = ['left', 'right', 'across', 'none'];
    game.passDirection = directions[(game.round - 1) % 4];
    
    // Deal new hands
    const deck = shuffleDeck(createDeck());
    game.players.forEach((p, i) => {
      p.hand = deck.slice(i * 13, (i + 1) * 13);
    });

    game.status = game.passDirection === 'none' ? 'playing' : 'passing';
  }
}

export function getHeartsWinner(game: HeartsGame): HeartsPlayer | null {
  if (game.status !== 'finished') return null;
  return game.players.reduce((lowest, p) => p.score < lowest.score ? p : lowest);
}

// ============================================================================
// KNOWLEDGE QUEST - Trivia Game
// ============================================================================

export type TriviaCategory = 'land' | 'air' | 'water' | 'self' | 'finance' | 'history' | 'science' | 'general';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface KnowledgeQuestGame {
  id: string;
  status: 'playing' | 'finished';
  player: QuestPlayer;
  currentQuestion: TriviaQuestion | null;
  questionsAnswered: number;
  correctAnswers: number;
  streak: number;
  maxStreak: number;
  categories: TriviaCategory[];
  difficulty: Difficulty;
  timeLimit: number; // seconds per question
  history: QuestionResult[];
}

export interface QuestPlayer {
  id: string;
  name: string;
  score: number;
  tokens: number;
  achievements: string[];
}

export interface TriviaQuestion {
  id: string;
  category: TriviaCategory;
  difficulty: Difficulty;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  points: number;
  timeStarted: number;
}

export interface QuestionResult {
  questionId: string;
  category: TriviaCategory;
  correct: boolean;
  timeTaken: number;
  pointsEarned: number;
}

// Question bank
const TRIVIA_QUESTIONS: Omit<TriviaQuestion, 'id' | 'timeStarted'>[] = [
  // LAND category
  { category: 'land', difficulty: 'easy', question: 'What is the process of buying property called?', options: ['Renting', 'Purchasing', 'Leasing', 'Mortgaging'], correctIndex: 1, explanation: 'Purchasing is the act of buying property.', points: 100 },
  { category: 'land', difficulty: 'medium', question: 'What document proves ownership of real estate?', options: ['Lease', 'Deed', 'Contract', 'Receipt'], correctIndex: 1, explanation: 'A deed is the legal document that transfers property ownership.', points: 200 },
  { category: 'land', difficulty: 'hard', question: 'What is adverse possession?', options: ['Illegal occupation', 'Legal claim through continuous use', 'Temporary rental', 'Property tax'], correctIndex: 1, explanation: 'Adverse possession allows someone to claim ownership after continuous, open use for a statutory period.', points: 300 },
  // AIR category
  { category: 'air', difficulty: 'easy', question: 'What is the primary purpose of education?', options: ['Entertainment', 'Knowledge acquisition', 'Social status', 'Income'], correctIndex: 1, explanation: 'Education primarily aims to acquire knowledge and skills.', points: 100 },
  { category: 'air', difficulty: 'medium', question: 'What is critical thinking?', options: ['Negative thinking', 'Objective analysis', 'Quick decisions', 'Memorization'], correctIndex: 1, explanation: 'Critical thinking involves objective analysis and evaluation of information.', points: 200 },
  // WATER category
  { category: 'water', difficulty: 'easy', question: 'What is emotional intelligence?', options: ['IQ score', 'Managing emotions', 'Academic success', 'Physical health'], correctIndex: 1, explanation: 'Emotional intelligence is the ability to understand and manage emotions.', points: 100 },
  { category: 'water', difficulty: 'medium', question: 'What is the benefit of meditation?', options: ['Physical strength', 'Stress reduction', 'Weight loss', 'Memory improvement'], correctIndex: 1, explanation: 'Meditation is primarily known for reducing stress and promoting mental clarity.', points: 200 },
  // SELF category
  { category: 'self', difficulty: 'easy', question: 'What is a personal budget?', options: ['Business plan', 'Income/expense tracker', 'Investment portfolio', 'Tax return'], correctIndex: 1, explanation: 'A personal budget tracks income and expenses.', points: 100 },
  { category: 'self', difficulty: 'medium', question: 'What is compound interest?', options: ['Simple interest', 'Interest on interest', 'Fixed rate', 'Variable rate'], correctIndex: 1, explanation: 'Compound interest is interest calculated on both principal and accumulated interest.', points: 200 },
  // FINANCE category
  { category: 'finance', difficulty: 'easy', question: 'What is an asset?', options: ['Debt', 'Something of value', 'Expense', 'Liability'], correctIndex: 1, explanation: 'An asset is something of value that you own.', points: 100 },
  { category: 'finance', difficulty: 'medium', question: 'What is diversification?', options: ['Concentration', 'Spreading investments', 'Single stock', 'Day trading'], correctIndex: 1, explanation: 'Diversification means spreading investments across different assets to reduce risk.', points: 200 },
  { category: 'finance', difficulty: 'hard', question: 'What is a 501(c)(3)?', options: ['Business license', 'Tax-exempt nonprofit', 'Corporation type', 'Bank account'], correctIndex: 1, explanation: 'A 501(c)(3) is a tax-exempt nonprofit organization designation.', points: 300 },
  // GENERAL category
  { category: 'general', difficulty: 'easy', question: 'What is an LLC?', options: ['Large Loan Company', 'Limited Liability Company', 'Legal License Certificate', 'Long-term Lease Contract'], correctIndex: 1, explanation: 'LLC stands for Limited Liability Company.', points: 100 },
  { category: 'general', difficulty: 'medium', question: 'What is a trust?', options: ['Bank account', 'Legal arrangement for assets', 'Insurance policy', 'Stock certificate'], correctIndex: 1, explanation: 'A trust is a legal arrangement where assets are held by one party for the benefit of another.', points: 200 },
];

export function createKnowledgeQuestGame(
  playerName: string,
  categories: TriviaCategory[] = ['land', 'air', 'water', 'self'],
  difficulty: Difficulty = 'medium'
): KnowledgeQuestGame {
  return {
    id: `QUEST-${Date.now().toString(36).toUpperCase()}`,
    status: 'playing',
    player: {
      id: `QP-${Date.now().toString(36)}`,
      name: playerName,
      score: 0,
      tokens: 0,
      achievements: []
    },
    currentQuestion: null,
    questionsAnswered: 0,
    correctAnswers: 0,
    streak: 0,
    maxStreak: 0,
    categories,
    difficulty,
    timeLimit: difficulty === 'easy' ? 30 : difficulty === 'medium' ? 20 : 15,
    history: []
  };
}

export function getNextQuestion(game: KnowledgeQuestGame): TriviaQuestion | null {
  if (game.status !== 'playing') return null;

  const availableQuestions = TRIVIA_QUESTIONS.filter(q => 
    game.categories.includes(q.category) &&
    (q.difficulty === game.difficulty || game.difficulty === 'medium') &&
    !game.history.some(h => h.questionId === `Q-${TRIVIA_QUESTIONS.indexOf(q)}`)
  );

  if (availableQuestions.length === 0) {
    game.status = 'finished';
    return null;
  }

  const randomQ = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
  const question: TriviaQuestion = {
    ...randomQ,
    id: `Q-${TRIVIA_QUESTIONS.indexOf(randomQ)}`,
    timeStarted: Date.now()
  };

  game.currentQuestion = question;
  return question;
}

export function answerQuestion(game: KnowledgeQuestGame, answerIndex: number): QuestionResult | null {
  if (!game.currentQuestion) return null;

  const timeTaken = (Date.now() - game.currentQuestion.timeStarted) / 1000;
  const correct = answerIndex === game.currentQuestion.correctIndex;
  const timeBonus = Math.max(0, Math.floor((game.timeLimit - timeTaken) * 10));
  const streakBonus = game.streak * 50;
  const pointsEarned = correct ? game.currentQuestion.points + timeBonus + streakBonus : 0;

  if (correct) {
    game.correctAnswers++;
    game.streak++;
    game.maxStreak = Math.max(game.maxStreak, game.streak);
    game.player.score += pointsEarned;
    game.player.tokens += Math.floor(pointsEarned / 100);
  } else {
    game.streak = 0;
  }

  game.questionsAnswered++;

  const result: QuestionResult = {
    questionId: game.currentQuestion.id,
    category: game.currentQuestion.category,
    correct,
    timeTaken,
    pointsEarned
  };

  game.history.push(result);
  game.currentQuestion = null;

  // Check achievements
  if (game.correctAnswers === 10 && !game.player.achievements.includes('SCHOLAR')) {
    game.player.achievements.push('SCHOLAR');
  }
  if (game.maxStreak >= 5 && !game.player.achievements.includes('STREAK_MASTER')) {
    game.player.achievements.push('STREAK_MASTER');
  }

  return result;
}

export function endKnowledgeQuest(game: KnowledgeQuestGame): { score: number; accuracy: number; tokens: number } {
  game.status = 'finished';
  const accuracy = game.questionsAnswered > 0 ? (game.correctAnswers / game.questionsAnswered) * 100 : 0;
  return {
    score: game.player.score,
    accuracy: Math.round(accuracy),
    tokens: game.player.tokens
  };
}

// ============================================================================
// ADVANCED ESCAPE ROOM - Puzzle Game
// ============================================================================

export type PuzzleType = 'cipher' | 'logic' | 'pattern' | 'math' | 'word' | 'sequence';

export interface EscapeRoomGame {
  id: string;
  status: 'playing' | 'escaped' | 'failed';
  roomName: string;
  difficulty: Difficulty;
  players: EscapePlayer[];
  puzzles: EscapePuzzle[];
  currentPuzzleIndex: number;
  hints: EscapeHint[];
  hintsUsed: number;
  maxHints: number;
  timeLimit: number; // minutes
  timeRemaining: number; // seconds
  startedAt: number;
  completedAt?: number;
}

export interface EscapePlayer {
  id: string;
  name: string;
  contributions: number;
}

export interface EscapePuzzle {
  id: string;
  type: PuzzleType;
  name: string;
  description: string;
  clue: string;
  solution: string;
  solved: boolean;
  attempts: number;
  maxAttempts: number;
  points: number;
  hints: string[];
}

export interface EscapeHint {
  puzzleId: string;
  hint: string;
  cost: number; // points deducted
  usedAt: number;
}

const ESCAPE_PUZZLES: Omit<EscapePuzzle, 'id' | 'solved' | 'attempts'>[] = [
  {
    type: 'cipher',
    name: 'The Caesar Code',
    description: 'A message is encoded using a simple shift cipher.',
    clue: 'KHOOR ZRUOG (shift 3)',
    solution: 'HELLO WORLD',
    maxAttempts: 5,
    points: 100,
    hints: ['Each letter is shifted by the same amount', 'Try shifting backwards', 'H becomes K when shifted by 3']
  },
  {
    type: 'logic',
    name: 'The Safe Combination',
    description: 'Find the 4-digit code to open the safe.',
    clue: 'The sum of digits is 10. First digit is double the last. Middle digits are the same.',
    solution: '4222',
    maxAttempts: 5,
    points: 150,
    hints: ['If last digit is 2, first is 4', 'Middle digits must sum to 4', '2+2=4, and 4+2+2+2=10']
  },
  {
    type: 'pattern',
    name: 'The Sequence',
    description: 'Complete the pattern.',
    clue: '2, 4, 8, 16, ?',
    solution: '32',
    maxAttempts: 3,
    points: 100,
    hints: ['Each number relates to the previous', 'Think multiplication', 'Each number is doubled']
  },
  {
    type: 'math',
    name: 'The Equation',
    description: 'Solve for X.',
    clue: '3X + 7 = 22',
    solution: '5',
    maxAttempts: 3,
    points: 100,
    hints: ['Subtract 7 from both sides', '3X = 15', 'Divide by 3']
  },
  {
    type: 'word',
    name: 'The Anagram',
    description: 'Unscramble the word related to finance.',
    clue: 'STESAS',
    solution: 'ASSETS',
    maxAttempts: 5,
    points: 100,
    hints: ['It\'s something you own', 'Opposite of liabilities', 'Starts with A']
  },
  {
    type: 'sequence',
    name: 'The Lock Code',
    description: 'Find the next number in the Fibonacci sequence.',
    clue: '1, 1, 2, 3, 5, 8, ?',
    solution: '13',
    maxAttempts: 3,
    points: 150,
    hints: ['Each number is the sum of the two before it', '5 + 8 = ?', 'Famous mathematical sequence']
  }
];

export function createEscapeRoomGame(
  roomName: string,
  playerNames: string[],
  difficulty: Difficulty = 'medium'
): EscapeRoomGame {
  const timeLimit = difficulty === 'easy' ? 60 : difficulty === 'medium' ? 45 : 30;
  const maxHints = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 5 : 3;
  
  const puzzleCount = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 4 : 6;
  const shuffledPuzzles = [...ESCAPE_PUZZLES].sort(() => Math.random() - 0.5).slice(0, puzzleCount);

  return {
    id: `ESCAPE-${Date.now().toString(36).toUpperCase()}`,
    status: 'playing',
    roomName,
    difficulty,
    players: playerNames.map((name, i) => ({
      id: `EP-${Date.now().toString(36)}-${i}`,
      name,
      contributions: 0
    })),
    puzzles: shuffledPuzzles.map((p, i) => ({
      ...p,
      id: `PUZ-${i}`,
      solved: false,
      attempts: 0
    })),
    currentPuzzleIndex: 0,
    hints: [],
    hintsUsed: 0,
    maxHints,
    timeLimit,
    timeRemaining: timeLimit * 60,
    startedAt: Date.now()
  };
}

export function getCurrentPuzzle(game: EscapeRoomGame): EscapePuzzle | null {
  if (game.status !== 'playing') return null;
  if (game.currentPuzzleIndex >= game.puzzles.length) return null;
  return game.puzzles[game.currentPuzzleIndex];
}

export function attemptSolution(game: EscapeRoomGame, playerIndex: number, answer: string): { correct: boolean; message: string } {
  if (game.status !== 'playing') return { correct: false, message: 'Game is not active' };

  const puzzle = getCurrentPuzzle(game);
  if (!puzzle) return { correct: false, message: 'No current puzzle' };

  puzzle.attempts++;
  const correct = answer.toUpperCase().trim() === puzzle.solution.toUpperCase().trim();

  if (correct) {
    puzzle.solved = true;
    game.players[playerIndex].contributions++;
    game.currentPuzzleIndex++;

    if (game.currentPuzzleIndex >= game.puzzles.length) {
      game.status = 'escaped';
      game.completedAt = Date.now();
      return { correct: true, message: 'Congratulations! You escaped!' };
    }

    return { correct: true, message: 'Correct! Moving to next puzzle.' };
  }

  if (puzzle.attempts >= puzzle.maxAttempts) {
    game.status = 'failed';
    return { correct: false, message: 'Too many attempts. Game over!' };
  }

  return { correct: false, message: `Incorrect. ${puzzle.maxAttempts - puzzle.attempts} attempts remaining.` };
}

export function useHint(game: EscapeRoomGame): string | null {
  if (game.status !== 'playing') return null;
  if (game.hintsUsed >= game.maxHints) return null;

  const puzzle = getCurrentPuzzle(game);
  if (!puzzle) return null;

  const usedHintsForPuzzle = game.hints.filter(h => h.puzzleId === puzzle.id).length;
  if (usedHintsForPuzzle >= puzzle.hints.length) return null;

  const hint = puzzle.hints[usedHintsForPuzzle];
  game.hints.push({
    puzzleId: puzzle.id,
    hint,
    cost: 25,
    usedAt: Date.now()
  });
  game.hintsUsed++;

  return hint;
}

export function calculateEscapeScore(game: EscapeRoomGame): number {
  if (game.status !== 'escaped') return 0;

  const baseScore = game.puzzles.reduce((sum, p) => sum + (p.solved ? p.points : 0), 0);
  const hintPenalty = game.hints.reduce((sum, h) => sum + h.cost, 0);
  const timeBonus = Math.floor(game.timeRemaining / 60) * 10;

  return Math.max(0, baseScore - hintPenalty + timeBonus);
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export const gameCenterCompleteService = {
  // Fleet Command
  createFleetCommandGame,
  placeShip,
  startFleetGame,
  fireShot,
  // Hearts
  createHeartsGame,
  passCards,
  executeCardPass,
  playCard,
  getHeartsWinner,
  // Knowledge Quest
  createKnowledgeQuestGame,
  getNextQuestion,
  answerQuestion,
  endKnowledgeQuest,
  // Escape Room
  createEscapeRoomGame,
  getCurrentPuzzle,
  attemptSolution,
  useHint,
  calculateEscapeScore
};

export default gameCenterCompleteService;
