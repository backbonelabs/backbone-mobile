import React from 'react';
import { shallow } from 'enzyme';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { asyncActionMiddleware } from 'redux-async-action';
import Signup from '../../app/containers/Signup';

describe('Signup Component', () => {
  const initialState = {
    auth: {},
    user: {},
  };
  const store = configureStore([asyncActionMiddleware, thunk])(initialState);
  const wrapper = shallow(
    <Signup />,
    { context: { store } },
  );
  let render;

  beforeEach(() => {
    store.clearActions();
    render = wrapper.dive();
  });

  test('renders as expected', () => {
    expect(render).toMatchSnapshot();
  });

  test('Sign up action dispatched when clicked', () => {
    render.setState({ email: 'testing@mail.com', password: 'password' });
    const btn = render.find('Button').at(0).shallow();
    btn.simulate('press');
    const actions = store.getActions();
    expect(actions).toEqual([{ type: 'SIGNUP__START' }]);
  });

  test('Sign up button disabled on first render', () => {
    const btn = render.find('Button').at(0);
    expect(btn.props().disabled).toEqual(true);
  });

  test('Sign up button disabled remove', () => {
    render.setState({ email: 'testing@mail.com', password: 'password' });
    const btn = render.find('Button').at(0);
    expect(btn.props().disabled).toEqual(false);
  });

  test('Email state updates when text change', () => {
    const emailInput = render.find('Input').at(0);
    const nextValue = 'some email';
    emailInput.simulate('changeText', nextValue);
    expect(render.state().email).toEqual(nextValue);
  });

  test('Password state updates when text change', () => {
    const passwordInput = render.find('Input').at(1);
    const nextValue = 'some password';
    passwordInput.simulate('changeText', nextValue);
    expect(render.state().password).toEqual(nextValue);
  });
});

