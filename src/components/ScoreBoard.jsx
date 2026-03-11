import React from 'react';
import {COLORS} from '../constants/config';

const ScoreBoard =({ score, bestScore }) => {
    return (
        <div style= {{ display: 'flex', gap:'10px' }}>
           <div style={{
            background:COLORS.scoreBackground,
            padding:'10px 20px',
            borderRadius:'5px',
            minWidth:'80px',
            textAlign:'center'
           }}>
           <div style={{
             color:COLORS.scoreText,  
             fontSize:'13px',
             fontWeight:'bold',
             textTransform:'uppercase'
           }}>Score</div>
            <div style={{
                color:'white',
                fontSize:'25px',
                fontWeight:'bold',
            }}>{score}</div>
        </div>
        <div style={{
          background:COLORS.scoreBackground,
          padding: '10px 20px',
          borderRadius:'3px',
          minWidth:'80px',
          textAlign:'center'
           }}>
              <div style={{
                color:'white',
                fontSize:'25px',
                fontWeight: 'bold',
              }}>{bestScore}</div>
        </div>
     </div>     
    );
};
export default ScoreBoard;