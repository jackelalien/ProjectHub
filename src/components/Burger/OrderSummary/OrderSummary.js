import React, {Component} from 'react';
import Aux from '../../../hoc/Aux';
import Button from '../../UI/Button/Button';

//Can be made into stateless again
class OrderSummary extends Component {

    componentWillUpdate()
    {
        
    }

    render() {
        const ingSummary = Object.keys(this.props.ingredients)
        .map(igKey => {
            return (<li key={igKey}>
                        <span style={{textTransform: "capitalize"}}>{igKey}</span>: {this.props.ingredients[igKey]}
                    </li>);
        })

        return(
            <Aux>
            <h3>Your Order</h3>
            <p>A burger with the following ingredients:</p>
            <ul>
                {ingSummary}
                <li key="seedless">Bun Style: {this.props.bun}</li>
            </ul>
            <p><strong>Total Price: ${this.props.price.toFixed(2)}</strong></p>
            <p>Continue to Checkout?</p>
            <Button clicked={this.props.purchaseCanceled} btnType={"Danger"}>CANCEL</Button>
            <Button clicked={this.props.purchaseContinued} btnType={"Success"}>CONTINUE</Button>
        </Aux>
        );
    };

} 

export default OrderSummary;