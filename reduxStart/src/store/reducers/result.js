import { bindActionCreators } from "redux";
import * as actionTypes from '../actions';

const initialState = {
    results: []
}

const resultReducer = (state = initialState, action) => {

    switch(action.type)
    {
        case actionTypes.STORE_RESULT: //Immutability
            return {
                ...state,
                results: state.results.concat({id: new Date(), value: action.result}) //This returns a new array, making it immutable. Push touches original results.
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

export default resultReducer;