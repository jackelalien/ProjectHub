export const INCREMENT = 'INCREMENT';
export const DECREMENT = 'DECREMENT';
export const ADD = 'ADD';
export const SUB = 'SUB';
export const STORE_RESULT = 'STORE_RESULT';
export const DELETE_RESULT = 'DELETE_RESULT';

//Action Creators are just like mapDispatchToProps.
// Action creator returns JS objects.

//Synchronous Code
export const increment = () => {
    return {
        type: INCREMENT
    }
}

export const decrement = () => {
    return {
        type: DECREMENT
    }
}

export const add = (value) => {
    return {
        type: ADD,
        value: value
    }
}

export const sub = (value) => {
    return {
        type: SUB,
        value: value
    }
}

export const storeResult_ASYNC = (res) => {
    return {
        type: STORE_RESULT,
        result: res
    }
}

//ASYNC VERSION
export const storeResult = (res) => {
    // Redux Thunk Blocks our middleware to delay and be async.
    return dispatch => {
        setTimeout(() => {
            dispatch(storeResult_ASYNC(res))
        }, 2000);
    }
    
}

export const deleteResult = (resElID) => {
    return {
        type: DELETE_RESULT,
        id: resElID
    }
}