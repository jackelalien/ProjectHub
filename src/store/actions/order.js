import * as actionTypes from './actionTypes';
import axios from '../../Axios-orders';

export const purchaseSuccess = (id, orderData) => {
    return {
        type: actionTypes.PURCHASE_SUCCESS,
        orderId: id,
        orderData: orderData
    }
}

export const purchaseFailure = (error) => {
    return {
        type: actionTypes.PURCHASE_FAILURE,
        error: error
    };
}

export const purchaseStart = () => {
    return {
        type: actionTypes.PURCHASE_START,
    }
}

export const purchase = (orderData, token) => {
    return dispatch => {
        dispatch(purchaseStart());
        
        axios.post('/orders.json?auth=' + token, orderData)
        .then(
            response => {
                dispatch(purchaseSuccess(response.data.name, orderData));
                //this.setState({loading: false});
                //this.props.history.push('/');
            })
        .catch(
            error => {
                dispatch(purchaseFailure(error));
                //this.setState({loading: false});
            }  
        );
    }
}

export const purchaseInit = () => {
    return {
        type: actionTypes.PURCHASE_INIT
    }
}

////////////////////////////////////////////////////////
export const fetchOrderSuccess = (orders) => {
    return {
        type: actionTypes.FETCH_ORDERS_SUCC,
        orders: orders
    }
}

export const fetchOrderFailure = (error) => {
    return {
        type: actionTypes.PURCHASE_FAILURE,
        error: error
    };
}

export const fetchOrderStart = () => {
    return {
        type: actionTypes.FETCH_ORDERS_STRT,
    }
}

// Fetch the orders async
export const fetchOrders = (token, userId) => {
    return (dispatch, getState) => { //This is an option, but will not be used.
        dispatch(fetchOrderStart())
       // dispatch(purchaseStart());

       const queryParams = '?auth=' + token + '&orderBy="userId"&equalTo="' + userId + '"';
        axios.get('/orders.json' + queryParams)
        .then( res => {
            const fetchedOrders = [];
            for(let key in res.data) {
                fetchedOrders.push({
                    ...res.data[key], //Distribute properties, add id property
                    id: key
                });
            }
            //this.setState({loading: false, orders: fetchedOrders})
            
            dispatch(fetchOrderSuccess(fetchedOrders));
            }
        )
        .catch(err => {
            //this.setState({loading: false})
            dispatch(fetchOrderFailure(err))
        });
    }
}