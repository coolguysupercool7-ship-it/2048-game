import { BOARD_SIZE } from '../config/gameSettings';

// Initialize fresh empty board
export function makeEmptyBoard() {
  const rows = [];
  for (let i = 0; i < BOARD_SIZE; i++) {
    rows.push(new Array(BOARD_SIZE).fill(0));
  }
  return rows;
}

// Check if player has any valid moves left
// Returns false only when board is full AND no adjacent tiles match
export function hasValidMoves(board) {
  // First check for empty cells
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === 0) return true;
      
      // Check right neighbor
      if (col < BOARD_SIZE - 1 && board[row][col] === board[row][col + 1]) {
        return true;
      }
      
      // Check bottom neighbor
      if (row < BOARD_SIZE - 1 && board[row][col] === board[row + 1][col]) {
        return true;
      }
    }
  }
  return false;
}

// Core slide logic: move tiles and merge matching ones
// This handles one row/column at a time
export function slideAndMerge(line) {
  // Remove zeros first
  const nonZero = line.filter(val => val !== 0);
  const result = [];
  let idx = 0;
  
  // Merge matching adjacent tiles
  while (idx < nonZero.length) {
    if (idx + 1 < nonZero.length && nonZero[idx] === nonZero[idx + 1]) {
      result.push(nonZero[idx] * 2);
      idx += 2; // skip the merged tile
    } else {
      result.push(nonZero[idx]);
      idx++;
    }
  }
  
  // Pad with zeros to maintain board size
  while (result.length < BOARD_SIZE) {
    result.push(0);
  }
  
  return result;
}

// Add a random 2 or 4 tile to an empty spot
// 90% chance of 2, 10% chance of 4 (classic 2048 rules)
export function spawnRandomTile(currentBoard, onTileSpawned) {
  const emptySpots = [];
  
  currentBoard.forEach((row, rowIdx) => {
    row.forEach((cell, colIdx) => {
      if (cell === 0) {
        emptySpots.push({ row: rowIdx, col: colIdx });
      }
    });
  });
  
  if (emptySpots.length === 0) return currentBoard;
  
  const randomSpot = emptySpots[Math.floor(Math.random() * emptySpots.length)];
  const newValue = Math.random() < 0.9 ? 2 : 4;
  
  // Deep copy board to avoid mutations
  const updatedBoard = currentBoard.map(row => [...row]);
  updatedBoard[randomSpot.row][randomSpot.col] = newValue;
  
  // Notify parent component about new tile position for animation
  if (onTileSpawned) {
    onTileSpawned([randomSpot]);
    setTimeout(() => onTileSpawned([]), 200);
  }
  
  return updatedBoard;
}

// Get styling for a tile based on its value
export function determineTileStyle(value, colorScheme, fallback) {
  return colorScheme[value] || fallback;
}