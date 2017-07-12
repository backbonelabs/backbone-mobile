import configureStore from 'redux-mock-store';
import { NativeModules } from 'react-native';
import thunk from 'redux-thunk';
import { asyncActionMiddleware } from 'redux-async-action';
import authActions from '../../app/actions/auth';
import authReducer from '../../app/reducers/auth';
import Bugsnag from '../../app/utils/Bugsnag';
import Mixpanel from '../../app/utils/Mixpanel';
import SensitiveInfo from '../../app/utils/SensitiveInfo';

const { UserService } = NativeModules;

describe('Auth state', () => {
  const store = configureStore([asyncActionMiddleware, thunk])({});

  const initialState = {
    accessToken: null,
    passwordResetSent: false,
    inProgress: false,
    errorMessage: null,
    userId: null,
  };

  const user = {
    email: 'test@mail.com',
    nickname: 'testNick',
    password: 'password',
    _id: 'testId',
    accessToken: 'testToken',
  };

  const { email, password } = user;

  describe('actions --', () => {
    test('creates a LOGIN action', () => {
      expect(authActions.login({ email, password })).toMatchSnapshot();
    });

    test('creates a SIGNUP action', () => {
      expect(authActions.signup({ email, password })).toMatchSnapshot();
    });

    test('creates a SIGN_OUT action', () => {
      expect(authActions.signOut()).toMatchSnapshot();
    });

    test('creates a PASSWORD_RESET action', () => {
      expect(authActions.reset()).toMatchSnapshot();
    });

    test('creates a SET_ACCESS_TOKEN action', () => {
      expect(authActions.setAccessToken('testToken')).toMatchSnapshot();
    });
  });

  describe('reducer --', () => {
    beforeEach(() => {
      store.clearActions();
      UserService.setUserId.mockClear();
      Bugsnag.setUser.mockClear();
      Mixpanel.identify.mockClear();
      Mixpanel.setUserProperties.mockClear();
      Mixpanel.track.mockClear();
      SensitiveInfo.setItem.mockClear();
    });

    test('should return initial state', () => {
      expect(authReducer(initialState, {})).toMatchSnapshot();
    });

    // store.getActions() returns an array of actions,
    // the first index is always the ''__START action
    test('handles a successful LOGIN__START/LOGIN', async () => {
      const { accessToken, ...userObj } = user;
      fetch.mockResponseSuccess(user);
      await store.dispatch(authActions.login({ email, password }));
      expect(UserService.setUserId).toBeCalledWith(user._id);
      expect(Bugsnag.setUser).toBeCalledWith(user._id, user.nickname, user.email);
      expect(Mixpanel.identify).toBeCalledWith(user._id);
      expect(Mixpanel.setUserProperties).toBeCalledWith(userObj);
      expect(Mixpanel.track).toHaveBeenCalled();
      // Tests that the second arguement is equal to userObj
      // currently Jest has no syntactic sugar for this
      expect(SensitiveInfo.setItem.mock.calls[SensitiveInfo.setItem.mock.calls.length - 2][1])
      .toEqual(accessToken);
      expect(SensitiveInfo.setItem.mock.calls[SensitiveInfo.setItem.mock.calls.length - 1][1])
      .toEqual(userObj);
      expect(fetch.mock.calls[0][1].body).toEqual(JSON.stringify({ email, password }));
      expect(authReducer(initialState, store.getActions()[0])).toMatchSnapshot();
      expect(authReducer(initialState, store.getActions()[1])).toMatchSnapshot();
    });


    test('handles a unsuccessful LOGIN', async () => {
      fetch.mockResponseSuccess({ ...user, error: 'api server error' });
      await store.dispatch(authActions.login());
      expect(authReducer(initialState, store.getActions()[1])).toMatchSnapshot();
    });


    test('handles a LOGIN server error', async () => {
      fetch.mockResponseFailure();
      await store.dispatch(authActions.login());
      // eslint-disable-next-line
      expect(Mixpanel.trackWithProperties.mock.calls[Mixpanel.trackWithProperties.mock.calls.length - 1][1])
      .toEqual({ errorMessage: 'api server error' });
      expect(authReducer(initialState, store.getActions()[1])).toMatchSnapshot();
    });

    test('handles a successful SIGNUP__START/SIGNUP', async () => {
      const { accessToken, ...userObj } = user;
      const body = { user: { ...userObj } };
      fetch.mockResponseSuccess({ ...body, accessToken });
      await store.dispatch(authActions.signup({ email, password }));
      expect(UserService.setUserId).toBeCalledWith(body.user._id);
      expect(Bugsnag.setUser).toBeCalledWith(body.user._id, body.user.nickname, body.user.email);
      expect(Mixpanel.identify).toBeCalledWith(body.user._id);
      expect(Mixpanel.setUserProperties).toBeCalledWith(body.user);
      expect(Mixpanel.track).toHaveBeenCalled();
      // Tests that the second arguement is equal to userObj
      // currently Jest has no syntactic sugar for this
      expect(SensitiveInfo.setItem.mock.calls[SensitiveInfo.setItem.mock.calls.length - 2][1])
      .toEqual(accessToken);
      expect(SensitiveInfo.setItem.mock.calls[SensitiveInfo.setItem.mock.calls.length - 1][1])
      .toEqual(body.user);
      expect(fetch.mock.calls[0][1].body).toEqual(JSON.stringify({ email, password }));
      expect(authReducer(initialState, store.getActions()[0])).toMatchSnapshot();
      expect(authReducer(initialState, store.getActions()[1])).toMatchSnapshot();
    });

    test('handles a unsuccessful SIGNUP', async () => {
      fetch.mockResponseSuccess({ user: { ...user }, error: 'api server error' });
      await store.dispatch(authActions.signup());
      expect(authReducer(initialState, store.getActions()[1])).toMatchSnapshot();
    });

    test('handles a SIGNUP server error', async () => {
      fetch.mockResponseFailure();
      await store.dispatch(authActions.signup());
      // eslint-disable-next-line
      expect(Mixpanel.trackWithProperties.mock.calls[Mixpanel.trackWithProperties.mock.calls.length - 1][1])
      .toEqual({ errorMessage: 'api server error' });
      expect(authReducer(initialState, store.getActions()[1])).toMatchSnapshot();
    });

    test('should handle SET_ACCESS_TOKEN', () => {
      expect(authReducer(initialState, authActions.setAccessToken('testToken'))).toMatchSnapshot();
    });

    test('should handle SIGN_OUT', () => {
      expect(authReducer(initialState, authActions.signOut())).toMatchSnapshot();
    });

    test('should handle successful PASSWORD_START/PASSWORD_RESET', async () => {
      fetch.mockResponseSuccess({
        email: 'test@mail.com',
        passwordResetSent: true,
        ok: true,
      });
      await store.dispatch(authActions.reset({ email: 'test@mail.com' }));
      // eslint-disable-next-line
      expect(Mixpanel.trackWithProperties.mock.calls[Mixpanel.trackWithProperties.mock.calls.length - 1][1])
      .toEqual({ email: 'test@mail.com' });
      expect(authReducer(initialState, store.getActions()[0])).toMatchSnapshot();
      expect(authReducer(initialState, store.getActions()[1])).toMatchSnapshot();
    });

    test('handles a unsuccessful PASSWORD_RESET', async () => {
      fetch.mockResponseSuccess({
        error: 'api server error',
      });
      await store.dispatch(authActions.reset({ email: 'test@mail.com' }));
      // eslint-disable-next-line
      expect(Mixpanel.trackWithProperties.mock.calls[Mixpanel.trackWithProperties.mock.calls.length - 1][1])
      .toEqual({ email: 'test@mail.com', errorMessage: 'api server error' });
      expect(authReducer(initialState, store.getActions()[1])).toMatchSnapshot();
    });

    test('handles a PASSWORD_RESET server error', async () => {
      fetch.mockResponseFailure();
      await store.dispatch(authActions.reset({ email: 'test@mail.com' }));
      expect(authReducer(initialState, store.getActions()[1])).toMatchSnapshot();
    });
  });
});
