import { NativeModules } from 'react-native';
import Fetcher from '../utils/Fetcher';
import SensitiveInfo from '../utils/SensitiveInfo';
import constants from '../utils/constants';
import Mixpanel from '../utils/Mixpanel';

const { Environment } = NativeModules;
const { storageKeys } = constants;

const loginStart = () => ({ type: 'LOGIN__START' });

const login = payload => ({
  type: 'LOGIN',
  payload,
});

const loginError = error => ({
  type: 'LOGIN__ERROR',
  payload: error,
});

const signupStart = () => ({ type: 'SIGNUP__START' });

const signup = payload => ({
  type: 'SIGNUP',
  payload,
});

const signOut = () => ({ type: 'SIGN__OUT' });

const signupError = error => ({
  type: 'SIGNUP__ERROR',
  payload: error,
});

const passwordResetStart = () => ({ type: 'PASSWORD_RESET__START' });

const passwordReset = payload => ({
  type: 'PASSWORD_RESET',
  payload,
});

const passwordResetError = error => ({
  type: 'PASSWORD_RESET__ERROR',
  payload: error,
});

const setAccessToken = token => ({
  type: 'SET_ACCESS_TOKEN',
  payload: token,
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
              // Identify user for Mixpanel tracking
              Mixpanel.identify(body._id);
              Mixpanel.set({ $email: body.email });

              const { accessToken, ...userObj } = body;
              // Store access token and user in local storage
              SensitiveInfo.setItem(storageKeys.ACCESS_TOKEN, accessToken);
              SensitiveInfo.setItem(storageKeys.USER, userObj);

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
        .then((response) => response.json()
          .then(body => {
            // Error received from API server
            if (body.error) {
              dispatch(signupError(
                new Error(body.error)
              ));
            } else {
              // Identify user for Mixpanel tracking
              Mixpanel.identify(body.user._id);
              Mixpanel.set({ $email: body.user.email });
              Mixpanel.track('signup');

              // Store access token and user in local storage
              SensitiveInfo.setItem(storageKeys.ACCESS_TOKEN, body.accessToken);
              SensitiveInfo.setItem(storageKeys.USER, body.user);

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

  reset(user) {
    return (dispatch) => {
      dispatch(passwordResetStart());

      return Fetcher.post({
        url: `${Environment.API_SERVER_URL}/auth/password-reset-token`,
        body: JSON.stringify(user),
      })
        .then((response) => {
          if (response.ok) {
            dispatch(passwordReset(response.ok));
          } else {
            return response.json()
              .then(body => (
                dispatch(passwordResetError(
                  new Error(body.error)
                ))
              ));
          }
        })
        .catch(() => (
          // Network error
          dispatch(passwordResetError(
            new Error('We are encountering server issues. Please try again later.')
          ))
        ));
    };
  },
  signOut() {
    return (dispatch) => {
      SensitiveInfo.deleteItem(storageKeys.ACCESS_TOKEN);
      SensitiveInfo.deleteItem(storageKeys.USER);
      dispatch(signOut());
    };
  },
  setAccessToken,
};
