import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RotateCcw, Trophy, Brain, Flag, Users, Wifi, Building2, Lightbulb, Zap } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useGameCompletion } from "@/hooks/useGameCompletion";
import GameModeSelector, { GameMode, Difficulty, AIPersonality } from "@/components/games/GameModeSelector";

type PieceType = "king" | "queen" | "rook" | "bishop" | "knight" | "pawn";
type PieceColor = "white" | "black";
type Piece = { type: PieceType; color: PieceColor } | null;
type Board = Piece[][];
type Position = { row: number; col: number };

const pieceSymbols: Record<PieceColor, Record<PieceType, string>> = {
  white: { king: "♔", queen: "♕", rook: "♖", bishop: "♗", knight: "♘", pawn: "♙" },
  black: { king: "♚", queen: "♛", rook: "♜", bishop: "♝", knight: "♞", pawn: "♟" },
};

const pieceValues: Record<PieceType, number> = {
  pawn: 100,
  knight: 320,
  bishop: 330,
  rook: 500,
  queen: 900,
  king: 20000,
};

const pawnTable = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5, 5, 10, 25, 25, 10, 5, 5],
  [0, 0, 0, 20, 20, 0, 0, 0],
  [5, -5, -10, 0, 0, -10, -5, 5],
  [5, 10, 10, -20, -20, 10, 10, 5],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

const knightTable = [
  [-50, -40, -30, -30, -30, -30, -40, -50],
  [-40, -20, 0, 0, 0, 0, -20, -40],
  [-30, 0, 10, 15, 15, 10, 0, -30],
  [-30, 5, 15, 20, 20, 15, 5, -30],
  [-30, 0, 15, 20, 20, 15, 0, -30],
  [-30, 5, 10, 15, 15, 10, 5, -30],
  [-40, -20, 0, 5, 5, 0, -20, -40],
  [-50, -40, -30, -30, -30, -30, -40, -50],
];

const createInitialBoard = (): Board => {
  const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
  
  board[0] = [
    { type: "rook", color: "black" },
    { type: "knight", color: "black" },
    { type: "bishop", color: "black" },
    { type: "queen", color: "black" },
    { type: "king", color: "black" },
    { type: "bishop", color: "black" },
    { type: "knight", color: "black" },
    { type: "rook", color: "black" },
  ];
  board[1] = Array(8).fill(null).map(() => ({ type: "pawn" as PieceType, color: "black" as PieceColor }));
  
  board[6] = Array(8).fill(null).map(() => ({ type: "pawn" as PieceType, color: "white" as PieceColor }));
  board[7] = [
    { type: "rook", color: "white" },
    { type: "knight", color: "white" },
    { type: "bishop", color: "white" },
    { type: "queen", color: "white" },
    { type: "king", color: "white" },
    { type: "bishop", color: "white" },
    { type: "knight", color: "white" },
    { type: "rook", color: "white" },
  ];
  
  return board;
};

