import React, { Component } from 'react';
import {connect} from 'react-redux';
import Input from '../../components/UI/Input/Input';
import Button from '../../components/UI/Button/Button';
import Spinner from '../../components/UI/Spinner/Spinner';
import classes from './Auth.module.css'
import * as actions from '../../store/actions/index';
import {Redirect} from 'react-router-dom';

class Auth extends Component {

    state = {
        controls: {
            email: {
                elementType: 'input',
                elementConfig: {
                    type: 'email',
                    placeholder: 'Email Address'
                },
                value: '',
                validation: {
                    required: true,
                    isEmail: true
                },
                valid: false,
                touched: false
            },
            password: {
                elementType: 'input',
                elementConfig: {
                    type:'password',
                    placeholder: 'Enter Password'
                },
                value: '',
                validation: {
                    required: true,
                    minLength: 6
                },
                valid: false,
                touched: false
            },
            verifyPassword: {
                elementType: 'input',
                elementConfig: {
                    type:'password',
                    placeholder: 'Enter Password Again'
                },
                value: '',
                validation: {
                    required: true,
                    minLength: 6,
                    matchPassword: true
                },
                valid: false,
                touched: false
            }
        },
        isSignup: true,
        formIsValid: false
    }

    componentDidMount() {
        if(!this.props.buildingBurger && this.props.authRedirectPath !== '/')
        {
            this.props.onSetAuthRedirectPath();
        }
    }

    inputChangedHandler = (event, controlName) => {
        const updatedControls = {
            ...this.state.controls,
            [controlName]: {
                ...this.state.controls[controlName],
                value: event.target.value,
                valid: this.checkValidity(event.target.value, this.state.controls[controlName].validation),
                touched: true
            }
        };

        let formIsValid = true;
        for(let inputID in updatedControls)
        {
            if(this.state.isSignup)
                formIsValid = updatedControls[inputID].valid && formIsValid;
            else if(inputID !== 'verifyPassword')
            {
                formIsValid = updatedControls[inputID].valid && formIsValid;
            }
        }

        this.setState({controls: updatedControls, formIsValid: formIsValid});
    }


    // Good idea to share this because it is used in ContactData as well. Export const checkValidity = (value, rules) => {}
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

            if(rules.isEmail)
            {
                const pattern = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
                isValid = pattern.test(value) && isValid
            }

            if(rules.matchPassword)
            {
                isValid = this.state.controls.password.value === value && isValid;
            }
        }

        

        return isValid;
    }

    submitHandler = (event) => {
        event.preventDefault();
        this.props.onAuth(this.state.controls.email.value, this.state.controls.password.value, this.state.isSignup);
    }

    switchAuthModeHandler = () => {

        let formIsValid = true;
        for(let inputID in this.state.controls)
        {
            if(this.state.isSignup)
                formIsValid = this.state.controls[inputID].valid && formIsValid;
            else if(inputID !== 'verifyPassword')
            {
                formIsValid = this.state.controls[inputID].valid && formIsValid;
            }
        }

        this.setState({formIsValid: formIsValid});

        this.setState(prevState => {
            return {
                isSignup: !prevState.isSignup,
                formIsValid: formIsValid
            };
        })
    }



    render() {

        const formElementsArray = [];

        for(let key in this.state.controls) {
            if(key === 'verifyPassword')
            {
                if(this.state.isSignup)
                {
                    formElementsArray.push({
                        id: key,
                        config: this.state.controls[key]
                    })
                }
            }
            else
            {
                formElementsArray.push({
                    id: key,
                    config: this.state.controls[key]
                })
            }

            
        }

        let form = formElementsArray.map(formElement => (
            <Input
                key={formElement.id}
                elementType={formElement.config.elementType} 
                elementConfig={formElement.config.elementConfig} 
                value={formElement.config.value}
                invalid={!formElement.config.valid}
                shouldValidate={formElement.config.validation}
                touched={formElement.config.touched}
                changed={(event) => this.inputChangedHandler(event, formElement.id)}/>

            
        ));

        if(this.props.loading) {
            form = <Spinner />
        }

        let errorMessage = null;
        if(this.props.error) {
            errorMessage = (<p>{this.props.error.message}</p>);
        }

        let authRedirect = null;
        if(this.props.isAuthenticated)
        {
            authRedirect = <Redirect to={this.props.authRedirectPath}/>
        }

        return (
            <div className={classes.Auth}>
                {authRedirect}
                {errorMessage}
                <form onSubmit={this.submitHandler}>
                    {form}
                    <Button disabled={!this.state.formIsValid} btnType="Success">{this.state.isSignup ? 'SIGN UP' : 'SIGN IN'}</Button>      
                </form>

                <p className={classes.Label}>{this.state.isSignup ? 'Already have an account?' : 'Don\'t have an account?' }</p>
                <Button clicked={this.switchAuthModeHandler} btnType="Danger">{this.state.isSignup ? 'SIGN IN' : 'SIGN UP'}</Button>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        loading: state.auth.loading,
        error: state.auth.error,
        isAuthenticated: state.auth.token !== null,
        buildingBurger: state.burgerBuilder.building,
        authRedirectPath: state.auth.authRedirectPath
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onAuth: (email, pass, signingUp) => dispatch(actions.auth(email, pass, signingUp)),
        onSetAuthRedirectPath: () => dispatch(actions.setAuthRedirectPath('/')) //Reset path whenever reaching auth page w/o building burger
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(Auth);