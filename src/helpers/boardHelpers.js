import { BOARD_SIZE } from '../config/gameSettings';

export function make_empty_board() {
  const rows = [];
  for (let i = 0; i < BOARD_SIZE; i++) {
    rows.push(new Array(BOARD_SIZE).fill(0));
  }
  return rows;
}

export function check_valid_moves(board) {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === 0) return true;
      
      if (col < BOARD_SIZE - 1 && board[row][col] === board[row][col + 1]) {
        return true;
      }
      
      if (row < BOARD_SIZE - 1 && board[row][col] === board[row + 1][col]) {
        return true;
      }
    }
  }
  return false;
}

export function slideAndMerge(line) {
  const non_zero = line.filter(val => val !== 0);
  const result = [];
  let idx = 0;
  
  while (idx < non_zero.length) {
    if (idx + 1 < non_zero.length && non_zero[idx] === non_zero[idx + 1]) {
      result.push(non_zero[idx] * 2);
      idx += 2;
    } else {
      result.push(non_zero[idx]);
      idx++;
    }
  }
  
  while (result.length < BOARD_SIZE) {
    result.push(0);
  }
  
  return result;
}

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
  
  if (empty_spots.length === 0) return current_board;
  
  const random_spot = empty_spots[Math.floor(Math.random() * empty_spots.length)];
  const new_value = Math.random() < 0.9 ? 2 : 4;
  
  const updated_board = current_board.map(row => [...row]);
  updated_board[random_spot.row][random_spot.col] = new_value;
  
  if (onTileSpawned) {
    onTileSpawned([random_spot]);
    setTimeout(() => onTileSpawned([]), 200);
  }
  
  return updated_board;
}
export function get_tile_style(value, colorScheme, fallback) {
  return colorScheme[value] || fallback;
}
