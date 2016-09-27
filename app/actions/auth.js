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
            console.log('body', body);
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
};
