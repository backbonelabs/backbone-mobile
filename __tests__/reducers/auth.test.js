import * as types from '../../app/actions/types';
import authReducer from '../../app/reducers/auth';

describe('__Auth Reducer__', () => {
  const initialState = {
    accessToken: null,
    passwordResetSent: false,
    inProgress: false,
    errorMessage: null,
    userId: null,
  };

  const user = {
    _id: 'testId',
    accessToken: 'testToken',
    email: 'test@mail.com',
    nickname: 'testNick',
    password: 'password',
  };

  const error = {
    message: 'testError',
  };

  test('should return initial state', () => {
    expect(authReducer(initialState, {})).toMatchSnapshot();
  });

  test('should handle LOGIN', () => {
    expect(authReducer(initialState, {
      type: types.LOGIN,
      payload: user,
    })).toMatchSnapshot();
  });

  test('should handle LOGIN__START', () => {
    expect(authReducer(initialState, {
      type: types.LOGIN__START,
    })).toMatchSnapshot();
  });

  test('should handle LOGIN__ERROR', () => {
    expect(authReducer(initialState, {
      type: types.LOGIN__ERROR,
      payload: error,
    })).toMatchSnapshot();
  });

  test('should handle SIGNUP', () => {
    const { accessToken, ...userObj } = user;
    expect(authReducer(initialState, {
      type: types.SIGNUP,
      payload: { accessToken, user: userObj },
    })).toMatchSnapshot();
  });

  test('should handle SIGNUP__START', () => {
    expect(authReducer(initialState, {
      type: types.SIGNUP__START,
    })).toMatchSnapshot();
  });

  test('should handle SIGNUP__ERROR', () => {
    expect(authReducer(initialState, {
      type: types.SIGNUP__ERROR,
      payload: error,
    })).toMatchSnapshot();
  });

  test('should handle PASSWORD_RESET', () => {
    expect(authReducer(initialState, {
      type: types.PASSWORD_RESET,
      payload: true,
    })).toMatchSnapshot();
  });

  test('should handle PASSWORD_RESET__START', () => {
    expect(authReducer(initialState, {
      type: types.PASSWORD_RESET__START,
    })).toMatchSnapshot();
  });

  test('should handle PASSWORD_RESET__ERROR', () => {
    expect(authReducer(initialState, {
      type: types.PASSWORD_RESET__ERROR,
      payload: error,
    })).toMatchSnapshot();
  });

  test('should handle SIGN_OUT', () => {
    expect(authReducer(initialState, {
      type: types.SIGN_OUT,
    })).toMatchSnapshot();
  });

  test('should handle SET_ACCESS_TOKEN', () => {
    expect(authReducer(initialState, {
      type: types.SET_ACCESS_TOKEN,
    })).toMatchSnapshot();
  });
});
