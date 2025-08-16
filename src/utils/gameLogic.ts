import type { Tetromino, Position } from '../types/tetris';
import { BOARD_WIDTH, BOARD_HEIGHT, POINTS_PER_LINE, LEVEL_UP_LINES } from '../constants/tetris';
import { getTetrominoBlocks } from './tetromino';

export function createEmptyBoard(): (string | null)[][] {
  return Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null));
}

export function isValidPosition(tetromino: Tetromino, board: (string | null)[][]): boolean {
  const blocks = getTetrominoBlocks(tetromino);
  
  for (const block of blocks) {
    // Check boundaries
    if (block.x < 0 || block.x >= BOARD_WIDTH || block.y >= BOARD_HEIGHT) {
      return false;
    }
    
    // Check collision with existing blocks (but allow negative y for spawning)
    if (block.y >= 0 && board[block.y][block.x] !== null) {
      return false;
    }
  }
  
  return true;
}

export function placeTetromino(tetromino: Tetromino, board: (string | null)[][]): (string | null)[][] {
  const newBoard = board.map(row => [...row]);
  const blocks = getTetrominoBlocks(tetromino);
  
  for (const block of blocks) {
    if (block.y >= 0 && block.y < BOARD_HEIGHT && block.x >= 0 && block.x < BOARD_WIDTH) {
      newBoard[block.y][block.x] = tetromino.color;
    }
  }
  
  return newBoard;
}

export function clearLines(board: (string | null)[][]): { newBoard: (string | null)[][]; linesCleared: number } {
  const newBoard: (string | null)[][] = [];
  let linesCleared = 0;
  
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    const isLineFull = board[y].every(cell => cell !== null);
    
    if (!isLineFull) {
      newBoard.push([...board[y]]);
    } else {
      linesCleared++;
    }
  }
  
  // Add empty lines at the top
  while (newBoard.length < BOARD_HEIGHT) {
    newBoard.unshift(Array(BOARD_WIDTH).fill(null));
  }
  
  return { newBoard, linesCleared };
}

export function calculateScore(linesCleared: number, level: number): number {
  return POINTS_PER_LINE[linesCleared] * (level + 1);
}

export function calculateLevel(totalLines: number): number {
  return Math.floor(totalLines / LEVEL_UP_LINES);
}

export function calculateDropTime(level: number, baseDropTime: number): number {
  return Math.max(50, baseDropTime * Math.pow(0.8, level));
}

export function canMoveTo(tetromino: Tetromino, deltaX: number, deltaY: number, board: (string | null)[][]): boolean {
  const newTetromino = {
    ...tetromino,
    position: {
      x: tetromino.position.x + deltaX,
      y: tetromino.position.y + deltaY,
    },
  };
  
  return isValidPosition(newTetromino, board);
}

export function getGhostPosition(tetromino: Tetromino, board: (string | null)[][]): Position {
  let ghostY = tetromino.position.y;
  
  while (canMoveTo(tetromino, 0, ghostY - tetromino.position.y + 1, board)) {
    ghostY++;
  }
  
  return {
    x: tetromino.position.x,
    y: ghostY,
  };
}