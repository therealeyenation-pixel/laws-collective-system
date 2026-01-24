import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RotateCcw, Trophy, Crown, Circle } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

type Player = "red" | "black";
type PieceType = "regular" | "king";
type Piece = { player: Player; type: PieceType } | null;
type Board = Piece[][];
type Position = { row: number; col: number };

const BOARD_SIZE = 8;

export default function Checkers() {
  const [board, setBoard] = useState<Board>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player>("red");
  const [selectedPiece, setSelectedPiece] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [mustCapture, setMustCapture] = useState<Position[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<Player | null>(null);
  const [scores, setScores] = useState({ red: 12, black: 12 });

  const initializeBoard = (): Board => {
    const newBoard: Board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
    
    // Place black pieces (top)
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if ((row + col) % 2 === 1) {
          newBoard[row][col] = { player: "black", type: "regular" };
        }
      }
    }
    
    // Place red pieces (bottom)
    for (let row = 5; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if ((row + col) % 2 === 1) {
          newBoard[row][col] = { player: "red", type: "regular" };
        }
      }
    }
    
    return newBoard;
  };

  const resetGame = () => {
    setBoard(initializeBoard());
    setCurrentPlayer("red");
    setSelectedPiece(null);
    setValidMoves([]);
    setMustCapture([]);
    setGameOver(false);
    setWinner(null);
    setScores({ red: 12, black: 12 });
  };

  useEffect(() => {
    resetGame();
  }, []);

  const getValidMoves = (row: number, col: number, board: Board): { moves: Position[]; captures: Position[] } => {
    const piece = board[row][col];
    if (!piece) return { moves: [], captures: [] };

    const moves: Position[] = [];
    const captures: Position[] = [];
    const directions: number[] = [];

    // Regular pieces can only move forward
    if (piece.type === "regular") {
      directions.push(piece.player === "red" ? -1 : 1);
    } else {
      // Kings can move in both directions
      directions.push(-1, 1);
    }

    for (const dRow of directions) {
      for (const dCol of [-1, 1]) {
        const newRow = row + dRow;
        const newCol = col + dCol;

        if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
          if (!board[newRow][newCol]) {
            moves.push({ row: newRow, col: newCol });
          } else if (board[newRow][newCol]?.player !== piece.player) {
            // Check for capture
            const jumpRow = newRow + dRow;
            const jumpCol = newCol + dCol;
            if (
              jumpRow >= 0 && jumpRow < BOARD_SIZE &&
              jumpCol >= 0 && jumpCol < BOARD_SIZE &&
              !board[jumpRow][jumpCol]
            ) {
              captures.push({ row: jumpRow, col: jumpCol });
            }
          }
        }
      }
    }

    return { moves, captures };
  };

  const findAllCaptures = (player: Player, board: Board): Position[] => {
    const capturePieces: Position[] = [];
    
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const piece = board[row][col];
        if (piece && piece.player === player) {
          const { captures } = getValidMoves(row, col, board);
          if (captures.length > 0) {
            capturePieces.push({ row, col });
          }
        }
      }
    }
    
    return capturePieces;
  };

  useEffect(() => {
    if (!gameOver) {
      const captures = findAllCaptures(currentPlayer, board);
      setMustCapture(captures);
    }
  }, [currentPlayer, board, gameOver]);

  const handleCellClick = (row: number, col: number) => {
    if (gameOver) return;

    const piece = board[row][col];

    // If clicking on own piece, select it
    if (piece && piece.player === currentPlayer) {
      // If must capture, only allow selecting pieces that can capture
      if (mustCapture.length > 0 && !mustCapture.some(p => p.row === row && p.col === col)) {
        toast.info("You must make a capture!");
        return;
      }

      setSelectedPiece({ row, col });
      const { moves, captures } = getValidMoves(row, col, board);
      
      // If there are captures available, only show captures
      if (mustCapture.length > 0) {
        setValidMoves(captures);
      } else {
        setValidMoves([...moves, ...captures]);
      }
      return;
    }

    // If a piece is selected and clicking on a valid move
    if (selectedPiece && validMoves.some(m => m.row === row && m.col === col)) {
      const newBoard = board.map(r => r.map(c => c ? { ...c } : null));
      const movingPiece = newBoard[selectedPiece.row][selectedPiece.col]!;
      
      // Check if this is a capture move
      const rowDiff = Math.abs(row - selectedPiece.row);
      const isCapture = rowDiff === 2;

      if (isCapture) {
        // Remove captured piece
        const capturedRow = (row + selectedPiece.row) / 2;
        const capturedCol = (col + selectedPiece.col) / 2;
        newBoard[capturedRow][capturedCol] = null;
        
        // Update scores
        setScores(prev => ({
          ...prev,
          [currentPlayer === "red" ? "black" : "red"]: prev[currentPlayer === "red" ? "black" : "red"] - 1
        }));
      }

      // Move piece
      newBoard[selectedPiece.row][selectedPiece.col] = null;
      newBoard[row][col] = movingPiece;

      // Check for king promotion
      if (
        (movingPiece.player === "red" && row === 0) ||
        (movingPiece.player === "black" && row === BOARD_SIZE - 1)
      ) {
        newBoard[row][col] = { ...movingPiece, type: "king" };
        toast.success("Crowned! Your piece is now a King!");
      }

      setBoard(newBoard);

      // Check for additional captures (multi-jump)
      if (isCapture) {
        const { captures } = getValidMoves(row, col, newBoard);
        if (captures.length > 0) {
          setSelectedPiece({ row, col });
          setValidMoves(captures);
          setMustCapture([{ row, col }]);
          return;
        }
      }

      // Check for win condition
      const opponentPieces = newBoard.flat().filter(p => p && p.player !== currentPlayer);
      if (opponentPieces.length === 0) {
        setGameOver(true);
        setWinner(currentPlayer);
        toast.success(`${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)} wins! 🎉`);
        return;
      }

      // Switch player
      setCurrentPlayer(currentPlayer === "red" ? "black" : "red");
      setSelectedPiece(null);
      setValidMoves([]);
    }
  };

  const getCellStyle = (row: number, col: number) => {
    const isLight = (row + col) % 2 === 0;
    const isSelected = selectedPiece?.row === row && selectedPiece?.col === col;
    const isValidMove = validMoves.some(m => m.row === row && m.col === col);
    const isMustCapture = mustCapture.some(p => p.row === row && p.col === col);

    let style = "w-10 h-10 md:w-12 md:h-12 flex items-center justify-center transition-all ";
    
    if (isLight) {
      style += "bg-amber-100 ";
    } else {
      style += "bg-amber-800 ";
    }

    if (isSelected) {
      style += "ring-2 ring-yellow-400 ring-inset ";
    }

    if (isValidMove) {
      style += "cursor-pointer after:content-[''] after:w-3 after:h-3 after:rounded-full after:bg-green-500/50 after:absolute relative ";
    }

    if (isMustCapture && !isSelected) {
      style += "ring-2 ring-orange-500 ring-inset ";
    }

    return style;
  };

  const renderPiece = (piece: Piece) => {
    if (!piece) return null;

    const baseStyle = "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-105 ";
    const colorStyle = piece.player === "red" 
      ? "bg-red-600 border-2 border-red-800" 
      : "bg-gray-900 border-2 border-gray-700";

    return (
      <div className={baseStyle + colorStyle}>
        {piece.type === "king" && (
          <Crown className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
        )}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/game-center">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Checkers</h1>
              <p className="text-sm text-muted-foreground">Classic strategy board game</p>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={`gap-1 ${currentPlayer === "red" ? "border-red-500 text-red-500" : "border-gray-500"}`}
          >
            <Circle className={`w-3 h-3 ${currentPlayer === "red" ? "fill-red-500" : "fill-gray-900"}`} />
            {currentPlayer === "red" ? "Red" : "Black"}'s Turn
          </Badge>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-2 gap-4">
          <Card className={currentPlayer === "red" ? "ring-2 ring-red-500" : ""}>
            <CardContent className="pt-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-600" />
                <p className="text-2xl font-bold">{scores.red}</p>
              </div>
              <p className="text-xs text-muted-foreground">Red Pieces</p>
            </CardContent>
          </Card>
          <Card className={currentPlayer === "black" ? "ring-2 ring-gray-500" : ""}>
            <CardContent className="pt-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gray-900" />
                <p className="text-2xl font-bold">{scores.black}</p>
              </div>
              <p className="text-xs text-muted-foreground">Black Pieces</p>
            </CardContent>
          </Card>
        </div>

        {/* Game Board */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {gameOver ? (
                <>
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  {winner === "red" ? "Red" : "Black"} Wins!
                </>
              ) : mustCapture.length > 0 ? (
                "You must capture!"
              ) : (
                "Make your move"
              )}
            </CardTitle>
            <CardDescription>
              {gameOver
                ? "Click New Game to play again"
                : `${currentPlayer === "red" ? "Red" : "Black"} to move`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              {/* Board */}
              <div className="border-4 border-amber-900 rounded">
                {board.map((row, rowIdx) => (
                  <div key={rowIdx} className="flex">
                    {row.map((cell, colIdx) => (
                      <div
                        key={`${rowIdx}-${colIdx}`}
                        onClick={() => handleCellClick(rowIdx, colIdx)}
                        className={getCellStyle(rowIdx, colIdx)}
                      >
                        {renderPiece(cell)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Controls */}
              <Button onClick={resetGame} variant="outline" className="gap-2">
                <RotateCcw className="w-4 h-4" />
                New Game
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How to Play</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• Click a piece to select it, then click a valid square to move</p>
            <p>• Pieces move diagonally forward on dark squares</p>
            <p>• Jump over opponent pieces to capture them</p>
            <p>• If you can capture, you must capture (highlighted in orange)</p>
            <p>• Reach the opposite end to crown your piece as a King</p>
            <p>• Kings can move and capture in any diagonal direction</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
