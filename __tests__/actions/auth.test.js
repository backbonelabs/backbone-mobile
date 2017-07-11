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

  const user = {
    email: 'test@mail.com',
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
    });

    test('should return initial state', () => {
      expect(authReducer(initialState, {})).toMatchSnapshot();
    });

    // store.getActions() returns an array of actions,
    // the first object is always the ''__START action
    test('handles a successful LOGIN__START/LOGIN', async () => {
      fetch.mockResponseSuccess(user);
      await store.dispatch(authActions.login({ email, password }));
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
      expect(authReducer(initialState, store.getActions()[1])).toMatchSnapshot();
    });

    test('handles a successful SIGNUP__START/SIGNUP', async () => {
      const { accessToken, ...rest } = user;
      fetch.mockResponseSuccess({ user: { ...rest }, accessToken });
      await store.dispatch(authActions.signup({ email, password }));
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
      expect(authReducer(initialState, store.getActions()[1])).toMatchSnapshot();
    });

    test('should handle SET_ACCESS_TOKEN ', () => {
      expect(authReducer(initialState, authActions.setAccessToken('testToken'))).toMatchSnapshot();
    });

    test('should handle SIGN_OUT action', () => {
      expect(authReducer(initialState, authActions.signOut())).toMatchSnapshot();
    });

    test('should handle PASSWORD_RESET action', () => {
      expect(authReducer(initialState, authActions.reset())).toMatchSnapshot();
    });
  });
});

