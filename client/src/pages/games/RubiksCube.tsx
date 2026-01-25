import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, RotateCcw, Trophy, Clock, Move, Lightbulb, Play, Pause } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

type Face = 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom';
type Color = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'white';

interface CubeState {
  front: Color[][];
  back: Color[][];
  left: Color[][];
  right: Color[][];
  top: Color[][];
  bottom: Color[][];
}

const COLORS: Record<Face, Color> = {
  front: 'red',
  back: 'orange',
  left: 'green',
  right: 'blue',
  top: 'white',
  bottom: 'yellow',
};

const COLOR_CLASSES: Record<Color, string> = {
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  yellow: 'bg-yellow-400',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  white: 'bg-white border border-gray-300',
};

const createSolvedCube = (): CubeState => ({
  front: Array(3).fill(null).map(() => Array(3).fill('red')),
  back: Array(3).fill(null).map(() => Array(3).fill('orange')),
  left: Array(3).fill(null).map(() => Array(3).fill('green')),
  right: Array(3).fill(null).map(() => Array(3).fill('blue')),
  top: Array(3).fill(null).map(() => Array(3).fill('white')),
  bottom: Array(3).fill(null).map(() => Array(3).fill('yellow')),
});

const rotateFaceClockwise = (face: Color[][]): Color[][] => {
  const newFace: Color[][] = Array(3).fill(null).map(() => Array(3).fill('white'));
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      newFace[j][2 - i] = face[i][j];
    }
  }
  return newFace;
};

const rotateFaceCounterClockwise = (face: Color[][]): Color[][] => {
  const newFace: Color[][] = Array(3).fill(null).map(() => Array(3).fill('white'));
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      newFace[2 - j][i] = face[i][j];
    }
  }
  return newFace;
};

const deepCopyCube = (cube: CubeState): CubeState => ({
  front: cube.front.map(row => [...row]),
  back: cube.back.map(row => [...row]),
  left: cube.left.map(row => [...row]),
  right: cube.right.map(row => [...row]),
  top: cube.top.map(row => [...row]),
  bottom: cube.bottom.map(row => [...row]),
});

// Cube rotation functions
const rotateR = (cube: CubeState): CubeState => {
  const newCube = deepCopyCube(cube);
  newCube.right = rotateFaceClockwise(cube.right);
  for (let i = 0; i < 3; i++) {
    newCube.front[i][2] = cube.bottom[i][2];
    newCube.top[i][2] = cube.front[i][2];
    newCube.back[2-i][0] = cube.top[i][2];
    newCube.bottom[i][2] = cube.back[2-i][0];
  }
  return newCube;
};

const rotateL = (cube: CubeState): CubeState => {
  const newCube = deepCopyCube(cube);
  newCube.left = rotateFaceClockwise(cube.left);
  for (let i = 0; i < 3; i++) {
    newCube.front[i][0] = cube.top[i][0];
    newCube.bottom[i][0] = cube.front[i][0];
    newCube.back[2-i][2] = cube.bottom[i][0];
    newCube.top[i][0] = cube.back[2-i][2];
  }
  return newCube;
};

const rotateU = (cube: CubeState): CubeState => {
  const newCube = deepCopyCube(cube);
  newCube.top = rotateFaceClockwise(cube.top);
  newCube.front[0] = [...cube.right[0]];
  newCube.left[0] = [...cube.front[0]];
  newCube.back[0] = [...cube.left[0]];
  newCube.right[0] = [...cube.back[0]];
  return newCube;
};

const rotateD = (cube: CubeState): CubeState => {
  const newCube = deepCopyCube(cube);
  newCube.bottom = rotateFaceClockwise(cube.bottom);
  newCube.front[2] = [...cube.left[2]];
  newCube.right[2] = [...cube.front[2]];
  newCube.back[2] = [...cube.right[2]];
  newCube.left[2] = [...cube.back[2]];
  return newCube;
};

const rotateF = (cube: CubeState): CubeState => {
  const newCube = deepCopyCube(cube);
  newCube.front = rotateFaceClockwise(cube.front);
  for (let i = 0; i < 3; i++) {
    newCube.top[2][i] = cube.left[2-i][2];
    newCube.right[i][0] = cube.top[2][i];
    newCube.bottom[0][i] = cube.right[2-i][0];
    newCube.left[i][2] = cube.bottom[0][i];
  }
  return newCube;
};

const rotateB = (cube: CubeState): CubeState => {
  const newCube = deepCopyCube(cube);
  newCube.back = rotateFaceClockwise(cube.back);
  for (let i = 0; i < 3; i++) {
    newCube.top[0][i] = cube.right[i][2];
    newCube.left[i][0] = cube.top[0][2-i];
    newCube.bottom[2][i] = cube.left[i][0];
    newCube.right[i][2] = cube.bottom[2][2-i];
  }
  return newCube;
};

