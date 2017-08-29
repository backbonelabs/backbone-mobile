import React from 'react';
import { shallow } from 'enzyme';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { asyncActionMiddleware } from 'redux-async-action';
import { SET_SESSION_TIME } from '../../../app/actions/types';
import PostureIntro from '../../../app/components/posture/PostureIntro';

describe('PostureIntro Component', () => {
  const navigator = {
    replace() {},
  };
  const initialState = {};
  const store = configureStore([asyncActionMiddleware, thunk])(initialState);
  let wrapper;

  beforeEach(() => {
    store.clearActions();
    wrapper = shallow(
      <PostureIntro duration={0} navigator={navigator} />,
      { context: { store } },
    ).dive({
      lifecycleExperimental: true,
    });
  });

  test('renders as expected', () => {
    expect(wrapper).toMatchSnapshot();
  });

  test('sets posture session time on mount', () => {
    const action = store.getActions()[0];
    expect(action.type).toBe(SET_SESSION_TIME);
    expect(action.payload).toBe(0);
  });

  test('calls onProceed prop when button is pressed', () => {
    const onProceed = jest.fn();
    wrapper = shallow(
      <PostureIntro duration={0} navigator={navigator} onProceed={onProceed} />,
      { context: { store } },
    ).dive();
    const button = wrapper.findWhere(n => n.name() === 'Button');
    button.simulate('press');
    expect(onProceed.mock.calls.length).toBe(1);
  });
});

