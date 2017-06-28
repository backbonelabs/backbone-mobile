import React from 'react';
import { shallow } from 'enzyme';
import mockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { asyncActionMiddleware } from 'redux-async-action';
import Signup from '../app/containers/Signup';

describe('Signup Component', () => {
  const initialState = {
    auth: {},
  };
  const store = mockStore([asyncActionMiddleware, thunk])(initialState);
  const wrapper = shallow(
    <Signup />,
      { context: { store } },
    );
  const render = wrapper.dive();

  beforeEach(() => {
    store.clearActions();
  });

  test('renders as expected', () => {
    expect(render).toMatchSnapshot();
  });

  test('Sign up action dispatched when clicked', () => {
    const btn = render.find('Button');
    btn.simulate('press');
    const actions = store.getActions();
    expect(actions).toEqual([{ type: 'SIGNUP__START' }]);
  });

  test('Email state updates when text change', () => {
    const emailInput = render.find('Input').at(0);
    const nextValue = 'some email';
    emailInput.simulate('changeText', nextValue);
    expect(render.state().emailPristine).toEqual(false);
    expect(render.state().email).toEqual(nextValue);
  });

  test('Password state updates when text change', () => {
    const passwordInput = render.find('Input').at(1);
    const nextValue = 'some password';
    passwordInput.simulate('changeText', nextValue);
    expect(render.state().password).toEqual(nextValue);
    expect(render.state().passwordPristine).toEqual(false);
  });
});

