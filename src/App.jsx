import React, { useState, useEffect, useCallback } from 'react';
import Board from './components/Board';
import Header from './components/Header';
import EndGameOverlay from './components/EndGameOverlay';
import HowToPlay from './components/HowToPlay';
import { make_empty_board, check_valid_moves, slideAndMerge, spawn_random_tile } from './helpers/boardHelpers';
import { BOARD_SIZE, THEME } from './config/gameSettings';
import './styles/tileAnimations.css';

function App() {
  const [tiles, setTiles] = useState([]);
  const [currentScore, setCurrentScore] = useState(0);
  const [topScore, setTopScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [playerWon, setPlayerWon] = useState(false);
  const [newly_spawned, setNewlySpawned] = useState([]);
  const [recentlyMerged, setRecentlyMerged] = useState([]);
  const resetGame = useCallback(() => {
    let freshBoard = make_empty_board();
    freshBoard = spawn_random_tile(freshBoard, setNewlySpawned);
    freshBoard = spawn_random_tile(freshBoard, setNewlySpawned);
    setTiles(freshBoard);
    setCurrentScore(0);
    setIsGameOver(false);
    setPlayerWon(false);
    setNewlySpawned([]);
    setRecentlyMerged([]);
  }, []);

  useEffect(() => {
    resetGame();
    const savedBest = localStorage.getItem('2048-best');
    if (savedBest) {
      setTopScore(parseInt(savedBest));
    }
  }, [resetGame]);

  useEffect(() => {
    if (currentScore > topScore) {
      setTopScore(currentScore);
      localStorage.setItem('2048-best', currentScore.toString());
    }
  }, [currentScore, topScore]);

  const handleMove = useCallback((direction) => {
    if (isGameOver) return;

    let updatedBoard = tiles.map(row => [...row]);
    let didMove = false;
    let scoreIncrease = 0;
    const mergedTiles = [];

    setTimeout(() => {
      if (direction === 'left') {
        for (let r = 0; r < BOARD_SIZE; r++) {
          const old_row = [...updatedBoard[r]];
          const new_row = slideAndMerge(old_row);
          updatedBoard[r] = new_row;
          const hasChanged = old_row.some((val, idx) => val !== new_row[idx]);
          if (hasChanged) {
            didMove = true;
            for (let c = 0; c < BOARD_SIZE; c++) {
              if (new_row[c] > old_row[c]) {
                scoreIncrease += new_row[c];
                mergedTiles.push({ row: r, col: c });
              }
            }
          }
        }
      } else if (direction === 'right') {
        for (let r = 0; r < BOARD_SIZE; r++) {
          const old_row = [...updatedBoard[r]];
          const new_row = slideAndMerge(old_row.reverse()).reverse();
          updatedBoard[r] = new_row;
          const hasChanged = old_row.some((val, idx) => val !== new_row[idx]);
          if (hasChanged) {
            didMove = true;
            for (let c = 0; c < BOARD_SIZE; c++) {
              if (new_row[c] > old_row[c]) {
                scoreIncrease += new_row[c];
                mergedTiles.push({ row: r, col: c });
              }
            }
          }
        }
      } else if (direction === 'up'){
        for (let c = 0; c < BOARD_SIZE; c++) {
          const originalCol = updatedBoard.map(row => row[c]);
          const newCol = slideAndMerge(originalCol);
          for (let r = 0; r < BOARD_SIZE; r++) {
            updatedBoard[r][c] = newCol[r];
          }
          
          const col_changed = originalCol.some((val, idx) => val !== newCol[idx]);
          if (col_changed) {
            didMove = true;
            for (let r = 0; r < BOARD_SIZE; r++) {
              if (newCol[r] > originalCol[r]) {
                scoreIncrease += newCol[r];
                mergedTiles.push({ row: r, col: c });
              }
            }
           }
        }
      } else if (direction === 'down'){
        for (let c = 0; c < BOARD_SIZE; c++) {
          const originalCol = updatedBoard.map(row => row[c]);
          const newCol = slideAndMerge(originalCol.reverse()).reverse();
          
          for (let r = 0; r < BOARD_SIZE; r++) {
            updatedBoard[r][c] = newCol[r];
          }
          
          const col_changed = originalCol.some((val, idx) => val !== newCol[idx]);
          if (col_changed) {
            didMove = true;
            for (let r = 0; r < BOARD_SIZE; r++) {
              if (newCol[r] > originalCol[r]) {
                scoreIncrease += newCol[r];
                mergedTiles.push({ row: r, col: c });
              }
            }
          }
        }
       }

      if (didMove) 
    {
        setRecentlyMerged(mergedTiles);
        setTimeout(() => setRecentlyMerged([]), 150);
        
        setCurrentScore(prev => prev + scoreIncrease);
        
        setTimeout(() => {
          updatedBoard = spawn_random_tile(updatedBoard, setNewlySpawned);
          setTiles(updatedBoard);

          const reached2048 = updatedBoard.some(row => row.includes(2048));
          if (reached2048 && !playerWon) {
            setPlayerWon(true);
          }

          if (!check_valid_moves(updatedBoard)) {
            setIsGameOver(true);
          }
        }, 100);
      }
    }, 50);
  }, [tiles, isGameOver, playerWon]);

  useEffect(() => {
    const onKeyPress = (event) => {
      const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
      
      if (arrowKeys.includes(event.key)) {
        event.preventDefault();
        
        const direction_map = {
          'ArrowUp': 'up',
          'ArrowDown': 'down',
          'ArrowLeft': 'left',
          'ArrowRight': 'right'
        };
        
        handleMove(direction_map[event.key]);
      }
    };

    window.addEventListener('keydown', onKeyPress);
    
    return () => window.removeEventListener('keydown', onKeyPress);
  }, [handleMove]);

  return (
    <div style=
      {{ 
      minHeight: '100vh', 
      background: THEME.pageBackground,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '"Clear Sans", "Helvetica Neue", Arial, sans-serif',
      padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: '500px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ 
            fontSize: '80px', 
            fontWeight: 'bold', 
            color: THEME.primaryText,
            margin: '0 0 10px 0'
          }}>2048</h1>
          <p style={{ 
            color: THEME.primaryText,
            fontSize: '18px',
            margin: 0,
            fontWeight: 'bold'
          }}>Join the tiles, get to <strong>2048!</strong></p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Header current_score={currentScore} top_score={topScore} />
            <button
              onClick={resetGame}
              style={{
                background: THEME.buttonNormal,
                color: '#f9f6f2',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '5px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = THEME.buttonHover}
              onMouseLeave={(e) => e.target.style.background = THEME.buttonNormal}
            >
              New Game
            </button>
          </div>
        </div>
        <Board tiles={tiles} newly_spawned={newly_spawned} recently_merged={recentlyMerged} />
        <HowToPlay />
        
        <EndGameOverlay 
          is_game_over={isGameOver} 
          playerWon={playerWon} 
          final_score={currentScore} 
          onRestart={resetGame} 
        />
      </div>
    </div>
  );
}

export default App;
