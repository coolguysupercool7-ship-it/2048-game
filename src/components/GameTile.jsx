import React from 'react';
import { TILE_COLORS, FALLBACK_TILE } from '../config/gameSettings';
import { determineTileStyle } from '../helpers/boardHelpers';
import '../styles/tileAnimations.css';

function GameTile({ value, justSpawned, justMerged }) {
  const styling = determineTileStyle(value, TILE_COLORS, FALLBACK_TILE);
  
  // Determine which animation to play
  let animationClass = 'none';
  if (justSpawned) animationClass = 'appear 0.2s';
  else if (justMerged) animationClass = 'pop 0.15s';
  
  return (
    <div
      style={{
        aspectRatio: '1',
        background: styling.bg,
        color: styling.color,
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: styling.fontSize,
        fontWeight: 'bold',
        transition: 'all 0.15s ease-in-out',
        transform: 'scale(1)',
        animation: animationClass
      }}
    >
      {value !== 0 && value}
    </div>
  );
}

export default GameTile;