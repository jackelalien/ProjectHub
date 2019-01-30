import React from 'react';
import classes from './Person.module.css';

//CSS Modules are a big thing that cna be done.
//See https://www.udemy.com/react-the-complete-guide-incl-redux/learn/v4/t/lecture/12001122?start=0 to figure out how to reverse it as well.



// Static content
//const person = () => {
//    return <p>I'm a Person!</p>
//}

// Dynamic Content
// Can Execute one line expressions and function calls!
//const person = () => {
//        return <p>I'm a Person and I am {Math.floor(Math.random() * 30)} years old!</p>
//    }

// Dynamic Component - Pass data from App.js to here! Can pass attributes for HTML. Like <Person name="" age=""/>
// What about children between brackets? <Person>Attribute</Person>. Use {props.children} <- Reserved word. Anything can go
// Two way binding set up. Error is false alarm

//Radium Notes: We need to wrap in a styleroot when using media queries. We have to do this in App.js
const person = (props) => {

    return(
        <div className={classes.Person}>
            <p onClick={props.click}>My name is {props.name} and I am {props.age} years old!</p>
            <p>{props.children}</p>
            <input type="text" onChange={props.changed} value={props.name}/>
        </div>
        
    ); 
}


export default person;