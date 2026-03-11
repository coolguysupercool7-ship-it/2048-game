import React, { useState, useEffect, useCallback } from 'react';
import GameBoard from './components/GameBoard';
import ScoreBoard from './components/ScoreBoard';
import GameOverModal from './components/GameOverModal';
import Instructions from './components/Instructions';
import { createEmptyGrid, canMove, slide, addRandomTile } from './utils/gameLogic';
import { GRID_SIZE, COLORS } from './constants/config';
import './styles/animations.css';

const App = () => {
  const [grid, setGrid] = useState([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [newTiles, setNewTiles] = useState([]);
  const [mergedTiles, setMergedTiles] = useState([]);

  const initGame = useCallback(() => {
    let newGrid = createEmptyGrid();
    newGrid = addRandomTile(newGrid, setNewTiles);
    newGrid = addRandomTile(newGrid, setNewTiles);
    setGrid(newGrid);
    setScore(0);
    setGameOver(false);
    setWon(false);
    setNewTiles([]);
    setMergedTiles([]);
  }, []);

  useEffect(() => {
    initGame();
    const saved = localStorage.getItem('2048-best');
    if (saved) setBestScore(parseInt(saved));
  }, [initGame]);

  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem('2048-best', score.toString());
    }
  }, [score, bestScore]);

  // WRAP move IN useCallback
  const move = useCallback((direction) => {
    if (gameOver) return;

    let newGrid = grid.map(row => [...row]);
    let moved = false;
    let scoreIncrease = 0;
    const mergedPositions = [];

    setTimeout(() => {
      if (direction === 'left') {
        for (let i = 0; i < GRID_SIZE; i++) {
          const oldRow = [...newGrid[i]];
          const newRow = slide(oldRow);
          newGrid[i] = newRow;
          
          if (JSON.stringify(oldRow) !== JSON.stringify(newRow)) {
            moved = true;
            for (let j = 0; j < GRID_SIZE; j++) {
              if (newRow[j] > oldRow[j]) {
                scoreIncrease += newRow[j];
                mergedPositions.push({ row: i, col: j });
              }
            }
          }
        }
      } else if (direction === 'right') {
        for (let i = 0; i < GRID_SIZE; i++) {
          const oldRow = [...newGrid[i]];
          const newRow = slide(oldRow.reverse()).reverse();
          newGrid[i] = newRow;
          
          if (JSON.stringify(oldRow) !== JSON.stringify(newRow)) {
            moved = true;
            for (let j = 0; j < GRID_SIZE; j++) {
              if (newRow[j] > oldRow[j]) {
                scoreIncrease += newRow[j];
                mergedPositions.push({ row: i, col: j });
              }
            }
          }
        }
      } else if (direction === 'up') {
        for (let j = 0; j < GRID_SIZE; j++) {
          const column = newGrid.map(row => row[j]);
          const oldColumn = [...column];
          const newColumn = slide(column);
          
          for (let i = 0; i < GRID_SIZE; i++) {
            newGrid[i][j] = newColumn[i];
          }
          
          if (JSON.stringify(oldColumn) !== JSON.stringify(newColumn)) {
            moved = true;
            for (let i = 0; i < GRID_SIZE; i++) {
              if (newColumn[i] > oldColumn[i]) {
                scoreIncrease += newColumn[i];
                mergedPositions.push({ row: i, col: j });
              }
            }
          }
        }
      } else if (direction === 'down') {
        for (let j = 0; j < GRID_SIZE; j++) {
          const column = newGrid.map(row => row[j]);
          const oldColumn = [...column];
          const newColumn = slide(column.reverse()).reverse();
          
          for (let i = 0; i < GRID_SIZE; i++) {
            newGrid[i][j] = newColumn[i];
          }
          
          if (JSON.stringify(oldColumn) !== JSON.stringify(newColumn)) {
            moved = true;
            for (let i = 0; i < GRID_SIZE; i++) {
              if (newColumn[i] > oldColumn[i]) {
                scoreIncrease += newColumn[i];
                mergedPositions.push({ row: i, col: j });
              }
            }
          }
        }
      }

      if (moved) {
        setMergedTiles(mergedPositions);
        setTimeout(() => setMergedTiles([]), 150);
        
        setScore(prev => prev + scoreIncrease);
        
        setTimeout(() => {
          newGrid = addRandomTile(newGrid, setNewTiles);
          setGrid(newGrid);

          if (newGrid.flat().includes(2048) && !won) {
            setWon(true);
          }

          if (!canMove(newGrid)) {
            setGameOver(true);
          }
        }, 100);
      }
    }, 50);
  }, [grid, gameOver, won]); // ADD DEPENDENCIES HERE

  // ADD move TO THE DEPENDENCY ARRAY
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const directionMap = {
          'ArrowUp': 'up',
          'ArrowDown': 'down',
          'ArrowLeft': 'left',
          'ArrowRight': 'right'
        };
        move(directionMap[e.key]);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [move]); // CHANGED: added 'move' to dependency array

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: COLORS.background,
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
            color: COLORS.text,
            margin: '0 0 10px 0'
          }}>2048</h1>
          <p style={{ 
            color: COLORS.text,
            fontSize: '18px',
            margin: 0,
            fontWeight: 'bold'
          }}>Join the tiles, get to <strong>2048!</strong></p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <ScoreBoard score={score} bestScore={bestScore} />
            <button
              onClick={initGame}
              style={{
                background: COLORS.button,
                color: '#f9f6f2',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '5px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = COLORS.buttonHover}
              onMouseOut={(e) => e.target.style.background = COLORS.button}
            >
              New Game
            </button>
          </div>
        </div>

        <GameBoard grid={grid} newTiles={newTiles} mergedTiles={mergedTiles} />
        <Instructions />
        <GameOverModal gameOver={gameOver} won={won} score={score} onRestart={initGame} />
      </div>
    </div>
  );
};

export default App;