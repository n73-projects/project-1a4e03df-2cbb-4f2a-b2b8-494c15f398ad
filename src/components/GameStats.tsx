import React from 'react';
import type { GameStats } from '../types/tetris';

interface GameStatsProps {
  stats: GameStats;
  gameOver: boolean;
  paused: boolean;
}

const GameStats: React.FC<GameStatsProps> = ({ stats, gameOver, paused }) => {
  return (
    <div className="space-y-4">
      <div className="border-2 border-gray-600 bg-gray-900 p-4 rounded-lg">
        <h3 className="text-white text-sm font-bold mb-3 text-center">SCORE</h3>
        <div className="text-center">
          <div className="text-yellow-400 text-2xl font-mono font-bold">
            {stats.score.toLocaleString()}
          </div>
        </div>
      </div>
      
      <div className="border-2 border-gray-600 bg-gray-900 p-4 rounded-lg">
        <h3 className="text-white text-sm font-bold mb-3 text-center">LINES</h3>
        <div className="text-center">
          <div className="text-green-400 text-xl font-mono font-bold">
            {stats.lines}
          </div>
        </div>
      </div>
      
      <div className="border-2 border-gray-600 bg-gray-900 p-4 rounded-lg">
        <h3 className="text-white text-sm font-bold mb-3 text-center">LEVEL</h3>
        <div className="text-center">
          <div className="text-blue-400 text-xl font-mono font-bold">
            {stats.level}
          </div>
        </div>
      </div>
      
      {gameOver && (
        <div className="border-2 border-red-600 bg-red-900/20 p-4 rounded-lg">
          <h3 className="text-red-400 text-sm font-bold text-center">GAME OVER</h3>
          <p className="text-white text-xs text-center mt-2">
            Press SPACE to restart
          </p>
        </div>
      )}
      
      {paused && !gameOver && (
        <div className="border-2 border-yellow-600 bg-yellow-900/20 p-4 rounded-lg">
          <h3 className="text-yellow-400 text-sm font-bold text-center">PAUSED</h3>
          <p className="text-white text-xs text-center mt-2">
            Press P to resume
          </p>
        </div>
      )}
    </div>
  );
};

export default GameStats;