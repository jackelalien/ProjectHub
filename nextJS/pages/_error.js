import React from 'react';
import Link from 'next/link';



const errorPage = () => (
    <div>
        <h1>ERROR PAGE</h1>
        <p>Go to <Link href='/'><a>Main</a></Link></p>
    </div>
);

export default errorPage;