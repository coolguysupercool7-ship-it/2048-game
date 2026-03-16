import React from 'react';
import { THEME } from '../config/gameSettings';

function HowToPlay() {
  return (
    <div style={{ marginTop: '12px', textAlign: 'center' }}>
      <p style={{ 
        color: THEME.primaryText,
        fontSize: '13px',
        fontWeight: 'bold',
        margin: '0 0 3px 0'
      }}>
        HOW TO PLAY
      </p>
      <p style={{ 
        color: THEME.primaryText,
        fontSize: '11px',
        lineHeight: '1.3',
        margin: 0
      }}>
        Use <strong>arrow keys</strong> to move. Same numbers <strong>merge</strong>. Reach <strong>2048!</strong>
      </p>
    </div>
  );
}

export default HowToPlay;