import React from 'react';
import classes from './CheckoutSummary.module.css';
import Button from '../../UI/Button/Button'
import Burger from '../../Burger/Burger';


const checkoutSummary = (props) => {
    return(
        <div className={classes.CheckoutSummary}>
            <h1>We hope it tastes well!</h1>
            <div style={{width: '100%', margin: 'auto'}}> 
                <Burger ingredients={props.ingredients} bun={props.bunType}/>
            </div>

            <Button btnType="Danger" clicked={props.checkoutCanceled}>CANCEL</Button>
            <Button btnType="Success" clicked={props.checkoutContinued}>CONTINUE</Button>
        </div>
    )
}

export default checkoutSummary;