import { NativeModules } from 'react-native';
import Fetcher from '../utils/Fetcher';

const { Environment } = NativeModules;
const baseUrl = `${Environment.API_SERVER_URL}/users`;
const settingsUrl = `${Environment.API_SERVER_URL}/users/settings`;

const fetchUserStart = () => ({ type: 'FETCH_USER__START' });

const fetchUser = payload => ({
  type: 'FETCH_USER',
  payload,
});

const fetchUserError = error => ({
  type: 'FETCH_USER__ERROR',
  payload: error,
  error: true,
});

const updateUserStart = () => ({ type: 'UPDATE_USER__START' });

const updateUser = payload => ({
  type: 'UPDATE_USER',
  payload,
});

const updateUserError = error => ({
  type: 'UPDATE_USER__ERROR',
  payload: error,
  error: true,
});

const fetchUserSettingsStart = () => ({ type: 'FETCH_USER_SETTINGS__START' });

const fetchUserSettings = payload => ({
  type: 'FETCH_USER_SETTINGS',
  payload,
});

const fetchUserSettingsError = error => ({
  type: 'FETCH_USER_SETTINGS__ERROR',
  payload: error,
  error: true,
});

const updateUserSettingsStart = () => ({ type: 'UPDATE_USER_SETTINGS__START' });

const updateUserSettings = payload => ({
  type: 'UPDATE_USER_SETTINGS',
  payload,
});

const updateUserSettingsError = error => ({
  type: 'UPDATE_USER_SETTINGS__ERROR',
  payload: error,
  error: true,
});

export default {
  fetchUser() {
    return (dispatch, getState) => {
      const state = getState();
      const { accessToken, userId } = state.auth;

      dispatch(fetchUserStart());

      return Fetcher.get({
        url: `${baseUrl}/${userId}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .then(response => response.json()
          .then(body => {
            if (body.error) {
              dispatch(fetchUserError(
                new Error(body.error)
              ));
            } else {
              dispatch(fetchUser(body));
            }
          })
        )
        .catch(() => {
          // Network error
          dispatch(updateUserError(
            new Error('We are encountering server issues. Please try again later.')
          ));
        });
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

      dispatch(updateUserStart());

      return Fetcher.post({
        url: `${baseUrl}/${_id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(userUpdateFields),
      })
        .then(response => response.json()
          .then(body => {
            if (body.error) {
              // Error received from API server
              dispatch(updateUserError(
                new Error(body.error)
              ));
            } else {
              dispatch(updateUser(body));
            }
          })
        )
        .catch(() => {
          // Network error
          dispatch(updateUserError(
            new Error('We are encountering server issues. Please try again later.')
          ));
        });
    };
  },

  fetchUserSettings() {
    return (dispatch, getState) => {
      const state = getState();
      const { accessToken, userId } = state.auth;

      dispatch(fetchUserSettingsStart());

      return Fetcher.get({
        url: `${settingsUrl}/${userId}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .then(response => response.json()
          .then(body => {
            if (body.error) {
              // Error received from API server
              dispatch(fetchUserSettingsError(
                new Error(body.error)
              ));
            } else {
              dispatch(fetchUserSettings(body));
            }
          })
        )
        .catch(() => {
          // Network error
          dispatch(fetchUserSettingsError(
            new Error('We are encountering server issues. Please try again later.')
          ));
        });
    };
  },

  updateUserSettings(user) {
    const {
      _id,
      ...userSettingsUpdateFields,
    } = user;

    return (dispatch, getState) => {
      const state = getState();
      const { accessToken } = state.auth;

      dispatch(updateUserSettingsStart());

      return Fetcher.post({
        url: `${settingsUrl}/${_id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(userSettingsUpdateFields),
      })
        .then(response => response.json()
          .then(body => {
            if (body.error) {
              // Error received from API server
              dispatch(updateUserSettingsError(
                new Error(body.error)
              ));
            } else {
              dispatch(updateUserSettings(body));
            }
          })
        )
        .catch(() => {
          // Network error
          dispatch(updateUserSettingsError(
            new Error('We are encountering server issues. Please try again later.')
          ));
        });
    };
  },
};
