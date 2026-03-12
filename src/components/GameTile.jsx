import React from 'react';
import { TILE_COLORS, FALLBACK_TILE } from '../config/gameSettings';
import { get_tile_style } from '../helpers/boardHelpers';
import '../styles/tileAnimations.css';

function GameTile({ value, just_spawned, justMerged }) {
  const styling = get_tile_style(value, TILE_COLORS, FALLBACK_TILE);
  
  let animation_class = 'none';
  if (just_spawned) {
    animation_class = 'appear 0.2s';
  } else if (justMerged) {
    animation_class = 'pop 0.15s';
  }
  
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
        animation: animation_class
      }}
    >
      {value !== 0 && value}
    </div>
  );
}

export default GameTile;
