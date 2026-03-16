import React from 'react';
import { THEME } from '../config/gameSettings';

function EndGameOverlay({ is_game_over, playerWon, final_score, onRestart }) {
  if (!is_game_over && !playerWon) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(238, 228, 218, 0.73)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        background: 'white',
        borderRadius: '10px',
        padding: '40px',
        textAlign: 'center',
        maxWidth: '400px',
        margin: '20px'
      }}>
        {/* Icon */}
        <span className="material-icons" style={{ 
          fontSize: '60px',
          color: playerWon ? '#5cb85c' : '#d9534f',
          marginBottom: '10px'
        }}>
          {playerWon ? 'celebration' : 'sentiment_dissatisfied'}
        </span>
        
        <h2 style={{ 
          fontSize: '55px',
          fontWeight: 'bold',
          color: THEME.primaryText,
          margin: '0 0 20px 0'
        }}>
          {playerWon ? 'You win!' : 'Game over!'}
        </h2>
        <p style={{ 
          color: THEME.primaryText,
          fontSize: '16px',
          marginBottom: '30px'
        }}>
          Final Score: <strong style={{ fontSize: '32px', display: 'block', marginTop: '10px' }}>{final_score}</strong>
        </p>
        <button
          onClick={onRestart}
          style={{
            background: THEME.buttonNormal,
            color: '#f9f6f2',
            border: 'none',
            padding: '15px 40px',
            borderRadius: '5px',
            fontSize: '20px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            margin: '0 auto'
          }}
        >
          <span className="material-icons">refresh</span>
          Try again
        </button>
      </div>
    </div>
  );
}

export default EndGameOverlay;