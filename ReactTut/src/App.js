import React, { Component } from 'react';
// import Radium, {StyleRoot} from 'radium'; //StyleRoot access media queries and advanced features
import logo from './logo.svg';
import class_style from './App.module.css'; //JS Object containing CSS object as properties. Doesn't work, remove classes. IT HAS TO CONTAIN .MODULE
//import './App.css'
import Persons from './Assignment/Persons';

//Assignments
import UserInput from './Assignment/UserInput';
import UserOutput from './Assignment/UserOutput';
import Validation from './Assignment/Validation';
import Char from './Assignment/Char';

//CSS Modules are the next big thing, which can replace Radium
//See https://www.udemy.com/react-the-complete-guide-incl-redux/learn/v4/t/lecture/12001122?start=0 


import Person from './Person/Person'; //This doesn't have to be name of component, use caps though.
//Note, can use format of <Person></Person> and nesting.

class App extends Component {
  // State used inside components
  // Use it to manage component internal data
  // State is a special property. State can be changed, and if it changes, it will lead react to re-render DOM automatically.
  state = {
      persons: [ 
        { id: 0, name: 'Jack', age: 22},
        { id: 1, name: "Madison", age: 22},
        { id: 2, name: "Bin", age: 20}
      ],
      username: 'Yeetle',
      showPersons: false,
      showAssignment1: false,
      as2Input: ''
  }
  

  //Method not actively calling, but using as event handler when naming with Handler.
  // When using parentheses, it will execute immediately when React DOM loads. So for clicks, DO NOT USE PARENTHESES
  // Do not mutate states directly.
  // Can pass references to this as a property too.
  nameChangedHandler = (event, index) => {
    // Use ... and {} to avoid pointers.
    const person = {...this.state.persons[index]}; // if using id, get persons.findIndex(p => { return p.id === passed_id})
    
    person.name = event.target.value;

    const persons = [...this.state.persons];
    persons[index] = person;

    this.setState({persons: persons});
  }

  deletePersonHandler = (personIndex) => {
    // Don't mutate original state
    //const persons = this.state.persons.slice()
    const persons = [...this.state.persons];
    persons.splice(personIndex, 1);
    this.setState({persons: persons});
  }

  usernameChangedHandler = (event) => {
    this.setState({username: event.target.value})
  }

  togglePersonHandler = () => {
    const doesShow = this.state.showPersons;
    this.setState({showPersons: !doesShow})
  }

  toggleA1Handler = () => {
    const doesShow = this.state.showAssignment1;
    this.setState({showAssignment1: !doesShow})
  }

  validationHandler = (event) => {
    this.setState({as2Input: event.target.value})
  }

  deleteCharHandler = (index ) => {
    const text = this.state.as2Input.split('');
    text.splice(index, 1);
    const updated = text.join('')
    this.setState({as2Input: updated});

  }

  render() {
    //Style classes
    //let classes = ['red', 'bold'].join(' '); //Leads to 'red bold' which is valid.
    let classes = []

    if (this.state.persons.length <= 2)
    {
      classes.push(class_style.red);

      if(this.state.persons.length <= 1)
      {
        classes.push(class_style.bold);
      }
    }

    let persons = null;
    let btnClass = '';

    const charList = this.state.as2Input.split('').map((c, index) => {
      return <Char char={c} key={index} clicked={() => this.deleteCharHandler(index)}/>
    });

    
    if (this.state.showPersons) {
      persons = (
        <div>
            <Persons persons={this.state.persons}
                  clicked={this.deletePersonHandler}
                  changed={this.nameChangedHandler}/>
        </div>
                
              );
  

      //style.backgroundColor = 'red';
      //style[':hover'] = { backgroundColor: 'salmon', color: 'black'}
      btnClass = class_style.Red;
    }

    // JSX - compiles to similar to commented return statement below.
    //Removed inline style on buttons
    return (
      //<StyleRoot>
      <div className={class_style.App}>
        <h1>Hello, I'm a React App</h1>
        <p className={classes.join(' ')}>Testing - Style should change on 3 elements or less.</p>
        <button className={btnClass} onClick={this.togglePersonHandler}>Show People</button>
        <button className={btnClass} onClick={this.toggleA1Handler}>Show Assignment 1</button>
        {persons}

       
       { this.state.showAssignment1 === true ? 
        <div>
          <UserInput changed={this.usernameChangedHandler} currName={this.state.username}/>
          <UserOutput username={this.state.username}/>
        </div>
       
      : null
      }
      <hr/>
      <div>
        <input type="text" onChange={this.validationHandler} value={this.state.as2Input}/>
        <p>{this.state.as2Input}</p>
        <Validation len={this.state.as2Input.length}/>
        {charList}
      </div>
        
      </div>
      //</StyleRoot>
      
    );


    //React.createElement(html, config, children) + inf args
    // html - something to render to DOM, can be normal HTML or own components
    // config - configuration, javascript object
    // children - can have multiple arguments separated. What's nested inside this div. Such as text.
    // Note, in children, even html elements are rendered as text. Do: React.createElement inside
    // Now, we need to render classes. How?
    // Don't pass null to config, see below. {className: 'App'}
    // Exact equivalent as above. Below is cumbersome and annoying.
    // return React.createElement('div', {className: 'App'}, React.createElement('h1', null, 'Does this work now?'))
  }
}

//export default Radium(App); //Radium added
export default App;


//JSX Restriction:
/*
  - some words can't be used, like class (reserved words)
  - JSX expression must have ONE root element. Now JSON elements can be returned.
*/

// Support Event Listeners:
/*
  - Clipboard Events: onCopy/onCut/onPaste
  - Clipboard Properties: DOMDataTransfer/clipboardData
  - Event Composition Event Names: onCompositionEnd/Start/Update
  - Event Composition Properties: string data
  - Keyboard onKeyDown/Press/Up
  - Properties: many, look online
  - Focus: onFocus/onBlur
  - Even Touch Events, scroll events, selection, etc
*/


/*
Old persons:
            <Person 
              name={this.state.persons[0].name} 
              age={this.state.persons[0].age} 
              click={this.switchNameHandler.bind(this, 'Jeff')}
              changed={this.nameChangedHandler}
            >My Hobbies: Hunting</Person>
              <Person name="Madison" age="22"/>
              <Person name="Bin" age="20"/>

Old Event
// event.target.value is the input which we type
  nameChangedHandler = (event) => {
    this.setState({persons: [ 
      { name: event.target.value, age: 22},
      { name: "Medison", age: 22},
      { name: "Bin", age: 20}
    ]});
  }


  switchNameHandler = (newName) => {
    // NOT THIS: this.state.persons[0].name = "Jeffrey"
    // With this, there are no overrides, it is merging. If there is another state, it won't be discarded.
    // When having arguments, use .bind(this, new name) at the end, 
    this.setState({persons: [ 
      { name: newName, age: 22},
      { name: "Madison", age: 22},
      { name: "Bin", age: 20}
    ]});

    // Alt Binding Syntax:
    // () => { this.switchNameHandler() }
    // Won't get executed immediately. Don't recommend, use bind normally.
  }


  //In line Styling
    //Radium adds pseudo selectors, like ':hover'
    //const style = {
    //  backgroundColor: 'green',
    //  color: 'white',
    //  font: 'inherit',
    //  border: '1px solid blue',
    //  padding: '8px',
    //  cursor: 'pointer',
      //':hover': { backgroundColor: 'lightgreen', color: 'black'}
    // };
*/

