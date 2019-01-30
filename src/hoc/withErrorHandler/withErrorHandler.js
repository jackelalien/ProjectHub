import React, {Component} from 'react';
import Modal from '../../components/UI/Modal/Modal';
import Aux from '../Aux';

//If we add this to other components, component will mount gets called again and again...
// We need to remove old interceptors to prevent them from reacting...

const withErrorHandler = (WrappedComponent, axios) => {
    return class extends Component {
        state = {
            error: null
        }

        //Works great for POST request. But not for GET, because this is done after all child components rendered
        //Switching to WillMount from DidMount...
        componentWillMount() {
            this.reqInterceptor = axios.interceptors.request.use(req => {
                this.setState({error: null})
                return req;
            });

            this.resInterceptor = axios.interceptors.response.use(res => res, error => {
                this.setState({error: error})
            });
        }

        componentWillUnmount() {
            axios.interceptors.request.eject(this.reqInterceptor);
            axios.interceptors.response.eject(this.resInterceptor);
        }

        errorConfirmedHandler = () => {
            this.setState({error: null});
        }

        render() {
            return(
                <Aux>
                    <Modal visible={this.state.error} modalClosed={this.errorConfirmedHandler}>{this.state.error? this.state.error.message : null}</Modal>
                    <WrappedComponent {...this.props}/>
                </Aux>
               
            );
        }
    } 
}

export default withErrorHandler;