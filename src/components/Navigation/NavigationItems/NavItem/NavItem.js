import React from 'react';
import { NavLink } from 'react-router-dom';

import classes from './navItem.module.css';

const navItem = (props) => (
    <li className={classes.NavItem}>
        <NavLink activeClassName={classes.active} to={props.link} exact={props.exact}
        >{props.children}</NavLink>
    </li>
)

export default navItem;