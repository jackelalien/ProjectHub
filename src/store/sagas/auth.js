//A saga - a kind of a function with a twist.
// Related to actions
// * - turns function into a generator. Next Gen JS which functions that are executed incrementally (don't run start to end immediately, can pause mid exec)

import {put} from 'redux-saga/effects'; //dispatches new action
import * as actionTypes from '../actions/actionTypes';

export function* logoutSaga(action) {
    yield console.log('Logout Saga');
    yield localStorage.removeItem('token'); //Executed, wait until it is finished. If async, won't continue until step done.
    yield localStorage.removeItem('expirationTime');
    yield localStorage.removeItem('userId');
    yield put({
        type: actionTypes.AUTH_LOGOUT
    });
}

//Note: Handling Auto Sign In
/*
    export function* authCheckStateSaga(action) {
        //Copy Code from actions folder.
        const token = yield localStorage.getItem('token');

        if(!token) {
            yield put(actions.logout());
        } else {
            const expirationTime = yield new Date(localStorage.getItem('expirationTime'));

            if(expirationTime <= new Date()) {
                yield put(actions.logout());
            }
            else
            {
                const userId = yield localStorage.getItem('userId');
                yield put(actions.authSuccess(token, userId));
                yield put(actions.checkAuthTimeout((expirationTime.getTime() - new Date().getTime()) / 1000)); //Logout on token expiration
                
            }
            
        }
    }

*/