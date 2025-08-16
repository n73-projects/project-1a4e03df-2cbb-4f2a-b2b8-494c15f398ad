import React from 'react';
import type { Tetromino } from '../types/tetris';
import { BOARD_WIDTH, BOARD_HEIGHT } from '../constants/tetris';
import { getTetrominoBlocks, createTetromino } from '../utils/tetromino';
import { getGhostPosition } from '../utils/gameLogic';

interface GameBoardProps {
  board: (string | null)[][];
  currentPiece: Tetromino | null;
  showGhost?: boolean;
}

const GameBoard: React.FC<GameBoardProps> = ({ board, currentPiece, showGhost = true }) => {
  // Create a display board that includes the current piece and ghost piece
  const displayBoard = board.map(row => [...row]);
  
  // Add ghost piece
  if (currentPiece && showGhost) {
    const ghostPosition = getGhostPosition(currentPiece, board);
    const ghostPiece = createTetromino(currentPiece.type, ghostPosition);
    const ghostBlocks = getTetrominoBlocks(ghostPiece);
    
    ghostBlocks.forEach(block => {
      if (block.y >= 0 && block.y < BOARD_HEIGHT && block.x >= 0 && block.x < BOARD_WIDTH) {
        if (displayBoard[block.y][block.x] === null) {
          displayBoard[block.y][block.x] = `${currentPiece.color}40`; // Ghost with transparency
        }
      }
    });
  }
  
  // Add current piece
  if (currentPiece) {
    const currentBlocks = getTetrominoBlocks(currentPiece);
    currentBlocks.forEach(block => {
      if (block.y >= 0 && block.y < BOARD_HEIGHT && block.x >= 0 && block.x < BOARD_WIDTH) {
        displayBoard[block.y][block.x] = currentPiece.color;
      }
    });
  }
  
  return (
    <div className="inline-block border-2 border-gray-600 bg-gray-900 p-2 rounded-lg shadow-2xl">
      <div 
        className="grid gap-[1px] bg-gray-800"
        style={{
          gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)`,
          gridTemplateRows: `repeat(${BOARD_HEIGHT}, 1fr)`,
        }}
      >
        {displayBoard.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${y}-${x}`}
              className={`
                w-6 h-6 border border-gray-700 transition-all duration-75
                ${cell ? 'shadow-inner' : 'bg-gray-900'}
              `}
              style={{
                backgroundColor: cell || undefined,
                boxShadow: cell 
                  ? cell.includes('40') 
                    ? 'inset 0 0 4px rgba(255,255,255,0.2)' // Ghost piece shadow
                    : 'inset 0 0 4px rgba(0,0,0,0.5), inset 0 0 8px rgba(255,255,255,0.2)' // Regular piece shadow
                  : undefined,
              }}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default GameBoard;