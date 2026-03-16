import React from 'react';
import GameTile from './GameTile';
import { THEME } from '../config/gameSettings';

function Board({ tiles, tileIds, newly_spawned, recently_merged }) {
  
  const was_just_spawned = (r, c) => {
    return newly_spawned.some(t => t.row === r && t.col === c);
  };

  const wasJustMerged = (r, c) => {
    return recently_merged.some(t => t.row === r && t.col === c);
  };

  const activeTiles = [];
  if (tileIds) {
    tiles.forEach((row, rowIndex) => {
      row.forEach((cellValue, colIndex) => {
        if (cellValue !== 0 && tileIds[rowIndex][colIndex]) {
          activeTiles.push({
            value: cellValue,
            row: rowIndex,
            col: colIndex,
            id: tileIds[rowIndex][colIndex],
            isNew: was_just_spawned(rowIndex, colIndex),
            isMerged: wasJustMerged(rowIndex, colIndex)
          });
        }
      });
    });
  }

  return (
    <div style={{ 
      background: THEME.boardBg,
      borderRadius: '10px',
      padding: '15px',
      position: 'relative',
      width: '450px', 
      height: '450px' 
    }}>
      {/* Background grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '15px',
        position: 'relative',
        width: '100%',
        height: '100%'
      }}>
        {Array(16).fill(0).map((_, idx) => (
          <div
            key={`bg-${idx}`}
            style={{
              aspectRatio: '1',
              background: 'rgba(238, 228, 218, 0.35)',
              borderRadius: '6px'
            }}
          />
        ))}
      </div>
      
      {/* Foreground tiles */}
      <div style={{
        position: 'absolute',
        top: '15px',
        left: '15px',
        right: '15px',
        bottom: '15px'
      }}>
        {activeTiles.map(tile => (
          <GameTile
            key={tile.id}
            value={tile.value}
            position={{ row: tile.row, col: tile.col }}
            just_spawned={tile.isNew}
            justMerged={tile.isMerged}
          />
        ))}
      </div>
    </div>
  );
}

export default Board;