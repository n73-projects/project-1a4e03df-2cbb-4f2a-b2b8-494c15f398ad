import type { Tetromino, TetrominoType, Position } from '../types/tetris';
import { TETROMINO_SHAPES, TETROMINO_COLORS } from '../constants/tetris';

export function createTetromino(type: TetrominoType, position: Position): Tetromino {
  return {
    type,
    shape: TETROMINO_SHAPES[type],
    position,
    color: TETROMINO_COLORS[type],
  };
}

export function getRandomTetrominoType(): TetrominoType {
  const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
  return types[Math.floor(Math.random() * types.length)];
}

export function rotateTetromino(tetromino: Tetromino): Tetromino {
  const { shape } = tetromino;
  const rotatedShape = rotateMatrix(shape);
  
  return {
    ...tetromino,
    shape: rotatedShape,
  };
}

export function rotateMatrix(matrix: number[][]): number[][] {
  const n = matrix.length;
  const rotated: number[][] = Array(n).fill(null).map(() => Array(n).fill(0));
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      rotated[j][n - 1 - i] = matrix[i][j];
    }
  }
  
  return rotated;
}

export function getTetrominoBlocks(tetromino: Tetromino): Position[] {
  const blocks: Position[] = [];
  const { shape, position } = tetromino;
  
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        blocks.push({
          x: position.x + x,
          y: position.y + y,
        });
      }
    }
  }
  
  return blocks;
}