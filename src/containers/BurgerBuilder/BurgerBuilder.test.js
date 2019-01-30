import {BurgerBuilder} from './BurgerBuilder';

import { configure, shallow } from 'enzyme'; //Shallow used for rendering, use as often as possible. Render with all content, but not all content deeply rendered.
//Content of substuff not rendered.
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';

//This props.onInitIngredients is not exposed, so fix is below.

configure({adapter: new Adapter()})

describe('<BurgerBuilder/>', () => {

    let wrapper;
    beforeEach(() => {
        wrapper = shallow(<BurgerBuilder onInitIngredients={() => {}}/>)
    });

    it('should render <BuildControls /> when receiving ingredients', () => {
        wrapper.setProps({ings: {lettuce: 0}});

        expect(wrapper.find(BuildControls)).toHaveLength(1);
    })
})