import configureStore from 'redux-mock-store';
import { NativeModules } from 'react-native';
import thunk from 'redux-thunk';
import { asyncActionMiddleware } from 'redux-async-action';
import authActions from '../../app/actions/auth';
import Bugsnag from '../../app/utils/Bugsnag';
import Mixpanel from '../../app/utils/Mixpanel';
import SensitiveInfo from '../../app/utils/SensitiveInfo';
import constants from '../../app/utils/constants';

const { storageKeys } = constants;
const { UserService } = NativeModules;

describe('__Auth Actions__', () => {
  const store = configureStore([asyncActionMiddleware, thunk])({});

  const user = {
    email: 'test@mail.com',
    nickname: 'testNick',
    password: 'password',
    _id: 'testId',
    accessToken: 'testToken',
  };
  const { email, password } = user;

  beforeEach(() => {
    store.clearActions();
    UserService.setUserId.mockClear();
    Bugsnag.setUser.mockClear();
    Mixpanel.identify.mockClear();
    Mixpanel.setUserProperties.mockClear();
    Mixpanel.track.mockClear();
    Mixpanel.trackWithProperties.mockClear();
    SensitiveInfo.setItem.mockClear();
  });

  test('creates an action to Login', async () => {
    const { accessToken, ...userObj } = user;
    fetch.mockResponseSuccess(user);
    await store.dispatch(authActions.login({ email, password }));

    expect(UserService.setUserId).toBeCalledWith(user._id);
    expect(Bugsnag.setUser).toBeCalledWith(user._id, user.nickname, user.email);
    expect(Mixpanel.identify).toBeCalledWith(user._id);
    expect(Mixpanel.setUserProperties).toBeCalledWith(userObj);
    expect(Mixpanel.track).toHaveBeenCalledWith('login-success');
    expect(SensitiveInfo.setItem.mock.calls[0]).toEqual([storageKeys.ACCESS_TOKEN, accessToken]);
    expect(SensitiveInfo.setItem.mock.calls[1]).toEqual([storageKeys.USER, userObj]);
    expect(fetch.mock.calls[0][1].body).toEqual(JSON.stringify({ email, password }));
    expect(store.getActions()).toMatchSnapshot();
  });

  test('creates an action when Login is unsuccessful', async () => {
    fetch.mockResponseSuccess({ error: 'api server error' });
    await store.dispatch(authActions.login());
    expect(Mixpanel.trackWithProperties)
    .toBeCalledWith('login-error', { errorMessage: 'api server error' });
    expect(store.getActions()).toMatchSnapshot();
  });

  test('creates an action when Login returns a server error', async () => {
    fetch.mockResponseFailure();
    await store.dispatch(authActions.login());
    expect(Mixpanel.track).toHaveBeenCalledWith('login-serverError');
    expect(store.getActions()).toMatchSnapshot();
  });

  test('creates an action to Signup', async () => {
    const { accessToken, ...userObj } = user;
    const body = { user: { ...userObj } };
    fetch.mockResponseSuccess({ ...body, accessToken });
    await store.dispatch(authActions.signup({ email, password }));
    expect(UserService.setUserId).toBeCalledWith(body.user._id);
    expect(Bugsnag.setUser).toBeCalledWith(body.user._id, body.user.nickname, body.user.email);
    expect(Mixpanel.identify).toBeCalledWith(body.user._id);
    expect(Mixpanel.setUserProperties).toBeCalledWith(body.user);
    expect(Mixpanel.track).toHaveBeenCalledWith('signup-success');
    expect(SensitiveInfo.setItem.mock.calls[0]).toEqual([storageKeys.ACCESS_TOKEN, accessToken]);
    expect(SensitiveInfo.setItem.mock.calls[1]).toEqual([storageKeys.USER, body.user]);
    expect(fetch.mock.calls[0][1].body).toEqual(JSON.stringify({ email, password }));
    expect(store.getActions()).toMatchSnapshot();
  });

  test('creates an action when Signup is unsuccessful', async () => {
    fetch.mockResponseSuccess({ error: 'api server error' });
    await store.dispatch(authActions.signup());
    expect(Mixpanel.trackWithProperties)
    .toBeCalledWith('signup-error', { errorMessage: 'api server error' });
    expect(store.getActions()).toMatchSnapshot();
  });

  test('creates an action when Signup returns a server error', async () => {
    fetch.mockResponseFailure();
    await store.dispatch(authActions.signup());
    expect(Mixpanel.track).toHaveBeenCalledWith('signup-serverError');
    expect(store.getActions()).toMatchSnapshot();
  });

  test('creates an action to reset password', async () => {
    fetch.mockResponseSuccess({ ok: true });
    await store.dispatch(authActions.reset({ email: 'test@mail.com' }));
    expect(Mixpanel.trackWithProperties)
    .toBeCalledWith('passwordReset-success', { email: 'test@mail.com' });
    expect(store.getActions()).toMatchSnapshot();
  });

  test('creates an action when resetting password is unsuccessful', async () => {
    fetch.mockResponseSuccess({
      error: 'api server error',
    });
    await store.dispatch(authActions.reset({ email: 'test@mail.com' }));
    expect(Mixpanel.trackWithProperties)
    .toBeCalledWith(
      'passwordReset-error',
      { email: 'test@mail.com', errorMessage: 'api server error' },
    );
    expect(store.getActions()).toMatchSnapshot();
  });

  test('creates an action when resetting password returns a server error', async () => {
    fetch.mockResponseFailure();
    await store.dispatch(authActions.reset({ email: 'test@mail.com' }));
    expect(Mixpanel.track).toHaveBeenCalledWith('passwordReset-serverError');
    expect(store.getActions()).toMatchSnapshot();
  });

  test('creates a SIGN_OUT action', () => {
    store.dispatch(authActions.signOut());
    expect(UserService.unsetUserId).toHaveBeenCalled();
    expect(Bugsnag.clearUser).toHaveBeenCalled();
    expect(Mixpanel.track).toHaveBeenCalledWith('signOut');
    expect(SensitiveInfo.deleteItem.mock.calls[0]).toEqual([storageKeys.ACCESS_TOKEN]);
    expect(SensitiveInfo.deleteItem.mock.calls[1]).toEqual([storageKeys.USER]);
    expect(authActions.signOut()).toMatchSnapshot();
  });

  test('creates a SET_ACCESS_TOKEN action', () => {
    expect(authActions.setAccessToken('testToken')).toMatchSnapshot();
  });
});
