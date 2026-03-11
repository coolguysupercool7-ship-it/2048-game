import React from 'react';
import { THEME } from '../config/gameSettings';

function HowToPlay() {
  return (
    <div style={{ marginTop: '30px', textAlign: 'center' }}>
      <p style={{ 
        color: THEME.primaryText,
        fontSize: '18px',
        fontWeight: 'bold',
        margin: '0 0 10px 0'
      }}>
        HOW TO PLAY
      </p>
      <p style={{ 
        color: THEME.primaryText,
        fontSize: '14px',
        lineHeight: '1.6',
        margin: 0
      }}>
        Use your <strong>arrow keys</strong> to move the tiles. Tiles with the same number <strong>merge into one</strong> when they touch. Add them up to reach <strong>2048!</strong>
      </p>
    </div>
  );
}

export default HowToPlay;