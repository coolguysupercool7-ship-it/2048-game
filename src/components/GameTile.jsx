import React from 'react';
import { TILE_COLORS, FALLBACK_TILE } from '../config/gameSettings';
import { get_tile_style } from '../helpers/boardHelpers';
import '../styles/tileAnimations.css';

function GameTile({ value, just_spawned, justMerged, position }) {
  const styling = get_tile_style(value, TILE_COLORS, FALLBACK_TILE);
  
  let animation_class = 'none';
  if (just_spawned) {
    animation_class = 'appear 0.2s';
  } else if (justMerged) {
    animation_class = 'pop 0.15s';
  }
  
  // Position calculation
  const gap = 15;
  const size = `calc((100% - ${3 * gap}px) / 4)`;
  const left = `calc(${position.col} * (${size} + ${gap}px))`;
  const top = `calc(${position.row} * (${size} + ${gap}px))`;
  
  const tileStyle = {
    position: 'absolute',
    width: size,
    height: size,
    left: left,
    top: top,
    background: styling.bg,
    color: styling.color,
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: styling.fontSize,
    fontWeight: 'bold',
    transition: just_spawned ? 'none' : 'all 0.2s ease',
    transform: 'scale(1)',
    animation: animation_class,
    zIndex: value
  };
  
  return (
    <div style={tileStyle}>
      {value !== 0 && value}
    </div>
  );
}

export default GameTile;