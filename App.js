import React, { Component } from 'react';
import Layout from './containers/Layout/Layout';
import BurgerBuilder from './containers/BurgerBuilder/BurgerBuilder';
//import Checkout from './containers/Checkout/Checkout';
import {Route, Switch, withRouter, Redirect} from 'react-router-dom';
//import Orders from './containers/Orders/Orders';
//import Auth from './containers/Auth/Auth';
import Logout from './containers/Auth/Logout/Logout'
import {connect} from 'react-redux';
import * as actions from './store/actions/index';
import asyncComponent from './hoc/asyncComponent/asyncComponent';

//import logo from './logo.svg';
//import './App.css';

const asynCheckout = asyncComponent(() => {
  return import('./containers/Checkout/Checkout');
});

const asynOrders = asyncComponent(() => {
  return import('./containers/Orders/Orders');
});

const asynAuth = asyncComponent(() => {
  return import('./containers/Auth/Auth');
});

class App extends Component {
  componentDidMount() {
    this.props.onTryAutoSignup();
  }

  render() {

    let routes = (
      <Switch>
          <Route path="/auth" component={asynAuth} />  
          <Route path="/" exact component={BurgerBuilder} />
          <Redirect to='/'/>
      </Switch>
      
    );

    if(this.props.isAuthenticated)
    {
      routes = (
        <Switch>
            <Route path="/checkout" component={asynCheckout} />
            <Route path="/orders" component={asynOrders} /> 
            <Route path="/logout" component={Logout} />
            <Route path="/auth" component={asynAuth} />  
            <Route path="/" exact component={BurgerBuilder} />
            <Redirect to='/'/>
          </Switch>
      );
    }

    return (
      <div>
        <Layout>
          {routes}
          
        </Layout>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    isAuthenticated: state.auth.token !== null
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onTryAutoSignup: () => dispatch(actions.authCheckState())
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
