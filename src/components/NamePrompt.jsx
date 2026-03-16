import React, { useState } from 'react';
import { THEME } from '../config/gameSettings';

function NamePrompt({ onNameSubmit }) {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim().length > 0) {
      onNameSubmit(name.trim());
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '10px',
        padding: '40px',
        maxWidth: '400px',
        width: '90%',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '60px',
          color: THEME.primaryText,
          margin: '0 0 10px 0'
        }}>2048</h1>
        
        <p style={{
          color: THEME.primaryText,
          fontSize: '18px',
          marginBottom: '30px'
        }}>
          Welcome! Enter your name to start
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: '100%',
              padding: '15px',
              fontSize: '18px',
              borderRadius: '5px',
              border: '2px solid #ddd',
              marginBottom: '20px',
              boxSizing: 'border-box',
              textAlign: 'center'
            }}
            maxLength={20}
            autoFocus
          />
          
          <button
            type="submit"
            disabled={name.trim().length === 0}
            style={{
              width: '100%',
              background: name.trim().length > 0 ? THEME.buttonNormal : '#ccc',
              color: '#f9f6f2',
              border: 'none',
              padding: '15px',
              borderRadius: '5px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: name.trim().length > 0 ? 'pointer' : 'not-allowed'
            }}
          >
            Start Playing
          </button>
        </form>

        <p style={{
          marginTop: '20px',
          color: '#999',
          fontSize: '12px'
        }}>
          Your score will be saved to the leaderboard when you finish
        </p>
      </div>
    </div>
  );
}

export default NamePrompt;