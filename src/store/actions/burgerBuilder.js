//Sync Action Creators
import * as actionTypes from './actionTypes';
import axios from '../../Axios-orders'

export const addIngredient = (name) => {
    return {
        type: actionTypes.ADD_INGREDIENT,
        ingredientName: name
    }
}

export const removeIngredient = (name) => {
    return {
        type: actionTypes.DEL_INGREDIENT,
        ingredientName: name
    }
}

export const changeBunStyle = () => {
    return{
        type: actionTypes.CHANGE_BUN
    }
}

export const fetchIngFailed = () => {
    return {
        type: actionTypes.FETCH_ING_FAILED
    }
}

export const setIngredients = (ingredients) => {
    return {
        type: actionTypes.SET_INGREDIENTS,
        ingredients: ingredients
    }
}

export const initIngredients = () => {
    return dispatch => {
        axios.get('https://myburger-react-a5b01.firebaseio.com/ingredients.json')
            .then(response => {
                dispatch(setIngredients(response.data))
            })
            .catch(error => {
                dispatch(fetchIngFailed());
            })
    }
}