import { lazy, Suspense, ComponentType } from "react";
import { Loader2 } from "lucide-react";

// Loading fallback component
const GameLoading = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-4">
      <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
      <p className="text-muted-foreground">Loading game...</p>
    </div>
  </div>
);

// Lazy load wrapper
export function lazyGame<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) {
  const LazyComponent = lazy(importFn);
  return (props: any) => (
    <Suspense fallback={<GameLoading />}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

// Pre-defined lazy game imports
export const LazyTicTacToe = lazyGame(() => import("@/pages/games/TicTacToe"));
export const LazyMemoryMatch = lazyGame(() => import("@/pages/games/MemoryMatch"));
export const LazyConnectFour = lazyGame(() => import("@/pages/games/ConnectFour"));
export const LazySudoku = lazyGame(() => import("@/pages/games/Sudoku"));
export const LazyWordSearch = lazyGame(() => import("@/pages/games/WordSearch"));
export const LazyHangman = lazyGame(() => import("@/pages/games/Hangman"));
export const LazySnake = lazyGame(() => import("@/pages/games/Snake"));
export const LazyCheckers = lazyGame(() => import("@/pages/games/Checkers"));
export const LazyGame2048 = lazyGame(() => import("@/pages/games/Game2048"));
export const LazyChess = lazyGame(() => import("@/pages/games/Chess"));
export const LazyBattleship = lazyGame(() => import("@/pages/games/Battleship"));
export const LazySolitaire = lazyGame(() => import("@/pages/games/Solitaire"));
export const LazyLAWSQuest = lazyGame(() => import("@/pages/games/LAWSQuest"));
export const LazyDualPathJourney = lazyGame(() => import("@/pages/games/DualPathJourney"));
export const LazySovereigntyJourney = lazyGame(() => import("@/pages/games/SovereigntyJourney"));
export const LazyRainbowJourney = lazyGame(() => import("@/pages/games/RainbowJourney"));
export const LazyLogicPuzzles = lazyGame(() => import("@/pages/games/LogicPuzzles"));
export const LazySpiderSolitaire = lazyGame(() => import("@/pages/games/SpiderSolitaire"));
export const LazyWordForge = lazyGame(() => import("@/pages/games/WordForge"));
export const LazyCrosswordMaster = lazyGame(() => import("@/pages/games/CrosswordMaster"));
export const LazyClimbSlide = lazyGame(() => import("@/pages/games/ClimbSlide"));
export const LazyEscapeRoom = lazyGame(() => import("@/pages/games/EscapeRoom"));
export const LazyDetectiveAcademy = lazyGame(() => import("@/pages/games/DetectiveAcademy"));
export const LazyRubiksCube = lazyGame(() => import("@/pages/games/RubiksCube"));
export const LazySpades = lazyGame(() => import("@/pages/games/Spades"));
export const LazyYahtzee = lazyGame(() => import("@/pages/games/Yahtzee"));
export const LazyScrabbleGame = lazyGame(() => import("@/pages/games/ScrabbleGame"));
export const LazyDominoes = lazyGame(() => import("@/pages/games/Dominoes"));
export const LazyMancala = lazyGame(() => import("@/pages/games/Mancala"));
export const LazyMahjongSolitaire = lazyGame(() => import("@/pages/games/MahjongSolitaire"));
export const LazyBackgammon = lazyGame(() => import("@/pages/games/Backgammon"));
export const LazyTangram = lazyGame(() => import("@/pages/games/Tangram"));
export const LazyWordLadder = lazyGame(() => import("@/pages/games/WordLadder"));
export const LazyTriviaChallenge = lazyGame(() => import("@/pages/games/TriviaChallenge"));
export const LazySimonSays = lazyGame(() => import("@/pages/games/SimonSays"));
