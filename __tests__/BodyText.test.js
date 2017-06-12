import React from 'react';
import { shallow } from 'enzyme';
import BodyText from '../app/components/BodyText';

describe('BodyText Component', () => {
  test('renders as expected', () => {
    const wrapper = shallow(<BodyText />);
    expect(wrapper).toMatchSnapshot();
  });
});

