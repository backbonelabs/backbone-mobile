import React from 'react';
import { shallow } from 'enzyme';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { asyncActionMiddleware } from 'redux-async-action';
import { SET_SESSION_PARAMETERS } from '../../../app/actions/types';
import PostureIntro, { PostureIntroComponent } from '../../../app/components/posture/PostureIntro';

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

  test('sets posture session parameters on mount', () => {
    const action = store.getActions()[0];
    expect(action.type).toBe(SET_SESSION_PARAMETERS);
  });

  test('calls onProceed prop when button is pressed', () => {
    // Test that the start method is called when clicked
    // https://github.com/airbnb/enzyme/issues/697#issuecomment-261659043
    const start = jest.spyOn(PostureIntroComponent.prototype, 'start');
    wrapper = shallow(
      <PostureIntroComponent duration={0} navigator={navigator} />,
    );
    wrapper.find('Button').at(0).simulate('press');
    expect(start).toHaveBeenCalled();
  });
});

