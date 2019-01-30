import React, {Component} from 'react';
import classes from './Modal.module.css';
import Aux from '../../../hoc/Aux';
import Backdrop from '../Backdrop/Backdrop';

//Not using PureComponent, but we can change how the component updates here. This prevents rerendering when invisible.
class Modal extends Component {

    //This prevents the unncessary rerender. It stops updating the Order Summary too because its wrapped inside Modal.
    //We pass in the spinner here as well - which won't show!
    shouldComponentUpdate(nextProps, nextState)
    {
        return (nextProps.visible !== this.props.visible || nextProps.children !== this.props.children);
    }


    render() {
        return(
            <Aux>
                <Backdrop visible={this.props.visible} clicked={this.props.modalClosed}/>
                <div className={classes.Modal}
                    style={{
                        transform: this.props.visible ? 'translateY(0)' : 'translateY(-100vh)',
                        opacity: this.props.visible ? '1' : '0'
                    }}
                >
            {this.props.children}
            </div>
            </Aux>
        );
    };
}


export default Modal;