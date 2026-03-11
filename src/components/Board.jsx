import React from 'react';
import Tile from './tile';
import {COLORS} from '../constants/config';

const GameBoard =({grid, newTiles, mergedTiles}) => {
    const isTileNew =(row, col) => {
        return newTiles.some(t => t.row === row && t.col === col);
    };
    const isTileMerged = (row, col) =>{
        return mergedTiles.some(t=> t.row === row && t.col === col);
    };
    return(
      <div style={{
        background: COLORS.gridBackground,
        borderRadius:'10px',
        padding:'15px',
        position:'relative'
      }}>
        <div style={{
            display:'grid',
            gridTemplateColumns:'repeat(4, 1fr)',
            gap:'15px',
        }}>
            {grid.map((row, i)=>
              row.map((cell, j) => (
                <Tile
                key={`${i}-${j}`}
                value={cell}
                isNew={isTileNew(i,j)}
                isMerged={isTileMerged(i,j)}
                />
              ))
            )}
        </div>
      </div>
    );
};
export default GameBoard;