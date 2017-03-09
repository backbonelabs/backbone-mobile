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

      const loginEventName = 'login';

      return Fetcher.post({
        url: `${Environment.API_SERVER_URL}/auth/login`,
        body: JSON.stringify(user),
      })
        .then(response => response.json()
          .then((body) => {
            if (body.error) {
              // Error received from API server
              Mixpanel.track(`${loginEventName}-error`);

              dispatch(loginError(
                new Error(body.error)
              ));
            } else {
              const { accessToken, ...userObj } = body;

              // Identify user for Mixpanel tracking
              Mixpanel.identify(userObj._id);

              // Update user profile on Mixpanel
              Mixpanel.setUserProperties(userObj);
              Mixpanel.track(`${loginEventName}-success`);

              // Store access token and user in local storage
              SensitiveInfo.setItem(storageKeys.ACCESS_TOKEN, accessToken);
              SensitiveInfo.setItem(storageKeys.USER, userObj);

              dispatch(login(body));
            }
          })
        )
        .catch(() => {
          // Network error
          Mixpanel.track(`${loginEventName}-serverError`);

          dispatch(loginError(
            new Error('We are encountering server issues. Please try again later.')
          ));
        });
    };
  },

  signup(user) {
    return (dispatch) => {
      dispatch(signupStart());

      const signupEventName = 'signup';

      return Fetcher.post({
        url: `${Environment.API_SERVER_URL}/users/`,
        body: JSON.stringify(user),
      })
        .then((response) => response.json()
          .then(body => {
            // Error received from API server
            if (body.error) {
              Mixpanel.track(`${signupEventName}-error`);

              dispatch(signupError(
                new Error(body.error)
              ));
            } else {
              // Identify user for Mixpanel tracking
              Mixpanel.identify(body.user._id);

              // Update user profile on Mixpanel
              Mixpanel.setUserProperties(body.user);
              Mixpanel.track(`${signupEventName}-success`);

              // Store access token and user in local storage
              SensitiveInfo.setItem(storageKeys.ACCESS_TOKEN, body.accessToken);
              SensitiveInfo.setItem(storageKeys.USER, body.user);

              dispatch(signup(body));
            }
          })
        )
        .catch(() => {
          // Network error
          Mixpanel.track(`${signupEventName}-serverError`);

          dispatch(signupError(
            new Error('We are encountering server issues. Please try again later.')
          ));
        });
    };
  },

  reset(user) {
    return (dispatch) => {
      dispatch(passwordResetStart());

      const passwordResetEventName = 'passwordReset';

      return Fetcher.post({
        url: `${Environment.API_SERVER_URL}/auth/password-reset-token`,
        body: JSON.stringify(user),
      })
        .then((response) => {
          if (response.ok) {
            Mixpanel.trackWithProperties(`${passwordResetEventName}-success`, {
              email: user.email,
            });

            dispatch(passwordReset(response.ok));
          } else {
            Mixpanel.trackWithProperties(`${passwordResetEventName}-error`, {
              email: user.email,
            });

            return response.json()
              .then(body => (
                dispatch(passwordResetError(
                  new Error(body.error)
                ))
              ));
          }
        })
        .catch(() => {
          // Network error
          Mixpanel.trackWithProperties(`${passwordResetEventName}-serverError`, {
            email: user.email,
          });

          dispatch(passwordResetError(
            new Error('We are encountering server issues. Please try again later.')
          ));
        });
    };
  },
  signOut() {
    return (dispatch) => {
      Mixpanel.track('signOut');

      SensitiveInfo.deleteItem(storageKeys.ACCESS_TOKEN);
      SensitiveInfo.deleteItem(storageKeys.USER);
      dispatch(signOut());
    };
  },
  setAccessToken,
};
