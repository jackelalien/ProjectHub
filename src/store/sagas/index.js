import {takeEvery} from 'redux-saga/effects'; //Allows us to listen to certain actions and do something when they occur.
import {logoutSaga} from './auth';
import * as actionTypes from '../actions/actionTypes';

//Listeners
export function* watchAuth() {
    yield takeEvery(actionTypes.AUTH_INIT_LOGOUT, logoutSaga); //Whenever generator executed, setup a listener to activate logoutSaga. Stack others here
    //yield takeEvery(actionTypes.AUTH_CHECK_STATE, authCheckStateSaga)
}
