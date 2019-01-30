import React from 'react';
import Person from '../Person/Person';
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary';

//Error Boundary - Higher order component. Key must always be on outer element
const persons = (props) => props.persons.map ((person,index) => {
    return <ErrorBoundary key={person.id}><Person 
    click={() => props.clicked(index)}
    name={person.name}
    age={person.age}
    key={person.id}
    changed={(event) => props.changed(event,person)}/></ErrorBoundary>
});

export default persons;