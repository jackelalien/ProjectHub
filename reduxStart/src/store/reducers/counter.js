import { bindActionCreators } from "redux";
import * as actionTypes from '../actions';

const initialState = {
    counter: 0,
}

const counterReducer = (state = initialState, action) => {

    switch(action.type)
    {
        case actionTypes.INCREMENT:
        // New Immutable Way
            return {
                ...state,
                counter: state.counter + 1
            };
        // Old Immutable Way
            // const newState = Object.assign({}, state); //Copy of new state, and return updated copy state to become new state. Technically new Object.
            // newState.counter = state.counter + 1;
            // return newState;
        case actionTypes.DECREMENT:
            return {
                ...state,
                counter: state.counter - 1
            };
        case actionTypes.ADD:
            return {
                ...state,
                counter: state.counter + action.value
            };
        case actionTypes.SUB:
            return {
                ...state,
                counter: state.counter - action.value
            };
        default:
            return state;
    }

}

export default counterReducer;