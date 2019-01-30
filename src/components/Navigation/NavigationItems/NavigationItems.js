import React from 'react';
import classes from './NavigationItems.module.css';
import NavItem from './NavItem/NavItem';

const navigationItems = (props) => (
    <ul className={classes.NavigationItems}>
        <NavItem link="/" exact>Burger Builder</NavItem>
        {props.isAuthenticated ? <NavItem link="/orders">Orders</NavItem> : null }
        {props.isAuthenticated 
            ?  <NavItem link="/logout">Logout</NavItem>
            :  <NavItem link="/auth">Sign In</NavItem>}
        
    </ul>
);

export default navigationItems;