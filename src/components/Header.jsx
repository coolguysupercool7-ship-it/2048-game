import React from 'react';
import { THEME } from '../config/gameSettings';

function Header({ currentScore, topScore }) {
  return (
    <div style={{ display: 'flex', gap: '10px' }}>
      {/* shows the score for current game */}
      <div style={{ 
        background: THEME.scorePanelBg,
        padding: '10px 20px',
        borderRadius: '5px',
        minWidth: '80px',
        textAlign: 'center'
      }}>
        <div style={{ 
          color: THEME.scoreLabel,
          fontSize: '13px',
          fontWeight: 'bold',
          textTransform: 'uppercase'
        }}>Score</div>
        <div style={{ 
          color: 'white',
          fontSize: '25px',
          fontWeight: 'bold'
        }}>{currentScore}</div>
      </div>
      
      {/* best score is saved in localStorage */}
      <div style={{ 
        background: THEME.scorePanelBg,
        padding: '10px 20px',
        borderRadius: '3px',
        minWidth: '80px',
        textAlign: 'center'
      }}>
        <div style={{ 
          color: THEME.scoreLabel,
          fontSize: '13px',
          fontWeight: 'bold',
          textTransform: 'uppercase'
        }}>Best</div>
        <div style={{ 
          color: 'white',
          fontSize: '25px',
          fontWeight: 'bold'
        }}>{topScore}</div>
      </div>
    </div>
  );
}

export default Header;
