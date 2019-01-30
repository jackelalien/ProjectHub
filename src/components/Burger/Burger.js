import React from 'react';
import classes from './Burger.module.css';
import BurgerIngredient from './BurgerIngredient/BurgerIngredient';

const burger = (props) => {

    let tIngredients = Object.keys(props.ingredients)
    .map(igKey => {
        return [...Array(props.ingredients[igKey])].map((_, i) => {
            return <BurgerIngredient key={igKey + i} type={igKey} />
        }) //[,]
    }).reduce((arr, el) => {
        return arr.concat(el);
    }, []); //Get the keys and amounts, transform to an array (and a flattened array at that)

    //What if we have no ingredients? We need ingredients, and a message is needed. Flatten the array to get values of inner arrays, and get an array containing inner values.
    if(tIngredients.length === 0)
    {
        tIngredients = <p>Please start adding ingredients!</p>
    }


    return (
        <div className={classes.Burger}>
            <BurgerIngredient type={props.bun ? "bread-seedless" : "bread-top"}/>
            {tIngredients}
            <BurgerIngredient type="bread-bottom"/>

        </div>
    );
}

export default burger;