import React from 'react';
import { shallow } from 'enzyme';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { asyncActionMiddleware } from 'redux-async-action';
import {
  AccessToken as FBAccessToken,
  LoginManager,
} from 'react-native-fbsdk';
import Facebook from '../../app/containers/Facebook';

describe('Facebook Component', () => {
  const store = configureStore([asyncActionMiddleware, thunk])();
  const wrapper = shallow(
    <Facebook buttonText="test" />,
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

  test('Login action dispatched when clicked', async () => {
    const btn = render.find('Button').at(0);
    btn.simulate('press');
    await expect(LoginManager.logInWithReadPermissions).toHaveBeenCalled();
    await expect(FBAccessToken.getCurrentAccessToken).toHaveBeenCalled();
  });
});
