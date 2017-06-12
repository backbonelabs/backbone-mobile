import React from 'react';
import { shallow } from 'enzyme';
import configureStore from 'redux-mock-store';
import Signup from '../app/containers/Signup';

const mockStore = configureStore();
const initialState = {
  auth: {},
};

describe('Signup Component', () => {
  test('renders as expected', () => {
    const wrapper = shallow(
      <Signup />,
      { context: { store: mockStore(initialState) } },
    );
    expect(wrapper.dive()).toMatchSnapshot();
  });
});

