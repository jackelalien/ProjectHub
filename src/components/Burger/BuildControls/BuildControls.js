import React from 'react';
import classes from './BuildControls.module.css';
import BuildControl from './BuildControl/BuildControl';

const controls = [
    { label: 'Meat', type: 'meat' },
    { label: 'Cheese', type: 'cheese' },
    { label: 'Lettuce', type: 'lettuce' },
    { label: 'Bacon', type: 'bacon' }
];

const buildControls = (props) => (
    <div className={classes.BuildControls}>
        <p>Current Price: <strong>${props.price.toFixed(2)}</strong></p>
        {controls.map(ctrl => (
            <BuildControl 
            key={ctrl.label} 
            label={ctrl.label} 
            added={() => props.ingredientAdded(ctrl.type)} 
            removed={() => props.ingredientRemoved(ctrl.type)} 
            disabled={props.disabled[ctrl.type]}/>
        ))}
        <p>
            <label className={classes.Label}>Seedless Bun?</label>
            <input className={classes.Checkbox} checked={props.currentBun} type='checkbox' onChange={() => props.bunChanger()}/>
        </p>
        <button className={classes.OrderButton} disabled={!props.purchaseable} onClick={props.order}>{props.isAuth ? "Place Order" : "Sign up to Order"}</button>


    </div>
);

export default buildControls;