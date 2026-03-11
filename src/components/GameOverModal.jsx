import React from 'react';
import { COLORS } from '../constants/config';
const GameOverModal = ({ gameOver, won, score, onRestart}) => {
    if (!gameOver &&!won) return null;
    return (
        <div style={{
            position:'fixed',
            top: 0,
            left:0,
            right:0,
            bottom:0,
            background: 'rgba(238,228,218,0.73)',
            display:'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex:100
        }}>
            <div style={{
                background:'white',
                borderRadius:'10px',
                padding: '40px',
                textalign: 'center',
                maxWidth:'400px',
                margin: '20px'
            }}>
                <h2 style={{
                    fontSize: '55px',
                    fontWeight:'bold',
                    color: COLORS.text,
                    margin: '0 0 20px 0'
                }}>
                   {won ? 'You win!' : 'Game over!'}
                </h2>
                <p style={{
                    color:COLORS.text,
                    fontSize: '16px',
                    marginBottom:'30px'
                }}>
                   Final Score: <strong style={{fontSize: '32px', display:'block',marginTop:'10px' }}>{score}</strong>  
                </p>
                <button onClick={onRestart}
                style={{
                    background:COLORS.button,
                    color:'#f9f6f2',
                    border:'none',
                    padding: '15px 40px',
                    borderRadius:'5px',
                    fontSize: '20px',
                    fontweight:'bold',
                    cursor: 'pointer'
                }}>
                   Try again
                </button>
            </div>
        </div>
    );
};
export default GameOverModal;