import { bindActionCreators } from "redux";
import * as actionTypes from './actions';

const initialState = {
    counter: 0,
    results: []
}

const reducer = (state = initialState, action) => {

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
        case actionTypes.STORE_RESULT: //Immutability
            return {
                ...state,
                results: state.results.concat({id: new Date(), value: state.counter}) //This returns a new array, making it immutable. Push touches original results.
            }
        case actionTypes.DELETE_RESULT:
            //const id = 2;
            //const newArray = [...state.results] //CREATE COPY OF ARRAY. Objects are still pointing to original array. It's not enough. (It is okay if planning on deleting)
            //newArray.splice(id, 1);

            //New Way:
            //const updatedArray = state.results.filter((result, index) => index !== action.id); //RETURNS A NEW ARRAY ENTIRELY. Function with filter must return true or false. Creates a copy if all true. 
            const updatedArray = state.results.filter(result => result.id !== action.id);
            return {
                ...state,
                results: updatedArray
            }
        default:
            return state;
    }

}

export default reducer;