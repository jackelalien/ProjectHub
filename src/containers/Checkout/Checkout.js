import React, {Component} from 'react';
import CheckoutSummary from '../../components/Order/CheckoutSummary/CheckoutSummary';
import { Route, Redirect } from 'react-router-dom';
import ContactData from './ContactData/ContactData';
import {connect} from 'react-redux';

class Checkout extends Component {

    componentDidMount() {
        //this.props.onInitPurchase();
    }

    // componentWillMount() {
    //     const query = new URLSearchParams(this.props.location.search);
    //     const ingredients = {};
    //     let price = 0;
    //     let sdless = false;
    //     for(let param of query.entries()) {
    //         if(param[0] === "price")
    //         {
    //             price = param[1];
    //         }
    //         else if(param[0] === 'seedless')
    //         {
    //             sdless = (param[1] === "true");
    //         }
    //         else
    //         {
    //             ingredients[param[0]] = +param[1];  //+ converts to number
    //         }
            
    //     }

    //     //Removed UpdateState
    // }

    onCheckoutCancelledHandler = () => {
        this.props.history.goBack();
    }

    onCheckoutContinuedHandler = () => {
        this.props.history.replace('/checkout/contact-data');
    }

    //Thanks to Render Store, don't need price anymore...

    render() {
        let summary = <Redirect to="/"/>

        
        if(this.props.ings)
        {
            const purchasedRedirect = this.props.purchased ? (<Redirect to="/"/>) : null;
            summary = (<div>
                {purchasedRedirect}
                <CheckoutSummary ingredients={this.props.ings}
                checkoutCanceled={this.onCheckoutCancelledHandler}
                checkoutContinued={this.onCheckoutContinuedHandler}
                bunType={this.props.seedless}/>)
                <Route path={this.props.match.path + '/contact-data'} component={ContactData}/>
            </div>);
        }

        return (
            <div>
                {summary}
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        ings: state.burgerBuilder.ingredients,
        seedless: state.burgerBuilder.seedlessBun,
        purchased: state.order.purchased
    };
}



export default connect(mapStateToProps)(Checkout);

//Removed:
//render={(props) => (<ContactData ingredients={this.props.ings} seedless={this.props.seedless} price={this.props.totalPrice} {...props}/>)}