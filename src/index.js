import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter} from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import burgerBuilderReducer from './store/reducers/burgerBuilder';
import orderReducer from './store/reducers/order'
import authReducer from './store/reducers/auth'
import createSagaMiddleware from 'redux-saga';
import {watchAuth} from './store/sagas';

//const composeEnhancers = process.env.NODE_ENV === 'development' ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : null || compose;

//Using Enivronment variables to stop people from using Redux Store to see. We can use these to make it harder.
//I did not import this, but the code is here to show. Access the config folder, go to env.js
// NODE_ENV, automatically set to development.

// Make store aware of sagas

const rootReducer = combineReducers({
    burgerBuilder: burgerBuilderReducer,
    order: orderReducer,
    auth: authReducer
});

const sagaMW = createSagaMiddleware();

const store = createStore(rootReducer, applyMiddleware(thunk, sagaMW));

//This gets dispatched
//sagaMW.run(logoutSaga);
sagaMW.run(watchAuth);

//basename goes here - in BrowserRouter
const app = (
    <Provider store={store}>
        <BrowserRouter> 
            <App/>
        </BrowserRouter>
    </Provider>
    
)

ReactDOM.render(app, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
