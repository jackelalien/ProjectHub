import React from 'react';

//Even if not a page, we can still work in our desired folder structure. Just render the component in the pages in a separate file!
//Styling is done in here. JSX prop helps us out. Check the official docs. Media Queries are possible
// USE BACKTICK NOT QUOTES

const user = (props) => (
    <div>
        <h1>{props.name}</h1>
        <p>Age: {props.age}</p>
        <style jsx>
            {
                `
                div {
                    border: 1px solid #eee;
                    box-shadow: 0 2px 3px #ccc;
                    padding: 20px;
                    text-align: center;
                }
                `
            }
        </style>
    </div>
)

export default user;