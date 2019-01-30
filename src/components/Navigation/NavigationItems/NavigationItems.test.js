import { configure, shallow } from 'enzyme'; //Shallow used for rendering, use as often as possible. Render with all content, but not all content deeply rendered.
//Content of substuff not rendered.
import Adapter from 'enzyme-adapter-react-16';
import NavigationItems from './NavigationItems';
import NavItem from './NavItem/NavItem'
import React from 'react';

configure({adapter: new Adapter()})

describe('<NavigationItems />', () => {
    //Executes before each test. AfterEach does cleanup.

    let wrapper;
    beforeEach(() => {
        wrapper = shallow(<NavigationItems />);
    }); 

    //Render what is not authenticated.
    it('should render two <NavigationItem /> elements if not authenticated', () => {
        //const wrapper = shallow(<NavigationItems />);

        //Write our expectation
        expect(wrapper.find(NavItem)).toHaveLength(2);
    })

    // Test the opposite
    //This will fail if we don't pass authenticated!
    it('should be an exact logout button', () => {
        //wrapper = shallow(<NavigationItems isAuthenticated/>)
        wrapper.setProps({isAuthenticated: true})

        //Write our expectation
        expect(wrapper.contains(<NavItem link='/logout'>Logout</NavItem>)).toEqual(true)//.toHaveLength(3);
    })
});