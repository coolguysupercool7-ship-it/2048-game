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
  const [current_score, setCurrentScore] = useState(0);
  const [top_score, setTopScore] = useState(0);
  const [is_game_over, setIsGameOver] = useState(false);
  const [player_won, setPlayerWon] = useState(false);
  const [newly_spawned, setNewlySpawned] = useState([]);
  const [recently_merged, setRecentlyMerged] = useState([]);

  // reset everything and start a new game
  const start_new_game = useCallback(() => {
    let fresh_board = make_empty_board();
    // add 2 random tiles to start
    fresh_board = spawn_random_tile(fresh_board, setNewlySpawned);
    fresh_board = spawn_random_tile(fresh_board, setNewlySpawned);
    setTiles(fresh_board);
    setCurrentScore(0);
    setIsGameOver(false);
    setPlayerWon(false);
    setNewlySpawned([]);
    setRecentlyMerged([]);
  }, []);

  // run once when app loads
  useEffect(() => {
    start_new_game();
    // try to load saved high score from browser
    const saved_best = localStorage.getItem('2048-best');
    if (saved_best) {
      setTopScore(parseInt(saved_best));
    }
  }, [start_new_game]);

  // save best score whenever it changes
  useEffect(() => {
    if (current_score > top_score) {
      setTopScore(current_score);
      localStorage.setItem('2048-best', current_score.toString());
    }
  }, [current_score, top_score]);

  // main game logic - handles arrow key movements
  const processMove = useCallback((direction) => {
    if (is_game_over) return; // can't move if game is over

    let updated_board = tiles.map(row => [...row]);
    let something_moved = false;
    let points_gained = 0;
    const merged_locations = [];

    // using a small delay here makes the animations feel smoother
    // without this, tiles would snap instantly which looks jarring
    setTimeout(() => {
      if (direction === 'left') {
        // process each row from left to right
        for (let r = 0; r < BOARD_SIZE; r++) {
          const original_row = [...updated_board[r]];
          const processed_row = slideAndMerge(original_row);
          updated_board[r] = processed_row;
          
          // did anything actually change in this row?
          const row_changed = original_row.some((val, idx) => val !== processed_row[idx]);
          if (row_changed) {
            something_moved = true;
            // check which tiles merged and add their values to score
            for (let c = 0; c < BOARD_SIZE; c++) {
              if (processed_row[c] > original_row[c]) {
                points_gained += processed_row[c];
                merged_locations.push({ row: r, col: c });
              }
            }
          }
        }
      } else if (direction === 'right') {
        // same as left but reverse the row first
        for (let r = 0; r < BOARD_SIZE; r++) {
          const original_row = [...updated_board[r]];
          const processed_row = slideAndMerge(original_row.reverse()).reverse();
          updated_board[r] = processed_row;
          
          const row_changed = original_row.some((val, idx) => val !== processed_row[idx]);
          if (row_changed) {
            something_moved = true;
            for (let c = 0; c < BOARD_SIZE; c++) {
              if (processed_row[c] > original_row[c]) {
                points_gained += processed_row[c];
                merged_locations.push({ row: r, col: c });
              }
            }
          }
        }
      } else if (direction === 'up') {
        // for vertical movement, work with columns instead of rows
        for (let c = 0; c < BOARD_SIZE; c++) {
          const original_col = updated_board.map(row => row[c]);
          const processed_col = slideAndMerge(original_col);
          
          // put the processed column back
          for (let r = 0; r < BOARD_SIZE; r++) {
            updated_board[r][c] = processed_col[r];
          }
          
          const col_changed = original_col.some((val, idx) => val !== processed_col[idx]);
          if (col_changed) {
            something_moved = true;
            for (let r = 0; r < BOARD_SIZE; r++) {
              if (processed_col[r] > original_col[r]) {
                points_gained += processed_col[r];
                merged_locations.push({ row: r, col: c });
              }
            }
          }
        }
      } else if (direction === 'down') {
        // same as up but reverse the column
        for (let c = 0; c < BOARD_SIZE; c++) {
          const original_col = updated_board.map(row => row[c]);
          const processed_col = slideAndMerge(original_col.reverse()).reverse();
          
          for (let r = 0; r < BOARD_SIZE; r++) {
            updated_board[r][c] = processed_col[r];
          }
          
          const col_changed = original_col.some((val, idx) => val !== processed_col[idx]);
          if (col_changed) {
            something_moved = true;
            for (let r = 0; r < BOARD_SIZE; r++) {
              if (processed_col[r] > original_col[r]) {
                points_gained += processed_col[r];
                merged_locations.push({ row: r, col: c });
              }
            }
          }
        }
      }

      // only update game state if something actually moved
      if (something_moved) {
        // trigger merge animation
        setRecentlyMerged(merged_locations);
        setTimeout(() => setRecentlyMerged([]), 150);
        
        // add points from merged tiles
        setCurrentScore(prev => prev + points_gained);
        
        // wait a bit then spawn a new tile
        setTimeout(() => {
          updated_board = spawn_random_tile(updated_board, setNewlySpawned);
          setTiles(updated_board);

          // check if player hit 2048
          const has_2048 = updated_board.some(row => row.includes(2048));
          if (has_2048 && !player_won) {
            setPlayerWon(true);
          }

          // check if player ran out of moves
          if (!check_valid_moves(updated_board)) {
            setIsGameOver(true);
          }
        }, 100);
      }
    }, 50);
  }, [tiles, is_game_over, player_won]);

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
