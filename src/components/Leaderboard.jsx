import React, { useState, useEffect } from 'react';
import { THEME } from '../config/gameSettings';

function Leaderboard({ currentScore, playerName, isGameOver }) {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = () => {
    const saved = localStorage.getItem('2048-leaderboard');
    if (saved) {
      setLeaderboard(JSON.parse(saved));
    }
  };

  const saveScore = (name, score) => {
    const newEntry = {
      name: name.trim(),
      score: score,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      timestamp: Date.now()
    };

    const updatedBoard = [...leaderboard, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 50);

    localStorage.setItem('2048-leaderboard', JSON.stringify(updatedBoard));
    setLeaderboard(updatedBoard);
  };

  useEffect(() => {
    if (isGameOver && currentScore > 0 && playerName) {
      saveScore(playerName, currentScore);
    }
  }, [isGameOver]);

  return (
    <div style={{
      background: 'white',
      borderRadius: '10px',
      padding: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box'
    }}>
      <h2 style={{
        color: THEME.primaryText,
        fontSize: '24px',
        fontWeight: 'bold',
        margin: '0 0 15px 0',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        flexShrink: 0
      }}>
        <span className="material-icons" style={{ fontSize: '28px', color: '#FFD700' }}>
          emoji_events
        </span>
        Leaderboard
      </h2>

      {leaderboard.length === 0 ? (
        <p style={{
          textAlign: 'center',
          color: '#999',
          fontSize: '14px',
          padding: '20px',
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          No scores yet. Be the first to set a record!
        </p>
      ) : (
        <>
          <div style={{
            flex: 1,
            overflowY: 'auto',
            marginBottom: '10px'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead style={{
                position: 'sticky',
                top: 0,
                background: 'white',
                zIndex: 1
              }}>
                <tr style={{
                  borderBottom: '2px solid #ddd'
                }}>
                  <th style={{
                    textAlign: 'left',
                    padding: '10px 5px',
                    color: THEME.primaryText,
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>Rank</th>
                  <th style={{
                    textAlign: 'left',
                    padding: '10px 5px',
                    color: THEME.primaryText,
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>Player</th>
                  <th style={{
                    textAlign: 'right',
                    padding: '10px 5px',
                    color: THEME.primaryText,
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>Score</th>
                  <th style={{
                    textAlign: 'right',
                    padding: '10px 5px',
                    color: THEME.primaryText,
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.slice(0, 20).map((entry, index) => (
                  <tr key={index} style={{
                    borderBottom: '1px solid #eee',
                    background: index === 0 ? '#fff9e6' : index === 1 ? '#f5f5f5' : index === 2 ? '#fafafa' : 'transparent'
                  }}>
                    <td style={{
                      padding: '10px 5px',
                      fontSize: '16px',
                      fontWeight: index < 3 ? 'bold' : 'normal'
                    }}>
                      {index === 0 && (
                        <span className="material-icons" style={{ fontSize: '20px', color: '#FFD700' }}>
                          emoji_events
                        </span>
                      )}
                      {index === 1 && (
                        <span className="material-icons" style={{ fontSize: '20px', color: '#C0C0C0' }}>
                          emoji_events
                        </span>
                      )}
                      {index === 2 && (
                        <span className="material-icons" style={{ fontSize: '20px', color: '#CD7F32' }}>
                          emoji_events
                        </span>
                      )}
                      {index > 2 && `${index + 1}`}
                    </td>
                    <td style={{
                      padding: '10px 5px',
                      color: THEME.primaryText,
                      fontSize: '14px',
                      fontWeight: index < 3 ? 'bold' : 'normal'
                    }}>{entry.name}</td>
                    <td style={{
                      padding: '10px 5px',
                      color: THEME.primaryText,
                      fontSize: '16px',
                      fontWeight: 'bold',
                      textAlign: 'right'
                    }}>{entry.score}</td>
                    <td style={{
                      padding: '10px 5px',
                      color: '#999',
                      fontSize: '12px',
                      textAlign: 'right'
                    }}>{entry.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <p style={{
            textAlign: 'center',
            color: '#999',
            fontSize: '11px',
            flexShrink: 0,
            margin: 0
          }}>
            Showing top {Math.min(leaderboard.length, 20)} of {leaderboard.length} scores
          </p>
        </>
      )}
    </div>
  );
}

export default Leaderboard;