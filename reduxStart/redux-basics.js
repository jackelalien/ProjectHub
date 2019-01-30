const redux = require('redux');
const createStore = redux.createStore;

const initialState = {
    counter: 0
}

//Reducer (Root)
const rootReducer = (state = initialState, action) => {
    if(action.type == "INC_COUNTER")
    {
        //state.counter++; //DOES NOT WORK - NEVER MUTATE ANY DATA DIRECTLY. IF COUNTER WAS AN OBJECT, COPY ITS PROPS
        return {
            ...state,
            counter: state.counter + 1
        }
    }
    if(action.type == "ADD_COUNTER")
    {
        return {
            ...state,
            counter: state.counter + action.value
        }
    }

    return state;
}

//Store (Central)
const store = createStore(rootReducer);
console.log(store.getState());

//Subscription - Runs every time state is updated!
store.subscribe(() => {
    console.log("[Subscription]", store.getState());
});

//Dispatching Action
store.dispatch({
    type: 'INC_COUNTER'
});
store.dispatch({
    type: 'ADD_COUNTER', value: 10
});
console.log(store.getState());

