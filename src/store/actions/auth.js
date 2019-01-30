import * as actionTypes from './actionTypes';
import axios from 'axios';

export const authStart = () => {
    return {
        type: actionTypes.AUTH_START
    }
}

export const authSuccess = (token, userId) => {
    return {
        type: actionTypes.AUTH_SUCCESS,
        idToken: token,
        userId: userId
    }
}

export const authFailure = (error) => {
    return {
        type: actionTypes.AUTH_FAILURE,
        error: error
    }
}

export const logout = () => {
    // localStorage.removeItem('token');
    // localStorage.removeItem('expirationTime');
    // localStorage.removeItem('userId');
    return {
        type: actionTypes.AUTH_INIT_LOGOUT
    }
};

export const logoutSucceed = () => {
    return {
        type: actionTypes.AUTH_LOGOUT
    }
}

export const checkAuthTimeout = (expirationTime) => {
    return dispatch => {
        setTimeout(() => {
            dispatch(logout());
        }, expirationTime * 1000);
    }
}

export const auth = (email, password, isSignup) => {
    return dispatch => {
        dispatch(authStart());
        const authData = {
            email: email,
            password: password,
            returnSecureToken: true
        }

        let url = "https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=AIzaSyAxJQ5QFKTTrPMvVRpo9_msEnJpZWwjXK0"

        if(!isSignup)
        {
            url = "https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=AIzaSyAxJQ5QFKTTrPMvVRpo9_msEnJpZWwjXK0"
        }

        axios.post(url, authData)
            .then(response => {
                const expirationDate = new Date( new Date().getTime() + response.data.expiresIn * 1000 );
                localStorage.setItem('token', response.data.idToken);
                localStorage.setItem('expirationTime', expirationDate);
                localStorage.setItem('userId', response.data.localId);
                dispatch(authSuccess(response.data.idToken, response.data.localId));
                dispatch(checkAuthTimeout(response.data.expiresIn)); 
            })
            .catch(err => {
                dispatch(authFailure(err.response.data.error));
            })
    }
}

export const setAuthRedirectPath = (path) =>
{
    return {
        type: actionTypes.SET_AUTH_REDIRECT_PATH,
        path: path
    }
}

export const authCheckState = () => {

    return dispatch => {
        const token = localStorage.getItem('token');

        if(!token) {
            dispatch(logout());
        } else {
            const expirationTime = new Date(localStorage.getItem('expirationTime'));

            if(expirationTime <= new Date()) {
                dispatch(logout());
            }
            else
            {
                const userId = localStorage.getItem('userId');
                dispatch(authSuccess(token, userId));
                dispatch(checkAuthTimeout((expirationTime.getTime() - new Date().getTime()) / 1000)); //Logout on token expiration
                
            }
            
        }
    }
}

/* Alt version of authCheckState for Saga:
//Create new actiontype: AUTH_CHECK_INIT_STATE

export const authCheckState = () => {
    return {type: actionTypes.AUTH_CHECK_INIT_STATE};


}

*/