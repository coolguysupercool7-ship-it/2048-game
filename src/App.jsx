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

  // reset everything and start a new game
  const startNewGame = useCallback(() => {
    let freshBoard = makeEmptyBoard();
    // add 2 random tiles to start
    freshBoard = spawnRandomTile(freshBoard, setNewlySpawned);
    freshBoard = spawnRandomTile(freshBoard, setNewlySpawned);
    setTiles(freshBoard);
    setCurrentScore(0);
    setIsGameOver(false);
    setPlayerWon(false);
    setNewlySpawned([]);
    setRecentlyMerged([]);
  }, []);

  // run once when app loads
  useEffect(() => {
    startNewGame();
    // try to load saved high score from browser
    const savedBest = localStorage.getItem('2048-best');
    if (savedBest) {
      setTopScore(parseInt(savedBest));
    }
  }, [startNewGame]);

  // save best score whenever it changes
  useEffect(() => {
    if (currentScore > topScore) {
      setTopScore(currentScore);
      localStorage.setItem('2048-best', currentScore.toString());
    }
  }, [currentScore, topScore]);

  // main game logic - handles arrow key movements
  const processMove = useCallback((direction) => {
    if (isGameOver) return; // can't move if game is over

    let updatedBoard = tiles.map(row => [...row]);
    let somethingMoved = false;
    let pointsGained = 0;
    const mergedLocations = [];

    // using a small delay here makes the animations feel smoother
    // without this, tiles would snap instantly which looks jarring
    setTimeout(() => {
      if (direction === 'left') {
        // process each row from left to right
        for (let r = 0; r < BOARD_SIZE; r++) {
          const originalRow = [...updatedBoard[r]];
          const processedRow = slideAndMerge(originalRow);
          updatedBoard[r] = processedRow;
          
          // did anything actually change in this row?
          const rowChanged = originalRow.some((val, idx) => val !== processedRow[idx]);
          if (rowChanged) {
            somethingMoved = true;
            // check which tiles merged and add their values to score
            for (let c = 0; c < BOARD_SIZE; c++) {
              if (processedRow[c] > originalRow[c]) {
                pointsGained += processedRow[c];
                mergedLocations.push({ row: r, col: c });
              }
            }
          }
        }
      } else if (direction === 'right') {
        // same as left but reverse the row first
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
        // for vertical movement, work with columns instead of rows
        for (let c = 0; c < BOARD_SIZE; c++) {
          const originalCol = updatedBoard.map(row => row[c]);
          const processedCol = slideAndMerge(originalCol);
          
          // put the processed column back
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
        // same as up but reverse the column
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

      // only update game state if something actually moved
      if (somethingMoved) {
        // trigger merge animation
        setRecentlyMerged(mergedLocations);
        setTimeout(() => setRecentlyMerged([]), 150);
        
        // add points from merged tiles
        setCurrentScore(prev => prev + pointsGained);
        
        // wait a bit then spawn a new tile
        setTimeout(() => {
          updatedBoard = spawnRandomTile(updatedBoard, setNewlySpawned);
          setTiles(updatedBoard);

          // check if player hit 2048
          const has2048 = updatedBoard.some(row => row.includes(2048));
          if (has2048 && !playerWon) {
            setPlayerWon(true);
          }

          // check if player ran out of moves
          if (!hasValidMoves(updatedBoard)) {
            setIsGameOver(true);
          }
        }, 100);
      }
    }, 50);
  }, [tiles, isGameOver, playerWon]);

  // listen for keyboard input
  useEffect(() => {
    const handleKeyDown = (event) => {
      const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
      
      if (arrowKeys.includes(event.key)) {
        event.preventDefault(); // stop the page from scrolling
        
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
    
    // cleanup when component unmounts
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
        {/* title section */}
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

        {/* score display and restart button */}
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

        {/* the actual game board */}
        <Board tiles={tiles} newlySpawned={newlySpawned} recentlyMerged={recentlyMerged} />
        
        {/* instructions */}
        <HowToPlay />
        
        {/* win/lose popup */}
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
