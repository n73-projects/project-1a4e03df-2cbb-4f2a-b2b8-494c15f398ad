import React from 'react';
import type { Tetromino } from '../types/tetris';
import { getTetrominoBlocks } from '../utils/tetromino';

interface NextPieceProps {
  piece: Tetromino | null;
}

const NextPiece: React.FC<NextPieceProps> = ({ piece }) => {
  if (!piece) {
    return (
      <div className="border-2 border-gray-600 bg-gray-900 p-3 rounded-lg">
        <h3 className="text-white text-sm font-bold mb-2 text-center">NEXT</h3>
        <div className="w-16 h-16 bg-gray-800 rounded"></div>
      </div>
    );
  }

  const blocks = getTetrominoBlocks(piece);
  const minX = Math.min(...blocks.map(b => b.x));
  const maxX = Math.max(...blocks.map(b => b.x));
  const minY = Math.min(...blocks.map(b => b.y));
  const maxY = Math.max(...blocks.map(b => b.y));
  
  const width = maxX - minX + 1;
  const height = maxY - minY + 1;
  
  // Create a small grid for the preview
  const previewGrid = Array(height).fill(null).map(() => Array(width).fill(null));
  
  blocks.forEach(block => {
    const relX = block.x - minX;
    const relY = block.y - minY;
    previewGrid[relY][relX] = piece.color;
  });

  return (
    <div className="border-2 border-gray-600 bg-gray-900 p-3 rounded-lg">
      <h3 className="text-white text-sm font-bold mb-2 text-center">NEXT</h3>
      <div className="flex justify-center">
        <div 
          className="grid gap-[1px] bg-gray-800 p-1 rounded"
          style={{
            gridTemplateColumns: `repeat(${width}, 1fr)`,
            gridTemplateRows: `repeat(${height}, 1fr)`,
          }}
        >
          {previewGrid.map((row, y) =>
            row.map((cell, x) => (
              <div
                key={`${y}-${x}`}
                className="w-4 h-4 border border-gray-700"
                style={{
                  backgroundColor: cell || '#1f2937',
                  boxShadow: cell 
                    ? 'inset 0 0 2px rgba(0,0,0,0.5), inset 0 0 4px rgba(255,255,255,0.2)'
                    : undefined,
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NextPiece;