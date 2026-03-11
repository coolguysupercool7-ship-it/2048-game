import React from 'react';
import {TILE_STYLES, DEFAULT_TILE_STYLE} from '../constants/config';
import'../styles/animations.css';
import { getTileStyle } from '../utils/gameLogic';

const Tile =({value,isNew,isMerged}) =>{
    const style =getTileStyle(value, TILE_STYLES, DEFAULT_TILE_STYLE);
    return(
        <div
        style={{
            aspectRatio:'1',
            background:style.bg,
            color:style.color,
            borderRadius: '6px',
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            fontSize:style.fontSize,
            fontWeight:'bold',
            transition:'all 0.15s ease-in-out',
            transform:'scale(1)',
            animation:isNew ? 'appear 0.2s': isMerged ? 'pop 0.15s' : 'none'
        }}
        >
        {value !== 0 && value}
        </div>
    );
};
export default Tile;