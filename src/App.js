import React, { useState, useEffect, useCallback } from 'react';

const GRID_SIZE = 4;

const getTileStyle = (value) => {
  const styles = {
    0: { bg: 'rgba(238, 228, 218, 0.35)', color: 'transparent', fontSize: '55px' },
    2: { bg: '#eee4da', color: '#776e65', fontSize: '55px' },
    4: { bg: '#ede0c8', color: '#776e65', fontSize: '55px' },
    8: { bg: '#f2b179', color: '#f9f6f2', fontSize: '55px' },
    16: { bg: '#f59563', color: '#f9f6f2', fontSize: '55px' },
    32: { bg: '#f67c5f', color: '#f9f6f2', fontSize: '55px' },
    64: { bg: '#f65e3b', color: '#f9f6f2', fontSize: '55px' },
    128: { bg: '#edcf72', color: '#f9f6f2', fontSize: '45px' },
    256: { bg: '#edcc61', color: '#f9f6f2', fontSize: '45px' },
    512: { bg: '#edc850', color: '#f9f6f2', fontSize: '45px' },
    1024: { bg: '#edc53f', color: '#f9f6f2', fontSize: '35px' },
    2048: { bg: '#edc22e', color: '#f9f6f2', fontSize: '35px' },
  };
  return styles[value] || { bg: '#3c3a32', color: '#f9f6f2', fontSize: '30px' };
};

const Game2048 = () => {
  const [grid, setGrid] = useState([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [newTiles, setNewTiles] = useState([]);
  const [mergedTiles, setMergedTiles] = useState([]);

  const createEmptyGrid = () => {
    return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
  };

  const addRandomTile = (currentGrid) => {
    const emptyPositions = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (currentGrid[i][j] === 0) {
          emptyPositions.push({ row: i, col: j });
        }
      }
    }
    
    if (emptyPositions.length > 0) {
      const { row, col } = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
      const newGrid = currentGrid.map(r => [...r]);
      newGrid[row][col] = Math.random() < 0.9 ? 2 : 4;
      setNewTiles([{ row, col }]);
      setTimeout(() => setNewTiles([]), 200);
      return newGrid;
    }
    return currentGrid;
  };

  const initGame = useCallback(() => {
    let newGrid = createEmptyGrid();
    newGrid = addRandomTile(newGrid);
    newGrid = addRandomTile(newGrid);
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

  const canMove = (grid) => {
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (grid[i][j] === 0) return true;
        if (j < GRID_SIZE - 1 && grid[i][j] === grid[i][j + 1]) return true;
        if (i < GRID_SIZE - 1 && grid[i][j] === grid[i + 1][j]) return true;
      }
    }
    return false;
  };

  const slide = (row) => {
    const filtered = row.filter(val => val !== 0);
    const merged = [];
    let i = 0;
    
    while (i < filtered.length) {
      if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
        merged.push(filtered[i] * 2);
        i += 2;
      } else {
        merged.push(filtered[i]);
        i++;
      }
    }
    
    while (merged.length < GRID_SIZE) {
      merged.push(0);
    }
    
    return merged;
  };

  const move = (direction) => {
    if (gameOver) return;

    let newGrid = grid.map(row => [...row]);
    let moved = false;
    let scoreIncrease = 0;
    const mergedPositions = [];

    // Add a small delay before processing the move for smoother feel
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
          newGrid = addRandomTile(newGrid);
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
  };

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
  }, [grid, gameOver]);

  const isTileNew = (row, col) => {
    return newTiles.some(t => t.row === row && t.col === col);
  };

  const isTileMerged = (row, col) => {
    return mergedTiles.some(t => t.row === row && t.col === col);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#faf8ef',
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
            color: '#776e65',
            margin: '0 0 10px 0'
          }}>2048</h1>
          <p style={{ 
            color: '#776e65',
            fontSize: '18px',
            margin: 0,
            fontWeight: 'bold'
          }}>Join the tiles, get to <strong>2048!</strong></p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ 
                background: '#bbada0',
                padding: '10px 20px',
                borderRadius: '5px',
                minWidth: '80px',
                textAlign: 'center'
              }}>
                <div style={{ 
                  color: '#eee4da',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}>Score</div>
                <div style={{ 
                  color: 'white',
                  fontSize: '25px',
                  fontWeight: 'bold'
                }}>{score}</div>
              </div>
              <div style={{ 
                background: '#bbada0',
                padding: '10px 20px',
                borderRadius: '3px',
                minWidth: '80px',
                textAlign: 'center'
              }}>
                <div style={{ 
                  color: '#eee4da',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}>Best</div>
                <div style={{ 
                  color: 'white',
                  fontSize: '25px',
                  fontWeight: 'bold'
                }}>{bestScore}</div>
              </div>
            </div>
            <button
              onClick={initGame}
              style={{
                background: '#8f7a66',
                color: '#f9f6f2',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '5px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = '#9f8a76'}
              onMouseOut={(e) => e.target.style.background = '#8f7a66'}
            >
              New Game
            </button>
          </div>
        </div>

        <div style={{ 
          background: '#bbada0',
          borderRadius: '10px',
          padding: '15px',
          position: 'relative'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '15px',
          }}>
            {grid.map((row, i) =>
              row.map((cell, j) => {
                const style = getTileStyle(cell);
                return (
                  <div
                    key={`${i}-${j}`}
                    style={{
                      aspectRatio: '1',
                      background: style.bg,
                      color: style.color,
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: style.fontSize,
                      fontWeight: 'bold',
                      transition: 'all 0.15s ease-in-out',
                      transform: isTileNew(i, j) ? 'scale(1)' : isTileMerged(i, j) ? 'scale(1)' : 'scale(1)',
                      animation: isTileNew(i, j) ? 'appear 0.2s' : isTileMerged(i, j) ? 'pop 0.15s' : 'none'
                    }}
                  >
                    {cell !== 0 && cell}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <p style={{ 
            color: '#776e65',
            fontSize: '18px',
            fontWeight: 'bold',
            margin: '0 0 10px 0'
          }}>
            HOW TO PLAY
          </p>
          <p style={{ 
            color: '#776e65',
            fontSize: '14px',
            lineHeight: '1.6',
            margin: 0
          }}>
            Use your <strong>arrow keys</strong> to move the tiles. Tiles with the same number <strong>merge into one</strong> when they touch. Add them up to reach <strong>2048!</strong>
          </p>
        </div>

        {(gameOver || won) && (
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
            zIndex: 100
          }}>
            <div style={{
              background: 'white',
              borderRadius: '10px',
              padding: '40px',
              textAlign: 'center',
              maxWidth: '400px',
              margin: '20px'
            }}>
              <h2 style={{ 
                fontSize: '55px',
                fontWeight: 'bold',
                color: '#776e65',
                margin: '0 0 20px 0'
              }}>
                {won ? 'You win!' : 'Game over!'}
              </h2>
              <p style={{ 
                color: '#776e65',
                fontSize: '16px',
                marginBottom: '30px'
              }}>
                Final Score: <strong style={{ fontSize: '32px', display: 'block', marginTop: '10px' }}>{score}</strong>
              </p>
              <button
                onClick={initGame}
                style={{
                  background: '#8f7a66',
                  color: '#f9f6f2',
                  border: 'none',
                  padding: '15px 40px',
                  borderRadius: '5px',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Try again
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes appear {
          0% {
            opacity: 0;
            transform: scale(0);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes pop {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default Game2048;