import { NativeModules } from 'react-native';
import constants from '../utils/constants';
import Fetcher from '../utils/Fetcher';
import SensitiveInfo from '../utils/SensitiveInfo';
import Bugsnag from '../utils/Bugsnag';
import Mixpanel from '../utils/Mixpanel';

const { Environment } = NativeModules;
const { storageKeys } = constants;
const baseUrl = `${Environment.API_SERVER_URL}/users`;
const settingsUrl = `${baseUrl}/settings`;
const sessionsUrl = `${baseUrl}/sessions`;

const fetchUserStart = () => ({ type: 'FETCH_USER__START' });

const fetchUser = payload => ({
  type: 'FETCH_USER',
  payload,
});

const fetchUserError = error => ({
  type: 'FETCH_USER__ERROR',
  payload: error,
});

const updateUserStart = () => ({ type: 'UPDATE_USER__START' });

const updateUser = payload => ({
  type: 'UPDATE_USER',
  payload,
});

const updateUserError = error => ({
  type: 'UPDATE_USER__ERROR',
  payload: error,
});

const updateUserSettingsStart = () => ({ type: 'UPDATE_USER_SETTINGS__START' });

const updateUserSettings = payload => ({
  type: 'UPDATE_USER_SETTINGS',
  payload,
});

const updateUserSettingsError = error => ({
  type: 'UPDATE_USER_SETTINGS__ERROR',
  payload: error,
});

const prepareUserUpdate = payload => ({
  type: 'PREPARE_USER_UPDATE',
  payload,
});

const fetchSessions = sessions => ({
  type: 'FETCH_USER_SESSIONS',
  payload: sessions,
});

const fetchUserSessionsStart = () => ({ type: 'FETCH_USER_SESSIONS__START' });

const fetchUsersessionsError = error => ({
  type: 'FETCH_USER_SESSIONS__ERROR',
  payload: error,
});

export default {
  fetchUser() {
    return (dispatch, getState) => {
      const state = getState();
      const { accessToken } = state.auth;
      const { user: { _id } } = state.user;

      dispatch(fetchUserStart());

      return Fetcher.get({
        url: `${baseUrl}/${_id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .then(response => response.json()
          .then((body) => {
            if (body.error) {
              dispatch(fetchUserError(
                new Error(body.error)
              ));
            } else {
              // Store user in local storage
              SensitiveInfo.setItem(storageKeys.USER, body);

              // Update user details in Bugsnag
              Bugsnag.setUser(body._id, body.nickname, body.email);

              // Update user profile on Mixpanel
              Mixpanel.setUserProperties(body);

              dispatch(fetchUser(body));
            }
          })
        )
        .catch(() => (
          // Network error
          dispatch(fetchUserError(
            new Error('We are encountering server issues. Please try again later.')
          ))
        ));
    };
  },

  updateUser(user) {
    const {
      _id,
      ...userUpdateFields,
    } = user;

    return (dispatch, getState) => {
      const state = getState();
      const { accessToken } = state.auth;

      const updateUserEventName = 'updateUserProfile';

      // Remove invalidData property, since no longer needed
      delete userUpdateFields.invalidData;

      dispatch(updateUserStart());

      return Fetcher.post({
        url: `${baseUrl}/${_id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(userUpdateFields),
      })
        .then(response => response.json()
          .then((body) => {
            if (body.error) {
              // Error received from API server
              Mixpanel.trackWithProperties(`${updateUserEventName}-error`, {
                errorMessage: body.error,
              });

              dispatch(updateUserError(
                new Error(body.error)
              ));
            } else {
              // Store updated user in local storage
              SensitiveInfo.setItem(storageKeys.USER, body);

              // Update user details in Bugsnag
              Bugsnag.setUser(body._id, body.nickname, body.email);

              // Update user profile on Mixpanel
              Mixpanel.setUserProperties(body);
              Mixpanel.track(`${updateUserEventName}-success`);

              dispatch(updateUser(body));
            }
          })
        )
        .catch(() => {
          // Network error
          Mixpanel.track(`${updateUserEventName}-serverError`);

          dispatch(updateUserError(
            new Error('We are encountering server issues. Please try again later.')
          ));
        });
    };
  },

  updateUserSettings(user) {
    const {
      _id,
      settings,
    } = user;

    return (dispatch, getState) => {
      const state = getState();
      const { auth: { accessToken }, user: { user: oldUser } } = state;

      const updateUserSettingsEventName = 'updateUserSettings';

      dispatch(updateUserSettingsStart());

      return Fetcher.post({
        url: `${settingsUrl}/${_id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(settings),
      })
        .then(response => response.json()
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

              return dispatch(updateUserSettingsError(
                new Error(body.error)
              ));
            }

            // Store updated user in local storage
            SensitiveInfo.setItem(storageKeys.USER, userObj);

            // Update user profile on Mixpanel
            Mixpanel.setUserProperties(userObj);
            Mixpanel.track(`${updateUserSettingsEventName}-success`);

            return dispatch(updateUserSettings(body));
          })
        )
        .catch(() => {
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

          // Network error
          return dispatch(updateUserSettingsError(userUpdateError));
        });
    };
  },

  fetchUserSessions(dates) {
    return (dispatch, getState) => {
      const state = getState();
      const { accessToken } = state.auth;
      const { user: { _id } } = state.user;

      dispatch(fetchUserSessionsStart());

      return Fetcher.get({
        url: `${sessionsUrl}/${_id}?from=${dates.fromDate}&to=${dates.toDate}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .then(response => response.json())
        .then((body) => {
          if (body.error) {
            dispatch(fetchUsersessionsError(
              new Error(body.error)
            ));
          } else {
            dispatch(fetchSessions(body));
          }
        })
        .catch(() => {
          // Network error
          dispatch(fetchUsersessionsError(
            new Error('We are encountering server issues. Please try again later.')
          ));
        });
    };
  },

  prepareUserUpdate,
};
