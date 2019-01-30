import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
//import reducer from './store/reducer';
import counterReducer from './store/reducers/counter';
import resultReducer from './store/reducers/result';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';

const rootReducer = combineReducers({
    ctr: counterReducer,
    res: resultReducer
})

// Middleware Function.
// Next - lets action continue onto reducer.
// All called by redux, just apply it to store.
const logger = store => {
    return next => {
        return action => {
            //Inside here (the action), can execute the code we want to run in between the action and the reducer.
            console.log('[Middleware] Dispatching', action);
            const result = next(action) //Lets action continue to reducer, but for this to work, pass action as argument.
            console.log('[Middleware] next state', store.getState());
            return result;
        }
    }
}

const store = createStore(rootReducer, applyMiddleware(logger, thunk)); //applymiddleware can have more args.
//Arg 2 - enhancer - just a middleware.


ReactDOM.render(<Provider store={store}><App /></Provider>, document.getElementById('root'));
registerServiceWorker();
