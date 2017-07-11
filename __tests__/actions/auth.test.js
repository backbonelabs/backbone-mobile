import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { asyncActionMiddleware } from 'redux-async-action';
import authActions from '../../app/actions/auth';
import authReducer from '../../app/reducers/auth';

describe('Auth state', () => {
  const store = configureStore([asyncActionMiddleware, thunk])({});

  const initialState = {
    accessToken: null,
    passwordResetSent: false,
    inProgress: false,
    errorMessage: null,
    userId: null,
  };

  describe('actions --', () => {
    beforeEach(() => {
      store.clearActions();
    });

    test('handles a successful LOGIN', async () => {
      const user = { email: 'test@mail.com', password: 'password' };
      fetch.mockResponseSuccess(user);
      await store.dispatch(authActions.login(user));
      expect(fetch.mock.calls[0][1].body).toEqual(JSON.stringify(user));
      expect(store.getActions()).toMatchSnapshot();
    });

    test('handles a unsuccessful LOGIN', async () => {
      const userErr = { email: 'test@mail.com', password: 'password', error: 'api server error' };
      fetch.mockResponseSuccess(userErr);
      await store.dispatch(authActions.login());
      expect(store.getActions()).toMatchSnapshot();
    });

    test('handles a LOGIN server error', async () => {
      fetch.mockResponseFailure();
      await store.dispatch(authActions.login());
      expect(store.getActions()).toMatchSnapshot();
    });

    test('handles a successful SIGNUP', async () => {
      const user = { email: 'test@mail.com', password: 'password' };
      const body = {
        user: {
          ...user,
          _id: 'id',
        },
      };

      fetch.mockResponseSuccess(body);
      await store.dispatch(authActions.signup(user));
      expect(fetch.mock.calls[0][1].body).toEqual(JSON.stringify(user));
      expect(store.getActions()).toMatchSnapshot();
    });

    test('handles a unsuccessful SIGNUP', async () => {
      const body = {
        user: {
          email: 'test@mail.com',
          password: 'password',
          _id: 'id',
        },
        error: 'api server error',
      };
      fetch.mockResponseSuccess(body);
      await store.dispatch(authActions.signup());
      expect(store.getActions()).toMatchSnapshot();
    });

    test('handles a SIGNUP server error', async () => {
      fetch.mockResponseFailure();
      await store.dispatch(authActions.signup());
      expect(store.getActions()).toMatchSnapshot();
    });

    test('creates a PASSWORD_RESET action', () => {
      expect(authActions.reset()).toMatchSnapshot();
    });

    test('creates a SIGN_OUT action', () => {
      expect(store.dispatch(authActions.signOut())).toMatchSnapshot();
    });

    test('creates a SET_ACCESS_TOKEN action', () => {
      expect(authActions.setAccessToken('token')).toMatchSnapshot();
    });
  });

  describe('reducer --', () => {
    test('should return initial state', () => {
      expect(authReducer(initialState, {})).toMatchSnapshot();
    });

    test('should handle LOGIN', () => {
      expect(authReducer(initialState, authActions.login())).toMatchSnapshot();
    });

    test('should handle SET_ACCESS_TOKEN ', () => {
      expect(authReducer(initialState, authActions.setAccessToken('token'))).toMatchSnapshot();
    });

    test('should handle SIGN_OUT action', () => {
      expect(authReducer(initialState, authActions.signOut())).toMatchSnapshot();
    });

  // causes an error because user is undefined in payload (action.payload.user._id),
    test('should handle SIGNUP action', () => {
      const obj = authActions.signup().payload.user = {};
      expect(authReducer(initialState, obj)).toMatchSnapshot();
    });

    test('should handle PASSWORD_RESET action', () => {
      expect(authReducer(initialState, authActions.reset())).toMatchSnapshot();
    });
  });
});

