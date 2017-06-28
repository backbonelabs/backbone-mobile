import React from 'react';
import { shallow } from 'enzyme';
import BodyText from '../app/components/BodyText';

describe('BodyText Component', () => {
  const wrapper = shallow(<BodyText />);
  test('renders as expected', () => {
    expect(wrapper).toMatchSnapshot();
  });
});

