import React from 'react';
import { THEME } from '../config/gameSettings';

function Header({ current_score, top_score }) {
  return (
    <div style={{ display: 'flex', gap: '10px' }}>
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
        }}>{current_score}</div>
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
        }}>{top_score}</div>
      </div>
    </div>
  );
}

export default Header;