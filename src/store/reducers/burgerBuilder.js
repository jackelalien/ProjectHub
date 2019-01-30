import * as actionTypes from '../actions/actionTypes';
import {updateObject } from '../utility'

const initialState = {
        ingredients: null,
        seedlessBun: false,
        error: false,
        totalPrice: 4,
        building: false
}

const INGREDIENT_PRICES = {
    lettuce: 0.5,
    cheese: 0.4,
    meat: 1.3,
    bacon: 0.7
}

const reducer = (state = initialState, action) => {
    switch(action.type)
    {
        case actionTypes.ADD_INGREDIENT:
            const updatedIngredient = {[action.ingredientName]: state.ingredients[action.ingredientName] + 1 }//Get the ingredient name dynamically
            const updatedIngredients = updateObject(state.ingredients, updatedIngredient)
            const updatedState = { ingredients: updatedIngredients,
                totalPrice: state.totalPrice + INGREDIENT_PRICES[action.ingredientName], building: true }
            return updateObject(state, updatedState); //Using Utility Function
        case actionTypes.DEL_INGREDIENT:
            return {
                ...state,
                ingredients: {
                    ...state.ingredients,
                    building: true,
                    [action.ingredientName]: state.ingredients[action.ingredientName] - 1 //Get the ingredient name dynamically
                },
                totalPrice: state.totalPrice - INGREDIENT_PRICES[action.ingredientName]
            }
        case actionTypes.CHANGE_BUN:
            const bunChange = !state.seedlessBun
            return {
                ...state,
                seedlessBun: bunChange
            }
        case actionTypes.SET_INGREDIENTS: //To set the order, do ingredients: { 1st Ing: action.ingredients.1st or whatever.}
            return {
                ...state,
                ingredients: action.ingredients,
                totalPrice: 4,
                building: false,
                error: false
            };
        case actionTypes.FETCH_ING_FAILED:
            return {
                ...state,
                error: true
            }
        default:
            return state;
    }
}

export default reducer;