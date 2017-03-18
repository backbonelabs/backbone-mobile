import { NativeModules } from 'react-native';
import store from '../store';
import constants from '../utils/constants';
import Fetcher from '../utils/Fetcher';
import SensitiveInfo from '../utils/SensitiveInfo';
import Mixpanel from '../utils/Mixpanel';

const { Environment } = NativeModules;
const { storageKeys, errorMessages } = constants;
const baseUrl = `${Environment.API_SERVER_URL}/users`;
const settingsUrl = `${baseUrl}/settings`;
const sessionsUrl = `${baseUrl}/sessions`;

const handleNetworkError = mixpanelEvent => {
  Mixpanel.track(`${mixpanelEvent}-serverError`);
  throw new Error(errorMessages.NETWORK_ERROR);
};

export default {
  fetchUser() {
    const state = store.getState();
    const { accessToken } = state.auth;
    const { user: { _id } } = state.user;
    const fetchUserEventName = 'fetchUserProfile';

    return {
      type: 'FETCH_USER',
      payload: () => Fetcher.get({
        url: `${baseUrl}/${_id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .catch(() => handleNetworkError(fetchUserEventName))
        .then(response => response.json())
        .then((body) => {
          if (body.error) {
            throw new Error(body.error);
          }

          // Store user in local storage
          SensitiveInfo.setItem(storageKeys.USER, body);
          return body;
        }),
    };
  },

  updateUser(user) {
    const {
      _id,
      ...userUpdateFields,
    } = user;
    const { accessToken } = store.getState().auth;
    const updateUserEventName = 'updateUserProfile';

    // Remove invalidData property, since no longer needed
    delete userUpdateFields.invalidData;

    return {
      type: 'UPDATE_USER',
      payload: () => Fetcher.post({
        url: `${baseUrl}/${_id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(userUpdateFields),
      })
        .catch(() => handleNetworkError(updateUserEventName))
        .then(response => response.json())
        .then((body) => {
          if (body.error) {
            // Error received from API server
            Mixpanel.trackWithProperties(`${updateUserEventName}-error`, {
              errorMessage: body.error,
            });

            throw new Error(body.error);
          }

          // Store updated user in local storage
          SensitiveInfo.setItem(storageKeys.USER, body);

          // Update user profile on Mixpanel
          Mixpanel.setUserProperties(body);
          Mixpanel.track(`${updateUserEventName}-success`);

          return body;
        }),
    };
  },

  updateUserSettings(user) {
    const {
      _id,
      settings,
    } = user;
    const { auth: { accessToken }, user: { user: oldUser } } = store.getState();
    const updateUserSettingsEventName = 'updateUserSettings';

    return {
      type: 'UPDATE_USER_SETTINGS',
      payload: () => Fetcher.post({
        url: `${settingsUrl}/${_id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(settings),
      })
        .catch(() => {
          // Network error
          Mixpanel.track(`${updateUserSettingsEventName}-serverError`);

          const userUpdateError = new Error(
            'We\'re encountering server issues. Settings saved locally.'
          );
          userUpdateError.settings = settings;

          // API request failed, store settings locally
          SensitiveInfo.setItem(storageKeys.USER, {
            ...oldUser,
            settings,
          });

          throw userUpdateError;
        })
        .then(response => response.json())
        .then((body) => {
          const userObj = {
            ...oldUser,
            settings: body,
          };

          if (body.error) {
            // Error received from API server
            Mixpanel.trackWithProperties(`${updateUserSettingsEventName}-error`, {
              errorMessage: body.error,
            });

            throw new Error(body.error);
          }

          // Store updated user in local storage
          SensitiveInfo.setItem(storageKeys.USER, userObj);

          // Update user profile on Mixpanel
          Mixpanel.setUserProperties(userObj);
          Mixpanel.track(`${updateUserSettingsEventName}-success`);

          return body;
        }),
    };
  },

  /**
   * Fetch user posture sessions for a date range
   * @param  {Object} dates
   * @param  {String} dates.fromDate ISO 8601 date string of starting date
   * @param  {String} dates.toDate   ISO 8601 date string of ending date
   * @return {Promise<Array>}
   */
  fetchUserSessions(dates) {
    const state = store.getState();
    const { accessToken } = state.auth;
    const { user: { _id } } = state.user;
    const fetchUserSessionsEventName = 'fetchUserSessions';

    return {
      type: 'FETCH_USER_SESSIONS',
      paylaod: () => Fetcher.get({
        url: `${sessionsUrl}/${_id}?from=${dates.fromDate}&to=${dates.toDate}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .catch(() => handleNetworkError(fetchUserSessionsEventName))
        .then(response => response.json())
        .then((body) => {
          if (body.error) {
            throw new Error(body.error);
          }
          return body;
        }),
    };
  },

  prepareUserUpdate(user) {
    return {
      type: 'PREPARE_USER_UPDATE',
      payload: user,
    };
  },
};
