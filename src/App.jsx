import React, { useState, useEffect, useCallback } from 'react';
import Board from './components/Board';
import Header from './components/Header';
import EndGameOverlay from './components/EndGameOverlay';
import HowToPlay from './components/HowToPlay';
import { make_empty_board, check_valid_moves, slideAndMerge, spawn_random_tile } from './helpers/boardHelpers';
import { BOARD_SIZE, THEME } from './config/gameSettings';
import './styles/tileAnimations.css';
import Leaderboard from './components/Leaderboard';
import NamePrompt from './components/NamePrompt';
import soundEffects from './helpers/soundEffects';

// Helper to generate unique IDs for tiles
let tileIdCounter = 0;
const generateTileId = () => ++tileIdCounter;

function App() {
  const [tiles, setTiles] = useState([]);
  const [tileIds, setTileIds] = useState([]); // ADD THIS - Track unique IDs for sliding
  const [currentScore, setCurrentScore] = useState(0);
  const [topScore, setTopScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [playerWon, setPlayerWon] = useState(false);
  const [newly_spawned, setNewlySpawned] = useState([]);
  const [recentlyMerged, setRecentlyMerged] = useState([]);
  const [soundEnabled, setSoundEnabled] =useState(true);
  const [playerName, setPlayerName] = useState('');
  const [showLeaderboardMenu, setShowLeaderboardMenu] = useState(false);

  const resetGame = useCallback(() => {
    let freshBoard = make_empty_board();
    let freshIds = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)); // ADD THIS
    
    freshBoard = spawn_random_tile(freshBoard, setNewlySpawned);
    freshBoard = spawn_random_tile(freshBoard, setNewlySpawned);
    
    // ADD THIS - assign IDs to initial tiles
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (freshBoard[r][c] !== 0) {
          freshIds[r][c] = generateTileId();
        }
      }
    }
    
    setTiles(freshBoard);
    setTileIds(freshIds); // ADD THIS
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
  let updatedIds = tileIds.map(row => [...row]);
  let didMove = false;
  let scoreIncrease = 0;
  const mergedTiles = [];

  // Helper function to process a line and its IDs together
  const processLine = (values, ids) => {
    const newValues = [];
    const newIds = [];
    
    // Filter out zeros
    const nonZero = [];
    const nonZeroIds = [];
    for (let i = 0; i < values.length; i++) {
      if (values[i] !== 0) {
        nonZero.push(values[i]);
        nonZeroIds.push(ids[i]);
      }
    }
    
    // Merge adjacent equal values
    let i = 0;
    while (i < nonZero.length) {
      if (i + 1 < nonZero.length && nonZero[i] === nonZero[i + 1]) {
        newValues.push(nonZero[i] * 2);
        newIds.push(nonZeroIds[i]); // Keep first tile's ID for smooth sliding
        i += 2;
      } else {
        newValues.push(nonZero[i]);
        newIds.push(nonZeroIds[i]);
        i++;
      }
    }
    
    // Pad with zeros
    while (newValues.length < BOARD_SIZE) {
      newValues.push(0);
      newIds.push(null);
    }
    
    return { values: newValues, ids: newIds };
  };

  if (direction === 'left') {
    for (let r = 0; r < BOARD_SIZE; r++) {
      const result = processLine(updatedBoard[r], updatedIds[r]);
      
      if (JSON.stringify(updatedBoard[r]) !== JSON.stringify(result.values)) {
        didMove = true;
        for (let c = 0; c < BOARD_SIZE; c++) {
          if (result.values[c] > updatedBoard[r][c]) {
            scoreIncrease += result.values[c];
            mergedTiles.push({ row: r, col: c });
          }
        }
      }
      
      updatedBoard[r] = result.values;
      updatedIds[r] = result.ids;
    }
  } 
  else if (direction === 'right') {
    for (let r = 0; r < BOARD_SIZE; r++) {
      const reversed = [...updatedBoard[r]].reverse();
      const reversedIds = [...updatedIds[r]].reverse();
      const result = processLine(reversed, reversedIds);
      
      const newRow = result.values.reverse();
      const newIds = result.ids.reverse();
      
      if (JSON.stringify(updatedBoard[r]) !== JSON.stringify(newRow)) {
        didMove = true;
        for (let c = 0; c < BOARD_SIZE; c++) {
          if (newRow[c] > updatedBoard[r][c]) {
            scoreIncrease += newRow[c];
            mergedTiles.push({ row: r, col: c });
          }
        }
      }
      
      updatedBoard[r] = newRow;
      updatedIds[r] = newIds;
    }
  } 
  else if (direction === 'up') {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const column = updatedBoard.map(row => row[c]);
      const columnIds = updatedIds.map(row => row[c]);
      const result = processLine(column, columnIds);
      
      let colChanged = false;
      for (let r = 0; r < BOARD_SIZE; r++) {
        if (updatedBoard[r][c] !== result.values[r]) colChanged = true;
        if (result.values[r] > updatedBoard[r][c]) {
          scoreIncrease += result.values[r];
          mergedTiles.push({ row: r, col: c });
        }
        updatedBoard[r][c] = result.values[r];
        updatedIds[r][c] = result.ids[r];
      }
      
      if (colChanged) didMove = true;
    }
  } 
  else if (direction === 'down') {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const column = updatedBoard.map(row => row[c]);
      const columnIds = updatedIds.map(row => row[c]);
      const reversed = [...column].reverse();
      const reversedIds = [...columnIds].reverse();
      const result = processLine(reversed, reversedIds);
      
      const newCol = result.values.reverse();
      const newIds = result.ids.reverse();
      
      let colChanged = false;
      for (let r = 0; r < BOARD_SIZE; r++) {
        if (updatedBoard[r][c] !== newCol[r]) colChanged = true;
        if (newCol[r] > updatedBoard[r][c]) {
          scoreIncrease += newCol[r];
          mergedTiles.push({ row: r, col: c });
        }
        updatedBoard[r][c] = newCol[r];
        updatedIds[r][c] = newIds[r];
      }
      
      if (colChanged) didMove = true;
    }
  }

  if (didMove) {
    setRecentlyMerged(mergedTiles);
    setCurrentScore(prev => prev + scoreIncrease);
    soundEffects.move();

    if(mergedTiles.length >0) {
      const hasBigMerge = mergedTiles.some(({row, col}) => updatedBoard[row][col]>=1024);
      if (hasBigMerge) {
        soundEffects.bigMerge();
      } else {
        soundEffects.merge();
      }
    }
    
    updatedBoard = spawn_random_tile(updatedBoard, setNewlySpawned);
    
    setTimeout(() => soundEffects.spawn(), 100);
    // Assign ID to new tile
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (updatedBoard[r][c] !== 0 && updatedIds[r][c] === null) {
          updatedIds[r][c] = generateTileId();
        }
      }
    }
    
    setTiles(updatedBoard);
    setTileIds(updatedIds);

    const reached2048 = updatedBoard.some(row => row.includes(2048));
    if (reached2048 && !playerWon) {
      setPlayerWon(true);
      setTimeout(() => soundEffects.win(), 200);
    }

    if (!check_valid_moves(updatedBoard)) {
      setIsGameOver(true);
      setTimeout(() => soundEffects.gameOver(), 200);
    }
    
    setTimeout(() => setRecentlyMerged([]), 150);
  }
}, [tiles, tileIds, isGameOver, playerWon]);

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

  const handleNameSubmit = (name) => {
    setPlayerName(name);
  };
  const toggleSound =() => {
    const enabled = soundEffects.toggle();
    setSoundEnabled(enabled);
  };
  // Scale the entire game to fit smaller screens
  // Total game height: title(65) + margin(15) + scorebar(55) + margin(12) + board(450) + howtoplay(45) = ~642px
  const GAME_HEIGHT = 660;
  const GAME_WIDTH = 450;
  const scaleY = (window.innerHeight - 30) / GAME_HEIGHT;
  const scaleX = (window.innerWidth - 30) / GAME_WIDTH;
  const scale = Math.min(1, scaleY, scaleX); // never scale up, only shrink

  return (
  <>
    {!playerName && <NamePrompt onNameSubmit={handleNameSubmit} />}
    
    <div style={{ 
      height: '100vh',
      width: '100vw',
      background: THEME.pageBackground,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '"Clear Sans", "Helvetica Neue", Arial, sans-serif',
      boxSizing: 'border-box',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Main Game Section - ABSOLUTE CENTER, scales to fit screen */}
      <div style={{ 
        width: '450px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: `translate(-50%, -50%) scale(${scale})`,
        transformOrigin: 'center center'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '15px' }}>
          <h1 style={{ 
            fontSize: '50px',
            fontWeight: 'bold', 
            color: THEME.primaryText,
            margin: '0 0 3px 0'
          }}>2048</h1>
          <p style={{ 
            color: THEME.primaryText,
            fontSize: '14px',
            margin: 0,
            fontWeight: 'bold'
          }}>Playing as: <strong>{playerName}</strong></p>
        </div>

        <div style={{ marginBottom: '12px', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Header current_score={currentScore} top_score={topScore} />
            <div style={{ display: 'flex', gap: '8px' }}>
              {/* Leaderboard Menu Button (only on small screens) */}
              <button
                className="leaderboard-menu-btn"
                onClick={() => setShowLeaderboardMenu(true)}
                style={{
                  background: THEME.buttonNormal,
                  color: '#f9f6f2',
                  border: 'none',
                  padding: '10px 12px',
                  borderRadius: '5px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  display: 'none',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => e.target.style.background = THEME.buttonHover}
                onMouseLeave={(e) => e.target.style.background = THEME.buttonNormal}
                title="View Leaderboard"
              >
                <span className="material-icons" style={{ fontSize: '20px' }}>
                  leaderboard
                </span>
              </button>

              <button
                onClick={toggleSound}
                style={{
                  background: THEME.buttonNormal,
                  color: '#f9f6f2',
                  border: 'none',
                  padding: '10px 12px',
                  borderRadius: '5px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => e.target.style.background = THEME.buttonHover}
                onMouseLeave={(e) => e.target.style.background = THEME.buttonNormal}
                title={soundEnabled ? 'Mute' : 'Unmute'}
              >
                <span className="material-icons" style={{ fontSize: '20px' }}>
                  {soundEnabled ? 'volume_up' : 'volume_off'}
                </span>
              </button>
              
              <button
                onClick={resetGame}
                style={{
                  background: THEME.buttonNormal,
                  color: '#f9f6f2',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: '5px',
                  fontSize: '16px',
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
        </div>

        <Board tiles={tiles} tileIds={tileIds} newly_spawned={newly_spawned} recently_merged={recentlyMerged} />
        
        <HowToPlay />
      </div>

      {/* Leaderboard Section - POSITIONED ON RIGHT, PARALLEL TO BOARD */}
<div 
  className="leaderboard-container"
  style={{ 
    width: `${380 * scale}px`,
    height: `${450 * scale}px`,
    position: 'absolute',
    right: '70px',
    top: '50%',
    transform: `translateY(calc(-50% + ${55 * scale}px))`,
    display: 'flex',
    alignItems: 'stretch'
  }}
>
  <div style={{ width: '100%', height: '100%', transform: `scale(${scale})`, transformOrigin: 'top left', width: `${380}px`, height: `${450}px` }}>
    <Leaderboard 
      currentScore={currentScore} 
      playerName={playerName}
      isGameOver={isGameOver}
    />
  </div>
</div>

      {/* Sliding Leaderboard Menu for Small Screens */}
      {showLeaderboardMenu && (
        <>
          {/* Backdrop */}
          <div 
            onClick={() => setShowLeaderboardMenu(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 9998,
              animation: 'fadeIn 0.3s'
            }}
          />
          
          {/* Sliding Panel */}
          <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: '90%',
            maxWidth: '400px',
            background: THEME.pageBackground,
            zIndex: 9999,
            padding: '20px',
            boxSizing: 'border-box',
            overflowY: 'auto',
            animation: 'slideIn 0.3s ease-out'
          }}>
            {/* Close button */}
            <button
              onClick={() => setShowLeaderboardMenu(false)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '5px',
                color: THEME.primaryText
              }}
            >
              <span className="material-icons" style={{ fontSize: '28px' }}>
                close
              </span>
            </button>

            <Leaderboard 
              currentScore={currentScore} 
              playerName={playerName}
              isGameOver={isGameOver}
            />
          </div>
        </>
      )}

      <EndGameOverlay 
        is_game_over={isGameOver} 
        playerWon={playerWon} 
        final_score={currentScore} 
        onRestart={resetGame} 
      />
    </div>
  </>
);
}

export default App;