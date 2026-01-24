import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, RotateCcw, Trophy, Brain, Flag, Undo2 } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useGameCompletion } from "@/hooks/useGameCompletion";

type PieceType = "king" | "queen" | "rook" | "bishop" | "knight" | "pawn";
type PieceColor = "white" | "black";
type Piece = { type: PieceType; color: PieceColor } | null;
type Board = Piece[][];
type Position = { row: number; col: number };
type Difficulty = "easy" | "medium" | "hard";

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

// Position evaluation tables for better AI
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
  
  // Black pieces (top)
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
  
  // White pieces (bottom)
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
  const [board, setBoard] = useState<Board>(createInitialBoard());
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<PieceColor>("white");
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<PieceColor | "draw" | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [capturedPieces, setCapturedPieces] = useState<{ white: Piece[]; black: Piece[] }>({ white: [], black: [] });
  const [isThinking, setIsThinking] = useState(false);
  const [tokensAwarded, setTokensAwarded] = useState(false);
  const { completeGame } = useGameCompletion();

  // Get all valid moves for a piece
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
        
        // Forward move
        if (!board[row + direction]?.[col]) {
          moves.push({ row: row + direction, col });
          // Double move from start
          if (row === startRow && !board[row + 2 * direction]?.[col]) {
            moves.push({ row: row + 2 * direction, col });
          }
        }
        
        // Captures
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

    // Filter moves that would put own king in check
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

  // Check if king is in check
  const isKingInCheck = useCallback((board: Board, color: PieceColor): boolean => {
    // Find king position
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

    // Check if any enemy piece can capture the king
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

  // Check for checkmate or stalemate
  const checkGameEnd = useCallback((board: Board, color: PieceColor): "checkmate" | "stalemate" | null => {
    // Check if player has any valid moves
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece?.color === color) {
          const moves = getValidMoves(board, { row: r, col: c });
          if (moves.length > 0) return null;
        }
      }
    }

    // No valid moves - check if in check
    if (isKingInCheck(board, color)) {
      return "checkmate";
    }
    return "stalemate";
  }, [getValidMoves, isKingInCheck]);

  // Evaluate board position for AI
  const evaluateBoard = useCallback((board: Board): number => {
    let score = 0;
    
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (!piece) continue;
        
        let value = pieceValues[piece.type];
        
        // Add position bonus
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

  // Minimax with alpha-beta pruning
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

  // AI move
  const makeAIMove = useCallback(() => {
    setIsThinking(true);
    
    setTimeout(() => {
      const allMoves: { from: Position; to: Position; score: number }[] = [];
      
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const piece = board[r][c];
          if (piece?.color === "black") {
            const moves = getValidMoves(board, { row: r, col: c });
            for (const move of moves) {
              const newBoard = board.map(row => [...row]);
              newBoard[move.row][move.col] = newBoard[r][c];
              newBoard[r][c] = null;
              
              const depth = difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3;
              const score = minimax(newBoard, depth, -Infinity, Infinity, false);
              
              allMoves.push({ from: { row: r, col: c }, to: move, score });
            }
          }
        }
      }

      if (allMoves.length === 0) {
        setIsThinking(false);
        return;
      }

      // Sort by score and pick best (or random for easy)
      allMoves.sort((a, b) => b.score - a.score);
      
      let selectedMove;
      if (difficulty === "easy") {
        // Random from top 5 or all if less
        const topMoves = allMoves.slice(0, Math.min(5, allMoves.length));
        selectedMove = topMoves[Math.floor(Math.random() * topMoves.length)];
      } else {
        selectedMove = allMoves[0];
      }

      // Make the move
      const newBoard = board.map(row => [...row]);
      const capturedPiece = newBoard[selectedMove.to.row][selectedMove.to.col];
      
      // Handle pawn promotion
      let movingPiece = newBoard[selectedMove.from.row][selectedMove.from.col];
      if (movingPiece?.type === "pawn" && selectedMove.to.row === 7) {
        movingPiece = { type: "queen", color: "black" };
      }
      
      newBoard[selectedMove.to.row][selectedMove.to.col] = movingPiece;
      newBoard[selectedMove.from.row][selectedMove.from.col] = null;
      
      setBoard(newBoard);
      
      if (capturedPiece) {
        setCapturedPieces(prev => ({
          ...prev,
          black: [...prev.black, capturedPiece],
        }));
      }

      // Add to move history
      const cols = "abcdefgh";
      const moveNotation = `${cols[selectedMove.from.col]}${8 - selectedMove.from.row}-${cols[selectedMove.to.col]}${8 - selectedMove.to.row}`;
      setMoveHistory(prev => [...prev, moveNotation]);

      // Check for game end
      const gameEnd = checkGameEnd(newBoard, "white");
      if (gameEnd) {
        setGameOver(true);
        if (gameEnd === "checkmate") {
          setWinner("black");
          toast.error("Checkmate! AI wins.");
          if (!tokensAwarded) {
            setTokensAwarded(true);
            completeGame({ gameSlug: "chess", won: false, score: moveHistory.length * 10, difficulty });
          }
        } else {
          setWinner("draw");
          toast.info("Stalemate! It's a draw.");
          if (!tokensAwarded) {
            setTokensAwarded(true);
            completeGame({ gameSlug: "chess", won: false, score: moveHistory.length * 15, difficulty });
          }
        }
      } else {
        if (isKingInCheck(newBoard, "white")) {
          toast.warning("Check!");
        }
        setCurrentPlayer("white");
      }
      
      setIsThinking(false);
    }, 500);
  }, [board, difficulty, getValidMoves, minimax, checkGameEnd, isKingInCheck, moveHistory, tokensAwarded, completeGame]);

  // Handle square click
  const handleSquareClick = (row: number, col: number) => {
    if (gameOver || currentPlayer !== "white" || isThinking) return;

    const piece = board[row][col];

    if (selectedSquare) {
      // Check if this is a valid move
      const isValidMove = validMoves.some(m => m.row === row && m.col === col);
      
      if (isValidMove) {
        const newBoard = board.map(r => [...r]);
        const capturedPiece = newBoard[row][col];
        
        // Handle pawn promotion
        let movingPiece = newBoard[selectedSquare.row][selectedSquare.col];
        if (movingPiece?.type === "pawn" && row === 0) {
          movingPiece = { type: "queen", color: "white" };
          toast.success("Pawn promoted to Queen!");
        }
        
        newBoard[row][col] = movingPiece;
        newBoard[selectedSquare.row][selectedSquare.col] = null;
        
        setBoard(newBoard);
        setSelectedSquare(null);
        setValidMoves([]);
        
        if (capturedPiece) {
          setCapturedPieces(prev => ({
            ...prev,
            white: [...prev.white, capturedPiece],
          }));
        }

        // Add to move history
        const cols = "abcdefgh";
        const moveNotation = `${cols[selectedSquare.col]}${8 - selectedSquare.row}-${cols[col]}${8 - row}`;
        setMoveHistory(prev => [...prev, moveNotation]);

        // Check for game end
        const gameEnd = checkGameEnd(newBoard, "black");
        if (gameEnd) {
          setGameOver(true);
          if (gameEnd === "checkmate") {
            setWinner("white");
            toast.success("Checkmate! You win! 🎉");
            if (!tokensAwarded) {
              setTokensAwarded(true);
              completeGame({ gameSlug: "chess", won: true, score: 1000 + moveHistory.length * 10, difficulty });
            }
          } else {
            setWinner("draw");
            toast.info("Stalemate! It's a draw.");
            if (!tokensAwarded) {
              setTokensAwarded(true);
              completeGame({ gameSlug: "chess", won: false, score: moveHistory.length * 15, difficulty });
            }
          }
        } else {
          if (isKingInCheck(newBoard, "black")) {
            toast.info("Check!");
          }
          setCurrentPlayer("black");
        }
      } else if (piece?.color === "white") {
        // Select different piece
        setSelectedSquare({ row, col });
        setValidMoves(getValidMoves(board, { row, col }));
      } else {
        setSelectedSquare(null);
        setValidMoves([]);
      }
    } else if (piece?.color === "white") {
      setSelectedSquare({ row, col });
      setValidMoves(getValidMoves(board, { row, col }));
    }
  };

  // AI move effect
  useEffect(() => {
    if (currentPlayer === "black" && !gameOver) {
      makeAIMove();
    }
  }, [currentPlayer, gameOver, makeAIMove]);

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

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
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
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Brain className="w-3 h-3" />
              {difficulty === "easy" ? "Easy" : difficulty === "medium" ? "Medium" : "Hard"}
            </Badge>
            {isThinking && (
              <Badge variant="secondary" className="animate-pulse">
                AI Thinking...
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Board */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {gameOver ? (
                      winner === "white" ? (
                        <>
                          <Trophy className="w-5 h-5 text-yellow-500" />
                          You Win!
                        </>
                      ) : winner === "black" ? (
                        "AI Wins!"
                      ) : (
                        <>
                          <Flag className="w-5 h-5" />
                          Draw
                        </>
                      )
                    ) : currentPlayer === "white" ? (
                      "Your Turn (White)"
                    ) : (
                      "AI's Turn (Black)"
                    )}
                  </CardTitle>
                  <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                            disabled={isThinking || gameOver}
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
                <p>• You play as White, AI plays as Black</p>
                <p>• Click a piece to see valid moves (green)</p>
                <p>• Click a highlighted square to move</p>
                <p>• Capture enemy pieces (red squares)</p>
                <p>• Checkmate the AI's King to win!</p>
                <p>• Pawns auto-promote to Queens</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
