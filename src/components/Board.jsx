import React from 'react';
import GameTile from './GameTile';
import { THEME } from '../config/gameSettings';

function Board({ tiles, newly_spawned, recently_merged }) {
  
  const was_just_spawned = (r, c) => {
    return newly_spawned.some(t => t.row === r && t.col === c);
  };

  const wasJustMerged = (r, c) => {
    return recently_merged.some(t => t.row === r && t.col === c);
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
              just_spawned={was_just_spawned(rowIndex, colIndex)}
              justMerged={wasJustMerged(rowIndex, colIndex)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default Board;