export default function Chess() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>("ai");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [aiPersonality, setAIPersonality] = useState<AIPersonality>("balanced");

  const [board, setBoard] = useState<Board>(createInitialBoard());
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<PieceColor>("white");
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<PieceColor | "draw" | null>(null);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [capturedPieces, setCapturedPieces] = useState<{ white: Piece[]; black: Piece[] }>({ white: [], black: [] });
  const [isThinking, setIsThinking] = useState(false);
  const [tokensAwarded, setTokensAwarded] = useState(false);
  const [teachingHint, setTeachingHint] = useState<string | null>(null);
  const [scores, setScores] = useState({ player1: 0, player2: 0, draws: 0 });
  const { completeGame } = useGameCompletion();

  const getValidMoves = useCallback((board: Board, pos: Position, checkKingSafety = true): Position[] => {
    const piece = board[pos.row][pos.col];
    if (!piece) return [];

    const moves: Position[] = [];
    const { row, col } = pos;
    const color = piece.color;
    const enemyColor = color === "white" ? "black" : "white";

    const addMoveIfValid = (r: number, c: number, canCapture = true, mustCapture = false) => {
      if (r < 0 || r > 7 || c < 0 || c > 7) return false;
      const target = board[r][c];
      if (!target) {
        if (!mustCapture) moves.push({ row: r, col: c });
        return true;
      }
      if (target.color === enemyColor && canCapture) {
        moves.push({ row: r, col: c });
      }
      return false;
    };

    const addSlidingMoves = (directions: [number, number][]) => {
      for (const [dr, dc] of directions) {
        for (let i = 1; i < 8; i++) {
          if (!addMoveIfValid(row + dr * i, col + dc * i)) break;
          if (board[row + dr * i]?.[col + dc * i]) break;
        }
      }
    };

    switch (piece.type) {
      case "pawn": {
        const direction = color === "white" ? -1 : 1;
        const startRow = color === "white" ? 6 : 1;
        
        if (!board[row + direction]?.[col]) {
          moves.push({ row: row + direction, col });
          if (row === startRow && !board[row + 2 * direction]?.[col]) {
            moves.push({ row: row + 2 * direction, col });
          }
        }
        
        for (const dc of [-1, 1]) {
          const target = board[row + direction]?.[col + dc];
          if (target && target.color === enemyColor) {
            moves.push({ row: row + direction, col: col + dc });
          }
        }
        break;
      }
      
      case "knight": {
        const knightMoves = [
          [-2, -1], [-2, 1], [-1, -2], [-1, 2],
          [1, -2], [1, 2], [2, -1], [2, 1],
        ];
        for (const [dr, dc] of knightMoves) {
          addMoveIfValid(row + dr, col + dc);
        }
        break;
      }
      
      case "bishop":
        addSlidingMoves([[-1, -1], [-1, 1], [1, -1], [1, 1]]);
        break;
      
      case "rook":
        addSlidingMoves([[-1, 0], [1, 0], [0, -1], [0, 1]]);
        break;
      
      case "queen":
        addSlidingMoves([[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]]);
        break;
      
      case "king": {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            addMoveIfValid(row + dr, col + dc);
          }
        }
        break;
      }
    }

    if (checkKingSafety) {
      return moves.filter(move => {
        const testBoard = board.map(r => [...r]);
        testBoard[move.row][move.col] = testBoard[pos.row][pos.col];
        testBoard[pos.row][pos.col] = null;
        return !isKingInCheck(testBoard, color);
      });
    }

    return moves;
  }, []);

  const isKingInCheck = useCallback((board: Board, color: PieceColor): boolean => {
    let kingPos: Position | null = null;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece?.type === "king" && piece.color === color) {
          kingPos = { row: r, col: c };
          break;
        }
      }
      if (kingPos) break;
    }
    if (!kingPos) return false;

    const enemyColor = color === "white" ? "black" : "white";
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece?.color === enemyColor) {
          const moves = getValidMoves(board, { row: r, col: c }, false);
          if (moves.some(m => m.row === kingPos!.row && m.col === kingPos!.col)) {
            return true;
          }
        }
      }
    }
    return false;
  }, [getValidMoves]);

  const checkGameEnd = useCallback((board: Board, color: PieceColor): "checkmate" | "stalemate" | null => {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece?.color === color) {
          const moves = getValidMoves(board, { row: r, col: c });
          if (moves.length > 0) return null;
        }
      }
    }

    if (isKingInCheck(board, color)) {
      return "checkmate";
    }
    return "stalemate";
  }, [getValidMoves, isKingInCheck]);

  const evaluateBoard = useCallback((board: Board): number => {
    let score = 0;
    
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (!piece) continue;
        
        let value = pieceValues[piece.type];
        
        if (piece.type === "pawn") {
          value += piece.color === "white" ? pawnTable[r][c] : pawnTable[7 - r][c];
        } else if (piece.type === "knight") {
          value += piece.color === "white" ? knightTable[r][c] : knightTable[7 - r][c];
        }
        
        score += piece.color === "black" ? value : -value;
      }
    }
    
    return score;
  }, []);

  const minimax = useCallback((
    board: Board,
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean
  ): number => {
    if (depth === 0) return evaluateBoard(board);

    const color = isMaximizing ? "black" : "white";
    const gameEnd = checkGameEnd(board, color);
    
    if (gameEnd === "checkmate") {
      return isMaximizing ? -100000 : 100000;
    }
    if (gameEnd === "stalemate") return 0;

    const allMoves: { from: Position; to: Position }[] = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece?.color === color) {
          const moves = getValidMoves(board, { row: r, col: c });
          for (const move of moves) {
            allMoves.push({ from: { row: r, col: c }, to: move });
          }
        }
      }
    }

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of allMoves) {
        const newBoard = board.map(r => [...r]);
        newBoard[move.to.row][move.to.col] = newBoard[move.from.row][move.from.col];
        newBoard[move.from.row][move.from.col] = null;
        const evalScore = minimax(newBoard, depth - 1, alpha, beta, false);
        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of allMoves) {
        const newBoard = board.map(r => [...r]);
        newBoard[move.to.row][move.to.col] = newBoard[move.from.row][move.from.col];
        newBoard[move.from.row][move.from.col] = null;
        const evalScore = minimax(newBoard, depth - 1, alpha, beta, true);
        minEval = Math.min(minEval, evalScore);
        beta = Math.min(beta, evalScore);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }, [evaluateBoard, checkGameEnd, getValidMoves]);

  const makeAIMove = useCallback(() => {
    setIsThinking(true);
    setTeachingHint(null);
    
    setTimeout(() => {
      const allMoves: { from: Position; to: Position; score?: number }[] = [];
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const piece = board[r][c];
          if (piece?.color === "black") {
            const moves = getValidMoves(board, { row: r, col: c });
            for (const move of moves) {
              allMoves.push({ from: { row: r, col: c }, to: move });
            }
          }
        }
      }

      if (allMoves.length === 0) {
        setIsThinking(false);
        return;
      }

      let bestMove = allMoves[0];
      let explanation = "";

      // Easy: random moves
      if (difficulty === "easy") {
        bestMove = allMoves[Math.floor(Math.random() * allMoves.length)];
        explanation = "I'm playing randomly to help you practice!";
      } 
      // Random personality
      else if (aiPersonality === "random") {
        bestMove = allMoves[Math.floor(Math.random() * allMoves.length)];
        explanation = "Playing unpredictably!";
      }
      // Aggressive: prioritize captures and attacks
      else if (aiPersonality === "aggressive") {
        const captures = allMoves.filter(m => board[m.to.row][m.to.col] !== null);
        if (captures.length > 0) {
          // Sort by captured piece value
          captures.sort((a, b) => {
            const aVal = board[a.to.row][a.to.col] ? pieceValues[board[a.to.row][a.to.col]!.type] : 0;
            const bVal = board[b.to.row][b.to.col] ? pieceValues[board[b.to.row][b.to.col]!.type] : 0;
            return bVal - aVal;
          });
          bestMove = captures[0];
          explanation = "Attacking aggressively!";
        } else {
          // Move pieces forward
          const depth = difficulty === "medium" ? 2 : 3;
          let bestScore = -Infinity;
          for (const move of allMoves) {
            const newBoard = board.map(r => [...r]);
            newBoard[move.to.row][move.to.col] = newBoard[move.from.row][move.from.col];
            newBoard[move.from.row][move.from.col] = null;
            const score = minimax(newBoard, depth, -Infinity, Infinity, false);
            if (score > bestScore) {
              bestScore = score;
              bestMove = move;
            }
          }
          explanation = "Building an attack position!";
        }
      }
      // Defensive: prioritize king safety and blocking
      else if (aiPersonality === "defensive") {
        const depth = difficulty === "medium" ? 2 : 3;
        let bestScore = -Infinity;
        for (const move of allMoves) {
          const newBoard = board.map(r => [...r]);
          newBoard[move.to.row][move.to.col] = newBoard[move.from.row][move.from.col];
          newBoard[move.from.row][move.from.col] = null;
          // Add bonus for moves that don't leave pieces hanging
          let score = minimax(newBoard, depth, -Infinity, Infinity, false);
          // Prefer moves that keep pieces safe
          const piece = board[move.from.row][move.from.col];
          if (piece && !isKingInCheck(newBoard, "black")) {
            score += 50;
          }
          if (score > bestScore) {
            bestScore = score;
            bestMove = move;
          }
        }
        explanation = "Playing defensively to protect my pieces.";
      }
      // Balanced/Teaching: use minimax
      else {
        const depth = difficulty === "medium" ? 2 : 4;
        let bestScore = -Infinity;
        for (const move of allMoves) {
          const newBoard = board.map(r => [...r]);
          newBoard[move.to.row][move.to.col] = newBoard[move.from.row][move.from.col];
          newBoard[move.from.row][move.from.col] = null;
          const score = minimax(newBoard, depth, -Infinity, Infinity, false);
          if (score > bestScore) {
            bestScore = score;
            bestMove = move;
          }
        }
        
        if (aiPersonality === "teaching") {
          const piece = board[bestMove.from.row][bestMove.from.col];
          const captured = board[bestMove.to.row][bestMove.to.col];
          if (captured) {
            explanation = `Tip: I captured your ${captured.type}. Try to protect your pieces by looking ahead!`;
          } else if (piece?.type === "pawn" && (bestMove.to.row === 0 || bestMove.to.row === 7)) {
            explanation = "Tip: Pawns promote to Queens when they reach the opposite end!";
          } else if (isKingInCheck(board, "white")) {
            explanation = "Tip: Your king is in check! You must move it or block the attack.";
          } else {
            explanation = "Tip: Control the center of the board for better piece mobility!";
          }
        } else {
          explanation = "Playing the optimal move based on position analysis.";
        }
      }

      // Execute the move
      const newBoard = board.map(r => [...r]);
      const movingPiece = newBoard[bestMove.from.row][bestMove.from.col];
      const capturedPiece = newBoard[bestMove.to.row][bestMove.to.col];
      
      if (capturedPiece) {
        setCapturedPieces(prev => ({
          ...prev,
          white: [...prev.white, capturedPiece]
        }));
      }
      
      newBoard[bestMove.to.row][bestMove.to.col] = movingPiece;
      newBoard[bestMove.from.row][bestMove.from.col] = null;
      
      // Pawn promotion
      if (movingPiece?.type === "pawn" && bestMove.to.row === 7) {
        newBoard[bestMove.to.row][bestMove.to.col] = { type: "queen", color: "black" };
      }
      
      setBoard(newBoard);
      
      const cols = "abcdefgh";
      const moveNotation = `${cols[bestMove.from.col]}${8 - bestMove.from.row}-${cols[bestMove.to.col]}${8 - bestMove.to.row}`;
      setMoveHistory(prev => [...prev, moveNotation]);
      
      if (aiPersonality === "teaching") {
        setTeachingHint(explanation);
      }
      
      const gameEnd = checkGameEnd(newBoard, "white");
      if (gameEnd === "checkmate") {
        setGameOver(true);
        setWinner("black");
        setScores(prev => ({ ...prev, player2: prev.player2 + 1 }));
        toast.error("Checkmate! AI wins.");
      } else if (gameEnd === "stalemate") {
        setGameOver(true);
        setWinner("draw");
        setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
        toast.info("Stalemate! It's a draw.");
      } else {
        if (isKingInCheck(newBoard, "white")) {
          toast.warning("Check!");
        }
        setCurrentPlayer("white");
      }
      
      setIsThinking(false);
    }, 500);
  }, [board, difficulty, aiPersonality, getValidMoves, minimax, checkGameEnd, isKingInCheck]);

  const handleSquareClick = (row: number, col: number) => {
    if (gameOver || isThinking) return;
    if (gameMode === "ai" && currentPlayer !== "white") return;

    const piece = board[row][col];
    
    if (selectedSquare) {
      const isValidMove = validMoves.some(m => m.row === row && m.col === col);
      
      if (isValidMove) {
        const newBoard = board.map(r => [...r]);
        const movingPiece = newBoard[selectedSquare.row][selectedSquare.col];
        const capturedPiece = newBoard[row][col];
        
        if (capturedPiece) {
          const captureKey = currentPlayer === "white" ? "black" : "white";
          setCapturedPieces(prev => ({
            ...prev,
            [captureKey]: [...prev[captureKey], capturedPiece]
          }));
        }
        
        newBoard[row][col] = movingPiece;
        newBoard[selectedSquare.row][selectedSquare.col] = null;
        
        // Pawn promotion
        if (movingPiece?.type === "pawn" && (row === 0 || row === 7)) {
          newBoard[row][col] = { type: "queen", color: movingPiece.color };
        }
        
        setBoard(newBoard);
        setSelectedSquare(null);
        setValidMoves([]);
        setTeachingHint(null);
        
        const cols = "abcdefgh";
        const moveNotation = `${cols[selectedSquare.col]}${8 - selectedSquare.row}-${cols[col]}${8 - row}`;
        setMoveHistory(prev => [...prev, moveNotation]);
        
        const nextPlayer = currentPlayer === "white" ? "black" : "white";
        const gameEnd = checkGameEnd(newBoard, nextPlayer);
        
        if (gameEnd === "checkmate") {
          setGameOver(true);
          setWinner(currentPlayer);
          if (currentPlayer === "white") {
            setScores(prev => ({ ...prev, player1: prev.player1 + 1 }));
          } else {
            setScores(prev => ({ ...prev, player2: prev.player2 + 1 }));
          }
          toast.success(gameMode === "local" ? `${currentPlayer} wins by checkmate!` : "Checkmate! You win! 🎉");
          if (!tokensAwarded && gameMode === "ai") {
            completeGame("chess", true, difficulty === "hard" ? 50 : difficulty === "medium" ? 30 : 15);
            setTokensAwarded(true);
          }
        } else if (gameEnd === "stalemate") {
          setGameOver(true);
          setWinner("draw");
          setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
          toast.info("Stalemate! It's a draw.");
        } else {
          if (isKingInCheck(newBoard, nextPlayer)) {
            toast.info("Check!");
          }
          setCurrentPlayer(nextPlayer);
        }
      } else if (piece?.color === currentPlayer) {
        setSelectedSquare({ row, col });
        setValidMoves(getValidMoves(board, { row, col }));
      } else {
        setSelectedSquare(null);
        setValidMoves([]);
      }
    } else if (piece?.color === currentPlayer) {
      setSelectedSquare({ row, col });
      setValidMoves(getValidMoves(board, { row, col }));
    }
  };

  // AI move effect
  useEffect(() => {
    if (gameMode === "ai" && currentPlayer === "black" && !gameOver && gameStarted) {
      makeAIMove();
    }
  }, [currentPlayer, gameOver, gameStarted, gameMode, makeAIMove]);

  const handleStartGame = (config: { mode: GameMode; difficulty: Difficulty; personality: AIPersonality }) => {
    setGameMode(config.mode);
    setDifficulty(config.difficulty);
    setAIPersonality(config.personality);
    setGameStarted(true);
    resetGame();
  };

  const resetGame = () => {
    setBoard(createInitialBoard());
    setSelectedSquare(null);
    setValidMoves([]);
    setCurrentPlayer("white");
    setGameOver(false);
    setWinner(null);
    setMoveHistory([]);
    setCapturedPieces({ white: [], black: [] });
    setIsThinking(false);
    setTokensAwarded(false);
    setTeachingHint(null);
  };

  const backToModeSelect = () => {
    setGameStarted(false);
    setScores({ player1: 0, player2: 0, draws: 0 });
    resetGame();
  };

  const getSquareColor = (row: number, col: number) => {
    const isLight = (row + col) % 2 === 0;
    const isSelected = selectedSquare?.row === row && selectedSquare?.col === col;
    const isValidMove = validMoves.some(m => m.row === row && m.col === col);
    const hasCapture = isValidMove && board[row][col];

    if (isSelected) return "bg-yellow-400/60";
    if (hasCapture) return isLight ? "bg-red-300" : "bg-red-500";
    if (isValidMove) return isLight ? "bg-green-300" : "bg-green-500";
    return isLight ? "bg-amber-100" : "bg-amber-700";
  };

  const getModeIcon = () => {
    switch (gameMode) {
      case "ai": return <Brain className="w-3 h-3" />;
      case "local": return <Users className="w-3 h-3" />;
      case "online": return <Wifi className="w-3 h-3" />;
      case "intrasystem": return <Building2 className="w-3 h-3" />;
    }
  };

  const getModeLabel = () => {
    switch (gameMode) {
      case "ai": return `vs AI (${difficulty})`;
      case "local": return "Local 2P";
      case "online": return "Online";
      case "intrasystem": return "House Battle";
    }
  };

  if (!gameStarted) {
    return (
      <DashboardLayout>
        <div className="space-y-6 max-w-2xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/game-center">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Chess</h1>
              <p className="text-sm text-muted-foreground">Classic strategy game</p>
            </div>
          </div>
          
          <GameModeSelector
            gameName="Chess"
            onStart={handleStartGame}
            supportedModes={["ai", "local", "online", "intrasystem"]}
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={backToModeSelect}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Chess</h1>
              <p className="text-sm text-muted-foreground">Classic strategy game</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              {getModeIcon()}
              {getModeLabel()}
            </Badge>
            {isThinking && (
              <Badge variant="secondary" className="animate-pulse gap-1">
                <Zap className="w-3 h-3" />
                AI Thinking...
              </Badge>
            )}
          </div>
        </div>

        {/* Teaching Hint */}
        {aiPersonality === "teaching" && teachingHint && (
          <Card className="border-blue-500/50 bg-blue-500/10">
            <CardContent className="py-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-blue-500" />
                <p className="text-sm">{teachingHint}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scores */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-white drop-shadow-[0_0_2px_rgba(0,0,0,0.8)]">{scores.player1}</p>
              <p className="text-sm text-muted-foreground">{gameMode === "local" ? "White" : "You (White)"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-muted-foreground">{scores.draws}</p>
              <p className="text-sm text-muted-foreground">Draws</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-gray-800">{scores.player2}</p>
              <p className="text-sm text-muted-foreground">{gameMode === "local" ? "Black" : `AI (${aiPersonality})`}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Board */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  {gameOver ? (
                    winner === "white" ? (
                      <>
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        {gameMode === "local" ? "White Wins!" : "You Win!"}
                      </>
                    ) : winner === "black" ? (
                      <>
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        {gameMode === "local" ? "Black Wins!" : "AI Wins!"}
                      </>
                    ) : (
                      <>
                        <Flag className="w-5 h-5" />
                        Draw
                      </>
                    )
                  ) : (
                    <>
                      <div className={`w-4 h-4 rounded-full ${currentPlayer === "white" ? "bg-white border border-gray-400" : "bg-gray-800"}`} />
                      {gameMode === "local" 
                        ? `${currentPlayer === "white" ? "White" : "Black"}'s Turn`
                        : currentPlayer === "white" ? "Your Turn" : "AI's Turn"
                      }
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  {/* Captured pieces (black) */}
                  <div className="h-8 flex items-center gap-1 mb-2">
                    {capturedPieces.white.map((p, i) => (
                      <span key={i} className="text-xl">{p && pieceSymbols[p.color][p.type]}</span>
                    ))}
                  </div>

                  {/* Board */}
                  <div className="border-2 border-amber-900 rounded">
                    {board.map((row, rowIdx) => (
                      <div key={rowIdx} className="flex">
                        {row.map((piece, colIdx) => (
                          <button
                            key={colIdx}
                            onClick={() => handleSquareClick(rowIdx, colIdx)}
                            disabled={isThinking || gameOver || (gameMode === "ai" && currentPlayer !== "white")}
                            className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-2xl md:text-3xl transition-colors ${getSquareColor(rowIdx, colIdx)}`}
                          >
                            {piece && pieceSymbols[piece.color][piece.type]}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>

                  {/* Captured pieces (white) */}
                  <div className="h-8 flex items-center gap-1 mt-2">
                    {capturedPieces.black.map((p, i) => (
                      <span key={i} className="text-xl">{p && pieceSymbols[p.color][p.type]}</span>
                    ))}
                  </div>

                  {/* Controls */}
                  <div className="flex gap-2 mt-4">
                    <Button onClick={resetGame} variant="outline" className="gap-2">
                      <RotateCcw className="w-4 h-4" />
                      New Game
                    </Button>
                    <Button onClick={backToModeSelect} variant="ghost">
                      Change Mode
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-4">
            {/* Move History */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Move History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-48 overflow-y-auto text-sm font-mono">
                  {moveHistory.length === 0 ? (
                    <p className="text-muted-foreground">No moves yet</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-1">
                      {moveHistory.map((move, i) => (
                        <div key={i} className={i % 2 === 0 ? "text-foreground" : "text-muted-foreground"}>
                          {Math.floor(i / 2) + 1}. {move}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">How to Play</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• {gameMode === "local" ? "White plays first, then Black" : "You play as White, AI plays as Black"}</p>
                <p>• Click a piece to see valid moves (green)</p>
                <p>• Click a highlighted square to move</p>
                <p>• Capture enemy pieces (red squares)</p>
                <p>• Checkmate the opponent's King to win!</p>
                <p>• Pawns auto-promote to Queens</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
