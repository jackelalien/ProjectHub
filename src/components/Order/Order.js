import React from 'react';
import classes from './Order.module.css';

const order = (props) => {
    const ingredients = [];

    for(let ingName in props.ingredients)
    {
        ingredients.push({
            name: ingName,
            amount: props.ingredients[ingName]
        })
    }

    const ingOutput = ingredients.map(
        ig => {
            return <span
            style={{textTransform: "capitalize", 
                    display: "inline-block",
                    margin: '0 8px',
                    border: '1px solid #ccc',
                    padding: '5px'
        }} 
            key={ig.name}>{ig.name} ({ig.amount})</span>;
        }
    );

    return (
        <div className={classes.Order}> 
            <p>Ingredients: {ingOutput}</p>
            <p>Price: <strong>${Number.parseFloat(props.price).toFixed(2)}</strong></p>
        </div>
    );
} 

export default order;