import { BOARD_SIZE } from '../config/gameSettings';

// creates a fresh 4x4 board filled with zeros
// creates a fresh 4x4 board filled with zeros
export function make_empty_board() {
  const rows = [];
  for (let i = 0; i < BOARD_SIZE; i++) {
    rows.push(new Array(BOARD_SIZE).fill(0));
  }
  return rows;
}

// checks if the player can still make any moves
// game over when board is full AND no adjacent matching tiles
export function check_valid_moves(board) {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      // any empty cell means we can still play
      if (board[row][col] === 0) return true;
      
      // check if right neighbor matches
      if (col < BOARD_SIZE - 1 && board[row][col] === board[row][col + 1]) {
        return true;
      }
      
      // check if bottom neighbor matches
      if (row < BOARD_SIZE - 1 && board[row][col] === board[row + 1][col]) {
        return true;
      }
    }
  }
  return false;
}

// handles sliding tiles in one direction and merging matches
// works on a single row or column at a time
export function slideAndMerge(line) {
  // step 1: remove all the zeros
  const non_zero = line.filter(val => val !== 0);
  const result = [];
  let idx = 0;
  
  // step 2: merge matching adjacent tiles
  while (idx < non_zero.length) {
    if (idx + 1 < non_zero.length && non_zero[idx] === non_zero[idx + 1]) {
      // found a match! merge them
      result.push(non_zero[idx] * 2);
      idx += 2; // skip both tiles
    } else {
      // no match, just keep the tile
      result.push(non_zero[idx]);
      idx++;
    }
  }
  
  // step 3: pad with zeros to keep the same length
  while (result.length < BOARD_SIZE) {
    result.push(0);
  }
  
  return result;
}

// spawns a new tile (2 or 4) in a random empty spot
// classic 2048 rules: 90% chance for 2, 10% chance for 4
export function spawn_random_tile(current_board, onTileSpawned) {
  const empty_spots = [];
  
  // find all empty positions
  current_board.forEach((row, rowIdx) => {
    row.forEach((cell, colIdx) => {
      if (cell === 0) {
        empty_spots.push({ row: rowIdx, col: colIdx });
      }
    });
  });
  
  // board is full, can't spawn
  if (empty_spots.length === 0) return current_board;
  
  // pick a random empty spot
  const random_spot = empty_spots[Math.floor(Math.random() * empty_spots.length)];
  const new_value = Math.random() < 0.9 ? 2 : 4;
  
  // create a copy to avoid mutating the original
  const updated_board = current_board.map(row => [...row]);
  updated_board[random_spot.row][random_spot.col] = new_value;
  
  // notify parent component so it can animate the new tile
  if (onTileSpawned) {
    onTileSpawned([random_spot]);
    // clear after animation finishes
    setTimeout(() => onTileSpawned([]), 200);
  }
  
  return updated_board;
}

// gets the color scheme for a tile based on its value
export function get_tile_style(value, colorScheme, fallback) {
  return colorScheme[value] || fallback;
}
