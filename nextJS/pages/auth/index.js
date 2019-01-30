//Reached at /auth/user.js.
//If named index.js, reached at /auth

//Class based components still possible!

import React from 'react';
import Link from 'next/link';
import User from '../../components/User';


const authIndex = (props) => (
    <div>
        <h1>AUTH PAGE - {props.appName}</h1>
        <p>Go to <Link href='/'>Main</Link></p>
        <User name="Jack" age={22}/>
    </div>
);

authIndex.getInitialProps = (context) => {
    const promise = new Promise((res,rej) => {
        setTimeout(() => {
            res({appName: 'Super App'})
        }, 1000);
    });
    return promise; //Only renders when resolved!
}

export default authIndex;