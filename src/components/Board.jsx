import React from 'react';
import GameTile from './GameTile';
import { THEME } from '../config/gameSettings';

function Board({ tiles, newlySpawned, recentlyMerged }) {
  
  const wasJustSpawned = (r, c) => {
    return newlySpawned.some(t => t.row === r && t.col === c);
  };

  const wasJustMerged = (r, c) => {
    return recentlyMerged.some(t => t.row === r && t.col === c);
  };

  return (
    <div style={{ 
      background: THEME.boardBg,
      borderRadius: '10px',
      padding: '15px',
      position: 'relative'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '15px',
      }}>
        {tiles.map((row, rowIndex) =>
          row.map((cellValue, colIndex) => (
            <GameTile
              key={`${rowIndex}-${colIndex}`}
              value={cellValue}
              justSpawned={wasJustSpawned(rowIndex, colIndex)}
              justMerged={wasJustMerged(rowIndex, colIndex)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default Board;
