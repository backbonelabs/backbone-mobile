import { NativeModules } from 'react-native';
import Fetcher from '../utils/Fetcher';

const { Environment } = NativeModules;

const loginStart = () => ({ type: 'LOGIN__START' });

const login = payload => ({
  type: 'LOGIN',
  payload,
});

const loginError = error => ({
  type: 'LOGIN__ERROR',
  payload: error,
  error: true,
});

const signupStart = () => ({ type: 'SIGNUP__START' });

const signup = payload => ({
  type: 'SIGNUP',
  payload,
});

const signupError = error => ({
  type: 'SIGNUP__ERROR',
  payload: error,
  error: true,
});

const checkConfirmationStart = () => ({ type: 'CHECK_CONFIRMATION__START' });

const checkConfirmation = payload => ({
  type: 'CHECK_CONFIRMATION',
  payload,
});

const checkConfirmationError = error => ({
  type: 'CHECK_CONFIRMATION__ERROR',
  payload: error,
  error: true,
});

const recoverStart = () => ({ type: 'RECOVER__START' });

const recover = payload => ({
  type: 'RECOVER',
  payload,
});

const recoverError = error => ({
  type: 'RECOVER__ERROR',
  payload: error,
  error: true,
});

export default {
  login(user) {
    return (dispatch) => {
      dispatch(loginStart());

      return Fetcher.post({
        url: `${Environment.API_SERVER_URL}/auth/login`,
        body: JSON.stringify(user),
      })
        .then(response => response.json()
          .then((body) => {
            if (body.error) {
              // Error received from API server
              dispatch(loginError(
                new Error(body.error)
              ));
            } else {
              dispatch(login(body));
            }
          })
        )
        .catch(() => {
          // Network error
          dispatch(loginError(
            new Error('We are encountering server issues. Please try again later.')
          ));
        });
    };
  },

  signup(user) {
    return (dispatch) => {
      dispatch(signupStart());

      return Fetcher.post({
        url: `${Environment.API_SERVER_URL}/users/`,
        body: JSON.stringify(user),
      })
        .then(response => response.json()
          .then((body) => {
            if (body.error) {
              // Error received from API server
              dispatch(signupError(
                new Error(body.error)
              ));
            } else {
              dispatch(signup(body));
            }
          })
        )
        .catch(() => (
          // Network error
          dispatch(signupError(
            new Error('We are encountering server issues. Please try again later.')
          ))
        ));
    };
  },

  recover(user) {
    return (dispatch) => {
      dispatch(recoverStart());

      return Fetcher.post({
        url: `${Environment.API_SERVER_URL}/auth/reset`,
        body: JSON.stringify(user),
      })
        .then(response => response.json())
          .then(body => dispatch(recover(body)))
        .catch(() => (
          // Network error
          dispatch(recoverError(
            new Error('We are encountering server issues. Please try again later.')
          ))
        ));
    };
  },

  checkConfirmation(email) {
    return (dispatch) => {
      dispatch(checkConfirmationStart());

      return Fetcher.get({
        url: `${Environment.API_SERVER_URL}/users/confirm/${email}`,
      })
        .then(response => response.json())
          .then(body => !body.error && dispatch(checkConfirmation(body)))
        .catch(() => (
          dispatch(checkConfirmationError(
            new Error('We are encountering server issues. Please try again later.')
          ))
        ));
    };
  },
};
