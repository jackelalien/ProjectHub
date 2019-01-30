import React from 'react';
import Logo from '../../Logo/Logo';
import NavigationItems from '../NavigationItems/NavigationItems';
import classes from './SideDrawer.module.css';
import Backdrop from '../../UI/Backdrop/Backdrop';
import Aux from '../../../hoc/Aux';

const sideDrawer = (props) => {
    let attachedClasses = [classes.SideDrawer, classes.Close];

    if(props.open) {
        attachedClasses = [classes.SideDrawer, classes.Open];
    }

    return(
        <Aux>
        <Backdrop visible={props.open} clicked={props.closed}/>
        <div className={attachedClasses.join(' ')} onClick={props.closed}>
        <div className={classes.Logo}>
            <Logo/>
        </div>
            
            <nav>
                <NavigationItems isAuthenticated={props.isAuth}/>
            </nav>
        </div>
        </Aux>
        
    );
};

export default sideDrawer;

/*
Alt Method for things like logo height editing:
- Remove height property
- Wrap Logo in a div
- Set div class name to classes.Logo
- Override Logo in SideDrawer and in Toolbar css files

*/