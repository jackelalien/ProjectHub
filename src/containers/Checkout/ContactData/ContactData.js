import React, {Component} from 'react';
import Button from "../../../components/UI/Button/Button";
import classes from './ContactData.module.css';
import axios from '../../../Axios-orders';
import Spinner from '../../../components/UI/Spinner/Spinner';
import Input from '../../../components/UI/Input/Input';
import {connect} from 'react-redux';
import withErrorHandler from '../../../hoc/withErrorHandler/withErrorHandler';
import * as actions from '../../../store/actions/index';

class ContactData extends Component {
    state = {
        orderForm: {
                name: {
                    elementType: 'input',
                    elementConfig: {
                        type: 'text',
                        placeholder: 'Your Name'
                    },
                    value: '',
                    validation: {
                        required: true
                    },
                    valid: false,
                    touched: false
                },
                street: {
                    elementType: 'input',
                    elementConfig: {
                        type: 'text',
                        placeholder: 'Street Address'
                    },
                    value: '',
                    validation: {
                        required: true
                    },
                    valid: false,
                    touched: false
                },
                city: {
                    elementType: 'input',
                    elementConfig: {
                        type: 'text',
                        placeholder: 'City'
                    },
                    value: '',
                    validation: {
                        required: true
                    },
                    valid: false,
                    touched: false
                },
                state: {
                    elementType: 'select',
                    elementConfig: {
                        options: [
                            {value: 'AK', displayValue: 'AK'},
                            {value: 'AL', displayValue: 'AL'},
                            {value: 'AR', displayValue: 'AR'},
                            {value: 'AZ', displayValue: 'AZ'},
                            {value: 'CA', displayValue: 'CA'},
                            {value: 'CO', displayValue: 'CO'},
                            {value: 'CT', displayValue: 'CT'},
                            {value: 'DC', displayValue: 'DC'},
                            {value: 'DE', displayValue: 'DE'},
                            {value: 'FL', displayValue: 'FL'},
                            {value: 'GA', displayValue: 'GA'},
                            {value: 'HI', displayValue: 'HI'},
                            {value: 'IA', displayValue: 'IA'},
                            {value: 'ID', displayValue: 'ID'},
                            {value: 'IL', displayValue: 'IL'},
                            {value: 'IN', displayValue: 'IN'},
                            {value: 'KS', displayValue: 'KS'},
                            {value: 'KY', displayValue: 'KY'},
                            {value: 'LA', displayValue: 'LA'},
                            {value: 'MA', displayValue: 'MA'},
                            {value: 'MD', displayValue: 'MD'},
                            {value: 'ME', displayValue: 'ME'},
                            {value: 'MI', displayValue: 'MI'},
                            {value: 'MN', displayValue: 'MN'},
                            {value: 'MO', displayValue: 'MO'},
                            {value: 'MS', displayValue: 'MS'},
                            {value: 'MT', displayValue: 'MT'},
                            {value: 'NC', displayValue: 'NC'},
                            {value: 'ND', displayValue: 'ND'},
                            {value: 'NE', displayValue: 'NE'},
                            {value: 'NH', displayValue: 'NH'},
                            {value: 'NJ', displayValue: 'NJ'},
                            {value: 'NM', displayValue: 'NM'},
                            {value: 'NV', displayValue: 'NV'},
                            {value: 'NY', displayValue: 'NY'},
                            {value: 'OH', displayValue: 'OH'},
                            {value: 'OK', displayValue: 'OK'},
                            {value: 'OR', displayValue: 'OR'},
                            {value: 'PA', displayValue: 'PA'},
                            {value: 'RI', displayValue: 'RI'},
                            {value: 'SC', displayValue: 'SC'},
                            {value: 'SD', displayValue: 'SD'},
                            {value: 'TN', displayValue: 'TN'},
                            {value: 'TX', displayValue: 'TX'},
                            {value: 'UT', displayValue: 'UT'},
                            {value: 'VT', displayValue: 'VT'},
                            {value: 'VA', displayValue: 'VA'},
                            {value: 'WA', displayValue: 'WA'},
                            {value: 'WI', displayValue: 'WI'},
                            {value: 'WV', displayValue: 'WV'},
                            {value: 'WY', displayValue: 'WY'},
                            {value: 'OTH', displayValue: 'Other - Not Listed'},
       
                        ]
                    },
                    value: 'AK',
                    valid: true
                },
                country: {
                    elementType: 'input',
                    elementConfig: {
                        type: 'text',
                        placeholder: 'Country'
                    },
                    value: '',
                    validation: {
                        required: true
                    },
                    valid: false,
                    touched: false
                },
                postalCode: {
                    elementType: 'input',
                    elementConfig: {
                        type: 'number',
                        placeholder: 'Zip Code'
                    },
                    value: '',
                    validation: {
                        required: true,
                        minLength: 5,
                        maxLength: 5
                    },
                    valid: false,
                    touched: false
                },
                deliveryMethod: {
                    elementType: 'select',
                    elementConfig: {
                        options: [
                            {value: 'pickup', displayValue: 'Pick Up'},
                            {value: 'cheapest', displayValue: 'Cheapest Delivery'},
                            {value: 'fasest', displayValue: 'Fastest Delivery'}
                        ]
                    },
                    value: 'pickup',
                    valid: true
                },
                paymentMethod: {
                    elementType: 'select',
                    elementConfig: {
                        options: [
                            {value: 'online', displayValue: 'Online (Credit Card)'},
                            {value: 'pay_in_Store', displayValue: 'Pay In Store'},
                        ]
                    },
                    value: 'pay_in_store',
                    valid: true
                },
                creditCard: {
                    elementType: 'input',
                    elementConfig: {
                        type: 'text',
                        placeholder: 'CC #'
                    },
                    value: '',
                    validation: {
                        required: false
                    },
                    valid: true,
                    touched: false
                }
            
        },
        formIsValid: false,
    }