const MOVES = [
  { name: 'R', fn: rotateR, description: 'Right clockwise' },
  { name: 'L', fn: rotateL, description: 'Left clockwise' },
  { name: 'U', fn: rotateU, description: 'Up clockwise' },
  { name: 'D', fn: rotateD, description: 'Down clockwise' },
  { name: 'F', fn: rotateF, description: 'Front clockwise' },
  { name: 'B', fn: rotateB, description: 'Back clockwise' },
];

const shuffleCube = (cube: CubeState, moves: number): CubeState => {
  let shuffled = deepCopyCube(cube);
  for (let i = 0; i < moves; i++) {
    const randomMove = MOVES[Math.floor(Math.random() * MOVES.length)];
    shuffled = randomMove.fn(shuffled);
  }
  return shuffled;
};

const countSolvedFaces = (cube: CubeState): number => {
  let count = 0;
  const faces: Face[] = ['front', 'back', 'left', 'right', 'top', 'bottom'];
  for (const face of faces) {
    const faceColors = cube[face];
    const firstColor = faceColors[0][0];
    let isSolved = true;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (faceColors[i][j] !== firstColor) {
          isSolved = false;
          break;
        }
      }
      if (!isSolved) break;
    }
    if (isSolved) count++;
  }
  return count;
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function RubiksCube() {
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'complete'>('menu');
  const [difficulty, setDifficulty] = useState(1);
  const [cube, setCube] = useState<CubeState>(createSolvedCube());
  const [moveCount, setMoveCount] = useState(0);
  const [time, setTime] = useState(0);
  const [bestTimes, setBestTimes] = useState<Record<number, number>>({});
  const [selectedFace, setSelectedFace] = useState<Face>('front');
  const [showHint, setShowHint] = useState(false);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'playing') {
      interval = setInterval(() => {
        setTime(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  // Check for win
  useEffect(() => {
    if (gameState === 'playing') {
      const solvedFaces = countSolvedFaces(cube);
      if (solvedFaces >= difficulty) {
        setGameState('complete');
        const currentBest = bestTimes[difficulty];
        if (!currentBest || time < currentBest) {
          setBestTimes(prev => ({ ...prev, [difficulty]: time }));
          toast.success(`New best time for ${difficulty} color${difficulty > 1 ? 's' : ''}!`);
        } else {
          toast.success('Cube solved!');
        }
      }
    }
  }, [cube, gameState, difficulty, time, bestTimes]);

  const startGame = () => {
    const shuffleMoves = difficulty * 5 + 5; // More shuffles for higher difficulty
    const shuffledCube = shuffleCube(createSolvedCube(), shuffleMoves);
    setCube(shuffledCube);
    setMoveCount(0);
    setTime(0);
    setGameState('playing');
  };

  const makeMove = (moveFn: (cube: CubeState) => CubeState) => {
    if (gameState !== 'playing') return;
    setCube(prev => moveFn(prev));
    setMoveCount(prev => prev + 1);
  };

  const resetGame = () => {
    setGameState('menu');
    setCube(createSolvedCube());
    setMoveCount(0);
    setTime(0);
  };

  const renderFace = (face: Color[][], faceName: Face, size: 'small' | 'large' = 'small') => {
    const cellSize = size === 'large' ? 'w-12 h-12' : 'w-6 h-6';
    const gap = size === 'large' ? 'gap-1' : 'gap-0.5';
    
    return (
      <div className={`grid grid-cols-3 ${gap}`}>
        {face.map((row, i) =>
          row.map((color, j) => (
            <div
              key={`${i}-${j}`}
              className={`${cellSize} ${COLOR_CLASSES[color]} rounded-sm shadow-sm`}
            />
          ))
        )}
      </div>
    );
  };

  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-indigo-900 p-4">
        <Button
          variant="ghost"
          onClick={() => setLocation('/game-center')}
          className="text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Game Center
        </Button>

        <Card className="max-w-md mx-auto p-6 bg-white/10 backdrop-blur border-white/20">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🎲</div>
            <h1 className="text-3xl font-bold text-white mb-2">Rubik's Cube</h1>
            <p className="text-purple-200">
              Solve the cube! Compete for the best time!
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-white font-semibold mb-2">Difficulty (Colors to Solve)</p>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map(level => (
                  <Button
                    key={level}
                    variant={difficulty === level ? "default" : "outline"}
                    onClick={() => setDifficulty(level)}
                    className={difficulty === level ? "bg-purple-600" : "bg-white/10 text-white border-white/30"}
                  >
                    {level} {level === 1 ? 'Color' : 'Colors'}
                  </Button>
                ))}
              </div>
            </div>

            {bestTimes[difficulty] && (
              <div className="text-center p-3 bg-yellow-500/20 rounded-lg">
                <Trophy className="w-5 h-5 inline mr-2 text-yellow-400" />
                <span className="text-yellow-200">
                  Best Time: {formatTime(bestTimes[difficulty])}
                </span>
              </div>
            )}

            <Button
              onClick={startGame}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              size="lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Game
            </Button>

            <div className="text-sm text-purple-200 space-y-1">
              <p>🎯 Solve {difficulty} face{difficulty > 1 ? 's' : ''} to win</p>
              <p>⏱️ Race against the clock</p>
              <p>📊 Compete for best times</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-indigo-900 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={resetGame} className="text-white">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center gap-4 text-white">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span className="font-mono">{formatTime(time)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Move className="w-4 h-4" />
            <span>{moveCount}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setGameState(gameState === 'paused' ? 'playing' : 'paused')}
            className="text-white"
          >
            {gameState === 'paused' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowHint(!showHint)}
            className="text-white"
          >
            <Lightbulb className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Goal */}
      <div className="text-center mb-4">
        <p className="text-purple-200">
          Solve {difficulty} face{difficulty > 1 ? 's' : ''} • 
          Currently solved: {countSolvedFaces(cube)}/{difficulty}
        </p>
      </div>

      {/* Cube Display - Unfolded View */}
      <Card className="max-w-lg mx-auto p-6 bg-white/10 backdrop-blur border-white/20 mb-4">
        <div className="flex flex-col items-center gap-1">
          {/* Top */}
          <div className="flex justify-center">
            <div className="text-center">
              <p className="text-xs text-purple-300 mb-1">Top</p>
              {renderFace(cube.top, 'top')}
            </div>
          </div>
          
          {/* Middle row: Left, Front, Right, Back */}
          <div className="flex gap-1 items-center">
            <div className="text-center">
              <p className="text-xs text-purple-300 mb-1">Left</p>
              {renderFace(cube.left, 'left')}
            </div>
            <div className="text-center">
              <p className="text-xs text-purple-300 mb-1">Front</p>
              {renderFace(cube.front, 'front')}
            </div>
            <div className="text-center">
              <p className="text-xs text-purple-300 mb-1">Right</p>
              {renderFace(cube.right, 'right')}
            </div>
            <div className="text-center">
              <p className="text-xs text-purple-300 mb-1">Back</p>
              {renderFace(cube.back, 'back')}
            </div>
          </div>
          
          {/* Bottom */}
          <div className="flex justify-center">
            <div className="text-center">
              <p className="text-xs text-purple-300 mb-1">Bottom</p>
              {renderFace(cube.bottom, 'bottom')}
            </div>
          </div>
        </div>
      </Card>

      {/* Controls */}
      <Card className="max-w-lg mx-auto p-4 bg-white/10 backdrop-blur border-white/20">
        <p className="text-white text-center mb-3 font-semibold">Rotate Faces</p>
        <div className="grid grid-cols-3 gap-2">
          {MOVES.map(move => (
            <Button
              key={move.name}
              onClick={() => makeMove(move.fn)}
              disabled={gameState !== 'playing'}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {move.name}
              <span className="text-xs ml-1 opacity-70">↻</span>
            </Button>
          ))}
        </div>
        
        {showHint && (
          <div className="mt-4 p-3 bg-yellow-500/20 rounded-lg">
            <p className="text-yellow-200 text-sm">
              <Lightbulb className="w-4 h-4 inline mr-1" />
              Tip: Start by solving one face completely. Look for pieces that already match and build from there!
            </p>
          </div>
        )}
      </Card>

      {/* Paused Overlay */}
      {gameState === 'paused' && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Game Paused</h2>
            <Button onClick={() => setGameState('playing')} size="lg">
              <Play className="w-5 h-5 mr-2" />
              Resume
            </Button>
          </Card>
        </div>
      )}

      {/* Complete Overlay */}
      {gameState === 'complete' && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <Card className="p-8 text-center max-w-sm">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2">Cube Solved!</h2>
            <div className="space-y-2 mb-6">
              <p className="text-lg">
                <Clock className="w-5 h-5 inline mr-2" />
                Time: {formatTime(time)}
              </p>
              <p className="text-lg">
                <Move className="w-5 h-5 inline mr-2" />
                Moves: {moveCount}
              </p>
              {bestTimes[difficulty] === time && (
                <p className="text-yellow-500 font-bold">
                  <Trophy className="w-5 h-5 inline mr-2" />
                  New Best Time!
                </p>
              )}
            </div>
            <div className="flex gap-2 justify-center">
              <Button onClick={startGame} variant="default">
                Play Again
              </Button>
              <Button onClick={resetGame} variant="outline">
                Change Difficulty
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
