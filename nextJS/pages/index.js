import React, {Component} from 'react';
import Link from 'next/link';
import Router from 'next/router';

//How do we route? Next gives us a link component!
// Now the tutorial says we need to have the <a> tag, but previous testing shows this isn't true. Added anyway just in case.

class indexPage extends Component {

    //Special Lifecycle Hook - Available in functional components as well.
    // Does NOT have to be async! See below how this is done.
    static async getInitialProps(context) {
        console.log(context); //Does in terminal, not browser. WOWZA

        /*
        const promise = new Promise((res,rej) => {
            setTimeout(() => {
                res({appName: 'Super App'})
            }, 1000);
        });
        return promise; //Only renders when resolved!
        */
        return {appName: 'NEXTJS IS COOL'}; //Empty possible - but can pre-populate hardcoded props to pass to page!
    }

    render() {
        return(
        <div>
            <h1>MAIN PAGE OF {this.props.appName}</h1>
            <p>Go to <Link href='/auth'><a>Auth</a></Link></p>
            <button onClick={() => Router.push('/auth')}>Go to Auth</button>
        </div>
    );
    }
}
    

export default indexPage;