import React from 'react';

const userInput = (props) => {
    const style = {
        border: '2px solid red'

    };

    return(
            <input type="text" style={style} onChange={props.changed} value={props.currName}/>
        
    ); 
}


export default userInput;