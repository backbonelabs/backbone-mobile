import { NativeModules } from 'react-native';
import {
  LOGIN,
  SIGNUP,
  PASSWORD_RESET,
  SIGN_OUT,
  SET_ACCESS_TOKEN,
} from './types';
import Fetcher from '../utils/Fetcher';
import SensitiveInfo from '../utils/SensitiveInfo';
import constants from '../utils/constants';
import Mixpanel from '../utils/Mixpanel';

const { Environment } = NativeModules;
const { storageKeys, errorMessages } = constants;

const handleNetworkError = mixpanelEvent => {
  Mixpanel.track(`${mixpanelEvent}-serverError`);
  throw new Error(errorMessages.NETWORK_ERROR);
};

export default {
  login(user) {
    const loginEventName = 'login';

    return {
      type: LOGIN,
      payload: () => Fetcher.post({
        url: `${Environment.API_SERVER_URL}/auth/login`,
        body: JSON.stringify(user),
      })
        .catch(() => handleNetworkError(loginEventName))
        .then(response => response.json())
        .then((body) => {
          if (body.error) {
            // Error received from API server
            Mixpanel.trackWithProperties(`${loginEventName}-error`, {
              errorMessage: body.error,
            });

            throw new Error(body.error);
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

            return body;
          }
        }),
    };
  },

  signup(user) {
    const signupEventName = 'signup';

    return {
      type: SIGNUP,
      payload: () => Fetcher.post({
        url: `${Environment.API_SERVER_URL}/users/`,
        body: JSON.stringify(user),
      })
        .catch(() => handleNetworkError(signupEventName))
        .then(response => response.json())
        .then(body => {
          // Error received from API server
          if (body.error) {
            Mixpanel.trackWithProperties(`${signupEventName}-error`, {
              errorMessage: body.error,
            });

            throw new Error(body.error);
          } else {
            // Identify user for Mixpanel tracking
            Mixpanel.identify(body.user._id);

            // Update user profile on Mixpanel
            Mixpanel.setUserProperties(body.user);
            Mixpanel.track(`${signupEventName}-success`);

            // Store access token and user in local storage
            SensitiveInfo.setItem(storageKeys.ACCESS_TOKEN, body.accessToken);
            SensitiveInfo.setItem(storageKeys.USER, body.user);

            return body;
          }
        }),
    };
  },

  reset(user) {
    const passwordResetEventName = 'passwordReset';

    return {
      type: PASSWORD_RESET,
      payload: () => Fetcher.post({
        url: `${Environment.API_SERVER_URL}/auth/password-reset-token`,
        body: JSON.stringify(user),
      })
        .catch(() => handleNetworkError(passwordResetEventName))
        .then(response => response.json())
        .then((response) => {
          if (response.ok) {
            Mixpanel.trackWithProperties(`${passwordResetEventName}-success`, {
              email: user.email,
            });

            return response.ok;
          }
          return response.json()
            .then(body => {
              Mixpanel.trackWithProperties(`${passwordResetEventName}-error`, {
                email: user.email,
                errorMessage: body.error,
              });

              throw new Error(body.error);
            });
        }),
    };
  },

  signOut() {
    Mixpanel.track('signOut');

    SensitiveInfo.deleteItem(storageKeys.ACCESS_TOKEN);
    SensitiveInfo.deleteItem(storageKeys.USER);

    return { type: SIGN_OUT };
  },

  setAccessToken(token) {
    return {
      type: SET_ACCESS_TOKEN,
      payload: token,
    };
  },
};
