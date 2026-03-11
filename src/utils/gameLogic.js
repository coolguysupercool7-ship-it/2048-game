import {GRID_SIZE} from '../constants/config';
export const createEmptyGrid =()=> {
    return Array(GRID_SIZE).fill(null).map(()=> Array(GRID_SIZE).fill(0));
};
export const canMove = (grid) => {
    for (let i=0; i<GRID_SIZE; i++){
        for (let j = 0; j < GRID_SIZE; j++) {
            if (grid[i][j] === 0) return true;
            if (j < GRID_SIZE -1 && grid[i][j] === grid[i][j+1]) return true;
            if (i < GRID_SIZE -1 && grid[i][j] === grid[i+1][j]) return true;
        }
    }
    return false;
};
export const slide = (row) => {
    const filtered = row.filter(val => val !== 0);
    const merged = [];
    let i = 0;
    while (i < filtered.length){
        if (i+1 <filtered.length && filtered[i] === filtered[i+1]) {
            merged.push(filtered[i] * 2);
            i += 2;
        }else {
            merged.push(filtered[i]);
            i++;
        }
    }
    while (merged.length < GRID_SIZE) {
        merged.push(0);
    }
    return merged;
};
export const addRandomTile = (currentGrid, setNewTiles) => {
    const emptyPositions =[];
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (currentGrid[i][j] === 0) {
                emptyPositions.push({ row: i, col: j});
            }
        }
    }
    if (emptyPositions.length > 0) {
        const { row, col } = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
        const newGrid = currentGrid.map(r => [...r]);
        newGrid[row][col] = Math.random() < 0.9 ? 2:4;
        if(setNewTiles) {
            setNewTiles ([{ row, col}]);
            setTimeout (() => setNewTiles([]), 200);
        }
        return newGrid;
    }
    return currentGrid;
};
export const getTileStyle = (value, titleStyles, defaultStyle) => {
    return titleStyles[value] || defaultStyle;
};