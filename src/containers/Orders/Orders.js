import React, { Component } from 'react';
import {connect} from 'react-redux';
import Order from '../../components/Order/Order';
import axios from '../../Axios-orders';
import withErrorHandler from "../../hoc/withErrorHandler/withErrorHandler"
import * as actions from '../../store/actions/index'
import Spinner from '../../components/UI/Spinner/Spinner'

class Orders extends Component {

    componentDidMount() {
        this.props.onFetchedOrders(this.props.token,this.props.userId)
    }


    render () {

        let r = <div><Spinner /></div>

        if(!this.props.loading)
        {
            r = (<div>
                {this.props.orders.map(
                    order => (
                        <Order key={order.id} ingredients={order.ingredients} price={order.price}/>
                    )
                )}
            </div>)
        }

        return (
            <div>
                {r}
            </div>
            

        );
    }
}

const mapStateToProps = state => {
    return {
        orders: state.order.orders,
        loading: state.order.loading,
        token: state.auth.token,
        userId: state.auth.userId
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onFetchedOrders: (token, userId) => dispatch(actions.fetchOrders(token, userId))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withErrorHandler(Orders, axios));