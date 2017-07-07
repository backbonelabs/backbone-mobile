import React from 'react';
import { shallow } from 'enzyme';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { asyncActionMiddleware } from 'redux-async-action';
import Reset from '../app/containers/Reset';

describe('Reset Component', () => {
  const initialState = {
    auth: {},
  };
  const store = configureStore([asyncActionMiddleware, thunk])(initialState);
  const wrapper = shallow(
    <Reset />,
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

  test('Reset action dispatched when clicked', () => {
    const btn = render.find('Button');
    render.setState({ email: 'testing@mail.com' });
    btn.simulate('press');
    const actions = store.getActions();
    expect(actions).toEqual([{ type: 'PASSWORD_RESET__START' }]);
  });

  test('Reset button disabled on first render', () => {
    const btn = render.find('Button');
    expect(btn.props().disabled).toEqual(true);
  });

  test('Reset button disabled remove', () => {
    render.setState({ email: 'testing@mail.com' });
    const btn = render.find('Button');
    expect(btn.props().disabled).toEqual(false);
  });

  test('Email state updates when text change', () => {
    const emailInput = render.find('Input');
    const nextValue = 'some email';
    emailInput.simulate('changeText', nextValue);
    expect(render.state().email).toEqual(nextValue);
  });
});

