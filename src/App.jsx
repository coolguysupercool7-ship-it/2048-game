import React, { useState, useEffect, useCallback } from 'react';
import Board from './components/Board';
import Header from './components/Header';
import EndGameOverlay from './components/EndGameOverlay';
import HowToPlay from './components/HowToPlay';
import { makeEmptyBoard, hasValidMoves, slideAndMerge, spawnRandomTile } from './helpers/boardHelpers';
import { BOARD_SIZE, THEME } from './config/gameSettings';
import './styles/tileAnimations.css';

function App() {
  const [tiles, setTiles] = useState([]);
  const [currentScore, setCurrentScore] = useState(0);
  const [topScore, setTopScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [playerWon, setPlayerWon] = useState(false);
  const [newlySpawned, setNewlySpawned] = useState([]);
  const [recentlyMerged, setRecentlyMerged] = useState([]);

  // Start fresh game - clear board and add 2 random tiles
  const startNewGame = useCallback(() => {
    let freshBoard = makeEmptyBoard();
    freshBoard = spawnRandomTile(freshBoard, setNewlySpawned);
    freshBoard = spawnRandomTile(freshBoard, setNewlySpawned);
    setTiles(freshBoard);
    setCurrentScore(0);
    setIsGameOver(false);
    setPlayerWon(false);
    setNewlySpawned([]);
    setRecentlyMerged([]);
  }, []);

  // On first load, start game and load saved high score
  useEffect(() => {
    startNewGame();
    const savedBest = localStorage.getItem('2048-best');
    if (savedBest) {
      setTopScore(parseInt(savedBest));
    }
  }, [startNewGame]);

  // Update best score in localStorage when current score beats it
  useEffect(() => {
    if (currentScore > topScore) {
      setTopScore(currentScore);
      localStorage.setItem('2048-best', currentScore.toString());
    }
  }, [currentScore, topScore]);

  // Main movement handler - processes arrow key inputs
  // Note: using callback to avoid recreating function on every render
  const processMove = useCallback((direction) => {
    if (isGameOver) return;

    let updatedBoard = tiles.map(row => [...row]);
    let somethingMoved = false;
    let pointsGained = 0;
    const mergedLocations = [];

    // Small delay for smoother feel (gives time for previous animations to finish)
    setTimeout(() => {
      if (direction === 'left') {
        // Process each row left to right
        for (let r = 0; r < BOARD_SIZE; r++) {
          const originalRow = [...updatedBoard[r]];
          const processedRow = slideAndMerge(originalRow);
          updatedBoard[r] = processedRow;
          
          // Track if anything actually changed
          const rowChanged = originalRow.some((val, idx) => val !== processedRow[idx]);
          if (rowChanged) {
            somethingMoved = true;
            // Find merged tiles and add to score
            for (let c = 0; c < BOARD_SIZE; c++) {
              if (processedRow[c] > originalRow[c]) {
                pointsGained += processedRow[c];
                mergedLocations.push({ row: r, col: c });
              }
            }
          }
        }
      } else if (direction === 'right') {
        // Process each row right to left by reversing
        for (let r = 0; r < BOARD_SIZE; r++) {
          const originalRow = [...updatedBoard[r]];
          const processedRow = slideAndMerge(originalRow.reverse()).reverse();
          updatedBoard[r] = processedRow;
          
          const rowChanged = originalRow.some((val, idx) => val !== processedRow[idx]);
          if (rowChanged) {
            somethingMoved = true;
            for (let c = 0; c < BOARD_SIZE; c++) {
              if (processedRow[c] > originalRow[c]) {
                pointsGained += processedRow[c];
                mergedLocations.push({ row: r, col: c });
              }
            }
          }
        }
      } else if (direction === 'up') {
        // Process each column top to bottom
        for (let c = 0; c < BOARD_SIZE; c++) {
          const originalCol = updatedBoard.map(row => row[c]);
          const processedCol = slideAndMerge(originalCol);
          
          for (let r = 0; r < BOARD_SIZE; r++) {
            updatedBoard[r][c] = processedCol[r];
          }
          
          const colChanged = originalCol.some((val, idx) => val !== processedCol[idx]);
          if (colChanged) {
            somethingMoved = true;
            for (let r = 0; r < BOARD_SIZE; r++) {
              if (processedCol[r] > originalCol[r]) {
                pointsGained += processedCol[r];
                mergedLocations.push({ row: r, col: c });
              }
            }
          }
        }
      } else if (direction === 'down') {
        // Process each column bottom to top by reversing
        for (let c = 0; c < BOARD_SIZE; c++) {
          const originalCol = updatedBoard.map(row => row[c]);
          const processedCol = slideAndMerge(originalCol.reverse()).reverse();
          
          for (let r = 0; r < BOARD_SIZE; r++) {
            updatedBoard[r][c] = processedCol[r];
          }
          
          const colChanged = originalCol.some((val, idx) => val !== processedCol[idx]);
          if (colChanged) {
            somethingMoved = true;
            for (let r = 0; r < BOARD_SIZE; r++) {
              if (processedCol[r] > originalCol[r]) {
                pointsGained += processedCol[r];
                mergedLocations.push({ row: r, col: c });
              }
            }
          }
        }
      }

      // Only update state if tiles actually moved
      if (somethingMoved) {
        // Trigger merge animation
        setRecentlyMerged(mergedLocations);
        setTimeout(() => setRecentlyMerged([]), 150);
        
        // Add points earned from merges
        setCurrentScore(prev => prev + pointsGained);
        
        // After animations, spawn new tile and check game state
        setTimeout(() => {
          updatedBoard = spawnRandomTile(updatedBoard, setNewlySpawned);
          setTiles(updatedBoard);

          // Check for win condition (reached 2048)
          const has2048 = updatedBoard.some(row => row.includes(2048));
          if (has2048 && !playerWon) {
            setPlayerWon(true);
          }

          // Check for loss condition (no valid moves)
          if (!hasValidMoves(updatedBoard)) {
            setIsGameOver(true);
          }
        }, 100);
      }
    }, 50);
  }, [tiles, isGameOver, playerWon]);

  // Listen for arrow key presses
  useEffect(() => {
    const handleKeyDown = (event) => {
      const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
      
      if (arrowKeys.includes(event.key)) {
        event.preventDefault(); // prevent page scroll
        
        const keyToDirection = {
          'ArrowUp': 'up',
          'ArrowDown': 'down',
          'ArrowLeft': 'left',
          'ArrowRight': 'right'
        };
        
        processMove(keyToDirection[event.key]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // Cleanup listener on unmount
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [processMove]);

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: THEME.pageBackground,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '"Clear Sans", "Helvetica Neue", Arial, sans-serif',
      padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: '500px' }}>
        {/* Game title */}
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

        {/* Score display and new game button */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Header currentScore={currentScore} topScore={topScore} />
            <button
              onClick={startNewGame}
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

        {/* Main game board */}
        <Board tiles={tiles} newlySpawned={newlySpawned} recentlyMerged={recentlyMerged} />
        
        {/* Instructions */}
        <HowToPlay />
        
        {/* Win/lose overlay */}
        <EndGameOverlay 
          isGameOver={isGameOver} 
          playerWon={playerWon} 
          finalScore={currentScore} 
          onRestart={startNewGame} 
        />
      </div>
    </div>
  );
}

export default App;