import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { GameState } from '../types/tetris';
import { BOARD_WIDTH, INITIAL_DROP_TIME } from '../constants/tetris';
import { 
  createEmptyBoard, 
  isValidPosition, 
  placeTetromino, 
  clearLines, 
  calculateScore, 
  calculateLevel, 
  calculateDropTime,
  canMoveTo 
} from '../utils/gameLogic';
import { 
  createTetromino, 
  getRandomTetrominoType, 
  rotateTetromino 
} from '../utils/tetromino';
import GameBoard from './GameBoard';
import NextPiece from './NextPiece';
import GameStats from './GameStats';

const TetrisGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(() => ({
    board: createEmptyBoard(),
    currentPiece: null,
    nextPiece: null,
    score: 0,
    lines: 0,
    level: 0,
    gameOver: false,
    paused: false,
  }));

  const gameLoopRef = useRef<number | undefined>(undefined);
  const lastDropTimeRef = useRef<number>(0);

  // Initialize game
  const initGame = useCallback(() => {
    const firstPiece = createTetromino(getRandomTetrominoType(), { x: Math.floor(BOARD_WIDTH / 2) - 1, y: -1 });
    const secondPiece = createTetromino(getRandomTetrominoType(), { x: Math.floor(BOARD_WIDTH / 2) - 1, y: -1 });
    
    setGameState({
      board: createEmptyBoard(),
      currentPiece: firstPiece,
      nextPiece: secondPiece,
      score: 0,
      lines: 0,
      level: 0,
      gameOver: false,
      paused: false,
    });
    
    lastDropTimeRef.current = Date.now();
  }, []);

  // Spawn next piece
  const spawnNextPiece = useCallback(() => {
    setGameState(prev => {
      if (!prev.nextPiece) return prev;
      
      const newPiece = { ...prev.nextPiece, position: { x: Math.floor(BOARD_WIDTH / 2) - 1, y: -1 } };
      const nextPiece = createTetromino(getRandomTetrominoType(), { x: Math.floor(BOARD_WIDTH / 2) - 1, y: -1 });
      
      // Check if game over
      if (!isValidPosition(newPiece, prev.board)) {
        return { ...prev, gameOver: true };
      }
      
      return {
        ...prev,
        currentPiece: newPiece,
        nextPiece: nextPiece,
      };
    });
  }, []);

  // Move piece
  const movePiece = useCallback((deltaX: number, deltaY: number) => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.gameOver || prev.paused) return prev;
      
      if (canMoveTo(prev.currentPiece, deltaX, deltaY, prev.board)) {
        return {
          ...prev,
          currentPiece: {
            ...prev.currentPiece,
            position: {
              x: prev.currentPiece.position.x + deltaX,
              y: prev.currentPiece.position.y + deltaY,
            },
          },
        };
      }
      
      return prev;
    });
  }, []);

  // Rotate piece
  const rotatePiece = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.gameOver || prev.paused) return prev;
      
      const rotated = rotateTetromino(prev.currentPiece);
      
      if (isValidPosition(rotated, prev.board)) {
        return { ...prev, currentPiece: rotated };
      }
      
      // Try wall kicks
      const kicks = [
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: -1 },
        { x: 1, y: -1 },
        { x: -1, y: -1 },
      ];
      
      for (const kick of kicks) {
        const kickedPiece = {
          ...rotated,
          position: {
            x: rotated.position.x + kick.x,
            y: rotated.position.y + kick.y,
          },
        };
        
        if (isValidPosition(kickedPiece, prev.board)) {
          return { ...prev, currentPiece: kickedPiece };
        }
      }
      
      return prev;
    });
  }, []);

  // Hard drop
  const hardDrop = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.gameOver || prev.paused) return prev;
      
      let dropDistance = 0;
      while (canMoveTo(prev.currentPiece, 0, dropDistance + 1, prev.board)) {
        dropDistance++;
      }
      
      const droppedPiece = {
        ...prev.currentPiece,
        position: {
          x: prev.currentPiece.position.x,
          y: prev.currentPiece.position.y + dropDistance,
        },
      };
      
      return { ...prev, currentPiece: droppedPiece };
    });
  }, []);

  // Drop piece
  const dropPiece = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentPiece || prev.gameOver || prev.paused) return prev;
      
      if (canMoveTo(prev.currentPiece, 0, 1, prev.board)) {
        return {
          ...prev,
          currentPiece: {
            ...prev.currentPiece,
            position: {
              x: prev.currentPiece.position.x,
              y: prev.currentPiece.position.y + 1,
            },
          },
        };
      } else {
        // Piece has landed, place it and spawn next
        const newBoard = placeTetromino(prev.currentPiece, prev.board);
        const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);
        const newTotalLines = prev.lines + linesCleared;
        const newLevel = calculateLevel(newTotalLines);
        const scoreIncrease = calculateScore(linesCleared, newLevel);
        
        return {
          ...prev,
          board: clearedBoard,
          currentPiece: null,
          score: prev.score + scoreIncrease,
          lines: newTotalLines,
          level: newLevel,
        };
      }
    });
  }, []);

  // Spawn piece when current piece is null
  useEffect(() => {
    if (!gameState.currentPiece && !gameState.gameOver) {
      const timer = setTimeout(spawnNextPiece, 100);
      return () => clearTimeout(timer);
    }
  }, [gameState.currentPiece, gameState.gameOver, spawnNextPiece]);

  // Game loop
  useEffect(() => {
    if (gameState.gameOver || gameState.paused) return;

    const gameLoop = () => {
      const now = Date.now();
      const dropTime = calculateDropTime(gameState.level, INITIAL_DROP_TIME);
      
      if (now - lastDropTimeRef.current >= dropTime) {
        dropPiece();
        lastDropTimeRef.current = now;
      }
      
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.gameOver, gameState.paused, gameState.level, dropPiece]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (gameState.gameOver) {
        if (event.code === 'Space') {
          initGame();
        }
        return;
      }

      switch (event.code) {
        case 'ArrowLeft':
          event.preventDefault();
          movePiece(-1, 0);
          break;
        case 'ArrowRight':
          event.preventDefault();
          movePiece(1, 0);
          break;
        case 'ArrowDown':
          event.preventDefault();
          movePiece(0, 1);
          break;
        case 'ArrowUp':
          event.preventDefault();
          rotatePiece();
          break;
        case 'Space':
          event.preventDefault();
          hardDrop();
          break;
        case 'KeyP':
          event.preventDefault();
          setGameState(prev => ({ ...prev, paused: !prev.paused }));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState.gameOver, movePiece, rotatePiece, hardDrop, initGame]);

  // Initialize game on mount
  useEffect(() => {
    initGame();
  }, [initGame]);

  return (
    <div className="min-h-screen bg-gray-800 flex items-center justify-center p-4">
      <div className="flex gap-6 items-start">
        {/* Left sidebar */}
        <div className="flex flex-col gap-4">
          <NextPiece piece={gameState.nextPiece} />
          <GameStats 
            stats={{
              score: gameState.score,
              lines: gameState.lines,
              level: gameState.level,
            }}
            gameOver={gameState.gameOver}
            paused={gameState.paused}
          />
        </div>
        
        {/* Game board */}
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-4xl font-bold text-white text-center tracking-wider">
            TETRIS
          </h1>
          <GameBoard 
            board={gameState.board} 
            currentPiece={gameState.currentPiece}
          />
        </div>
        
        {/* Right sidebar - Controls */}
        <div className="border-2 border-gray-600 bg-gray-900 p-4 rounded-lg">
          <h3 className="text-white text-sm font-bold mb-3 text-center">CONTROLS</h3>
          <div className="text-white text-xs space-y-2">
            <div className="flex justify-between">
              <span>Move:</span>
              <span className="text-gray-400">← →</span>
            </div>
            <div className="flex justify-between">
              <span>Rotate:</span>
              <span className="text-gray-400">↑</span>
            </div>
            <div className="flex justify-between">
              <span>Soft Drop:</span>
              <span className="text-gray-400">↓</span>
            </div>
            <div className="flex justify-between">
              <span>Hard Drop:</span>
              <span className="text-gray-400">SPACE</span>
            </div>
            <div className="flex justify-between">
              <span>Pause:</span>
              <span className="text-gray-400">P</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TetrisGame;