    orderHanlder = (event) => {
        //Prevents form from reloading the page
        // Extract data wanting to submit (Which is managed with two-way binding)
        event.preventDefault();

        //this.setState({loading: true});

        const formData = {};
        //Create Key-Val Pairs
        for(let formElementID in this.state.orderForm)
        {
            formData[formElementID] = this.state.orderForm[formElementID].value;
        }

        const order = {
            ingredients: this.props.ingredients,
            price: +this.props.price,
            seedlessBun: this.props.seedless,
            orderData: formData,
            userId: this.props.userId
        }

        this.props.onOrderBurger(order, this.props.token);

    }

    checkValidity = (value, rules) => {
        let isValid = true;

        if(rules)
        {
            if(rules.required) {
                isValid = value.trim() !== '' && isValid;
            }
    
            if(rules.minLength) {
                isValid = value.length >= rules.minLength && isValid;
            }
    
            if(rules.maxLength)
            {
                isValid = value.length <= rules.maxLength && isValid;
            }
        }

        

        return isValid;
    }

    inputChangedHandler = (event, inputID) => {
        const updatedOrderForm = {
            ...this.state.orderForm //Not a deep clone, thanks to nesting
        }

        const updatedFormElement = { //This deeps clone the next nest layer
            ...updatedOrderForm[inputID]
        }

        updatedFormElement.value = event.target.value;
        updatedFormElement.valid = this.checkValidity(updatedFormElement.value, updatedFormElement.validation);
        updatedFormElement.touched = true;
        updatedOrderForm[inputID] = updatedFormElement;

        //TODO: Add a pay online check to make the requirements change.

        let formIsValid = true;
        for(let inputID in updatedOrderForm)
        {
            formIsValid = updatedOrderForm[inputID].valid && formIsValid;
        }

        this.setState({orderForm: updatedOrderForm, formIsValid: formIsValid});

    }


    render() {
        const formElementsArray = [];

        for(let key in this.state.orderForm) {
            formElementsArray.push({
                id: key,
                config: this.state.orderForm[key]
            })
        }

        let form = (
                <form onSubmit={this.orderHanlder}>
                    {formElementsArray.map(
                        formElement => (
                            <Input key={formElement.id} 
                            elementType={formElement.config.elementType} 
                            elementConfig={formElement.config.elementConfig} 
                            value={formElement.config.value}
                            invalid={!formElement.config.valid}
                            shouldValidate={formElement.config.validation}
                            touched={formElement.config.touched}
                            changed={(event) => this.inputChangedHandler(event, formElement.id)}
                            />
                        )
                    )}
                    <Button btnType="Success" disabled={!this.state.formIsValid}>ORDER</Button>
                </form>

        );

        if(this.props.loading)
        {
            form = <Spinner/>;
        }

        return (
            <div className={classes.ContactData}>
                <h4>Enter your Contact Data</h4>
                {form}
            </div>

        );
    }
}

const mapStateToProps = state => {
    return {
        ingredients: state.burgerBuilder.ingredients,
        price: state.burgerBuilder.totalPrice,
        seedless: state.burgerBuilder.seedlessBun,
        loading: state.order.loading,
        token: state.auth.token,
        userId: state.auth.userId
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onOrderBurger: (orderData, token) => dispatch(actions.purchase(orderData, token))
    }
    
}

export default connect(mapStateToProps, mapDispatchToProps)(withErrorHandler(ContactData, axios));