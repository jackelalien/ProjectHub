import React, { Component } from 'react';
import { connect } from 'react-redux';

import CounterControl from '../../components/CounterControl/CounterControl';
import CounterOutput from '../../components/CounterOutput/CounterOutput';
import * as actionTypes from '../../store/actions'; //Can use actionTypes.increment as well.
import { increment, decrement, add, sub, storeResult, deleteResult } from '../../store/actions';

class Counter extends Component {
    state = {
        counter: 0
    }

    counterChangedHandler = ( action, value ) => {
        switch ( action ) {
            case 'inc':
                this.setState( ( prevState ) => { return { counter: prevState.counter + 1 } } )
                break;
            case 'dec':
                this.setState( ( prevState ) => { return { counter: prevState.counter - 1 } } )
                break;
            case 'add':
                this.setState( ( prevState ) => { return { counter: prevState.counter + value } } )
                break;
            case 'sub':
                this.setState( ( prevState ) => { return { counter: prevState.counter - value } } )
                break;
        }
    }

    render () {
        return (
            <div>
                <CounterOutput value={this.props.ctr} />
                <CounterControl label="Increment" clicked={this.props.onIncrementCounter} />
                <CounterControl label="Decrement" clicked={this.props.onDecrementCounter}  />
                <CounterControl label="Add 5" clicked={this.props.onAddCounter}  />
                <CounterControl label="Subtract 5" clicked={this.props.onSubCounter}  />
                <hr/>
                <button onClick={() => this.props.onStoreResult(this.props.ctr)}>Store Result</button>
                <ul>
                    {this.props.storedResults.map(strRes => (
                        <li key={strRes.id} onClick={() => this.props.onDeleteResult(strRes.id)}>{strRes.value}</li>
                    ))}
                    
                </ul>
            </div>
        );
    }
}

// Get the state we want to get (in props)
const mapStateToProps = state => {
    return {
        ctr: state.ctr.counter,
        storedResults: state.res.results
    };
};

// Map dispatch actions to call. Action functionality is in Reducer
const mapDispatchToProps = dispatch => {
    return {
        onIncrementCounter: () => dispatch(increment()), //Action Creator implementation
        onDecrementCounter: () => dispatch(decrement()),
        onAddCounter: () => dispatch(add(5)), //Can add any other values we want
        onSubCounter: () => dispatch({type: actionTypes.SUB, value: 15}), //Leaving this intentionally to show the other way of doing this.
        onStoreResult: (result) => dispatch(storeResult(result)),
        onDeleteResult: (elId) => dispatch(deleteResult(elId))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Counter); //Not a true HOC, but a function that returns a HOC. Outputs CTR property by connecting to main state.