import React, { Component } from 'react';
import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Aux from '../../hoc/Aux'
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import axios from '../../Axios-orders';
import Spinner from '../../components/UI/Spinner/Spinner'
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler';
import { connect } from 'react-redux';
import * as BBActions from '../../store/actions/index';


//EXPORT USED FOR TESTING
export class BurgerBuilder extends Component {
    state = {
        purchasing: false,
    }

    componentDidMount() {
        this.props.onInitIngredients();     
    }

    updatePurchaseState(ing) {
        const sum = Object.keys(ing)
        .map( igKey => {
                return ing[igKey];
            })
         .reduce((s, el) => {
             return s + el;
         },0)

         return sum > 0
    }

    addIngHandler = (type) => {
        // const oldCount = this.state.ingredients[type];
        // const updatedCount = oldCount + 1;
        // const updatedIng = {
        //     ...this.state.ingredients
        // };
        // updatedIng[type] = updatedCount;

        // const priceAddition = INGREDIENT_PRICES[type]
        // const newPrice = this.state.totalPrice + priceAddition;

        // this.setState({totalPrice: newPrice, ingredients: updatedIng})
        // this.updatePurchaseState(updatedIng)
    }

    removeIngHandler = (type) => {
        // const oldCount = this.state.ingredients[type];
        // const updatedCount = oldCount - 1;

        // if(updatedCount < 0)
        // {
        //     return;
        // }

        // const updatedIng = {
        //     ...this.state.ingredients
        // };
        // updatedIng[type] = updatedCount;

        // const priceDed = INGREDIENT_PRICES[type]
        // const newPrice = this.state.totalPrice - priceDed;

        // this.setState({totalPrice: newPrice, ingredients: updatedIng})
        // this.updatePurchaseState(updatedIng)
    }

    bunSeedHandler = () => {
        this.setState({seedlessBun: !this.state.seedlessBun})
    }

    //Initially this fails, but its the way this is being creaeted...
    //OLD SYNTAX DOES NOT WORK IF METHOD TRIGGERED BY EVENT!
    //purchaseHandler() {
    //    this.setState({purchasing: true})
    //}

    purchaseHandler = () => {
        if(this.props.isAuthenticated)
        {
            this.setState({purchasing: true});
        }
        else
        {
            this.props.onSetAuthRedirectPath('/checkout')
            this.props.history.push('/auth');
        }
        
    }

    purchaseCancelHandler = () => {
        this.setState({purchasing: false});
    }

    purchaseContinueHandler = () => {
        //Firebase - JSON endpoint
        // Note - price calculations should be done server side.
        // this.setState({loading: true})

        // Pass Ingredients via search params
        // const queryParams = [];

        // Array with strings: PropertyName=PropertyValue
        // for(let i in this.props.ings) {
        //     queryParams.push(encodeURIComponent(i) + '=' + encodeURIComponent(this.props.ings[i]));
        // }
        // queryParams.push('seedless=' + this.props.seedlessBun);
        // queryParams.push('price=' + this.props.totalPrice);

        // const queryString = queryParams.join('&');

        //No longer need the rest of this because handled in Redux.
        this.props.onInitPurchase();
        this.props.history.push({
            pathname: '/checkout',
            // search: '?' + queryString
        });


    }


    render() {
        const disabledInfo = {
            ...this.props.ings
        };

        for(let key in disabledInfo) {
            disabledInfo[key] = disabledInfo[key] <= 0;
        }

        let orderSummary = null;
        let burger = this.props.error? <p style={{textAlign:'center'}}>Ingredients cannot be loaded!</p> : <Spinner/>

        if(this.props.ings)
        {
            orderSummary = <OrderSummary 
                ingredients={this.props.ings} 
                bun={this.props.seedlessBun ? "Seedless" : "With Seeds"}
                purchaseCanceled={this.purchaseCancelHandler}
                purchaseContinued={this.purchaseContinueHandler}
                price={this.props.totalPrice}
                />

            burger = (<Aux>
                <Burger ingredients={this.props.ings} bun={this.props.seedlessBun}/>
                <BuildControls 
                    ingredientAdded={this.props.onIngredientAdded} 
                    ingredientRemoved={this.props.onIngredientRemoved}
                    bunChanger={this.props.changeBunStyle}
                    currentBun={this.props.seedlessBun}
                    disabled={disabledInfo}
                    price={this.props.totalPrice}
                    purchaseable={this.updatePurchaseState(this.props.ings)}
                    order={this.purchaseHandler}
                    isAuth={this.props.isAuthenticated}/>
                    </Aux>);
        }

        return(
            <Aux>
                <Modal visible={this.state.purchasing} modalClosed={this.purchaseCancelHandler}>
                    {orderSummary}
                </Modal>

                {burger}
                
            </Aux>
        );
    }
}

const mapStateToProps = state => {
    return {
        ings: state.burgerBuilder.ingredients,
        totalPrice: state.burgerBuilder.totalPrice,
        seedlessBun: state.burgerBuilder.seedlessBun,
        error: state.burgerBuilder.error,
        isAuthenticated: state.auth.token !== null
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onIngredientAdded: (ingName) => dispatch(BBActions.addIngredient(ingName)), //{type: actionTypes.ADD_INGREDIENT, ingredientName: ingName}
        onIngredientRemoved: (ingName) => dispatch(BBActions.removeIngredient(ingName)),
        changeBunStyle: () => dispatch(BBActions.changeBunStyle()),
        onInitIngredients: () => dispatch(BBActions.initIngredients()),
        onInitPurchase: () => dispatch(BBActions.purchaseInit()),
        onSetAuthRedirectPath: (path) => dispatch(BBActions.setAuthRedirectPath(path))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withErrorHandler(BurgerBuilder, axios));

/*
Here we change state - so we can save performance through unnecessary renderings
The modal needs updating to fix that.
Order Summary and Modal continually rerendered - EVEN IF INVISIBLE
*/