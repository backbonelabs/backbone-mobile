import { NativeModules } from 'react-native';
import Fetcher from '../utils/Fetcher';

const { Environment } = NativeModules;
const baseUrl = `${Environment.API_SERVER_URL}/users`;
const settingsUrl = `${baseUrl}/settings`;

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

const prepareUserUpdate = payload => ({
  type: 'PREPARE_USER_UPDATE',
  payload,
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
          .then((body) => {
            if (body.error) {
              dispatch(fetchUserError(
                new Error(body.error)
              ));
            } else {
              dispatch(fetchUser(body));
            }
          })
        )
        .catch(() => (
          // Network error
          dispatch(updateUserError(
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
              dispatch(updateUserError(
                new Error(body.error)
              ));
            } else {
              dispatch(updateUser(body));
            }
          })
        )
        .catch(() => (
          // Network error
          dispatch(updateUserError(
            new Error('We are encountering server issues. Please try again later.')
          ))
        ));
    };
  },

  updateUserSettings(user) {
    const {
      _id,
      settings,
    } = user;

    return (dispatch, getState) => {
      const state = getState();
      const { accessToken } = state.auth;

      dispatch(updateUserSettingsStart());

      return Fetcher.post({
        url: `${settingsUrl}/${_id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(settings),
      })
        .then(response => response.json()
          .then((body) => {
            if (body.error) {
              // Error received from API server
              return dispatch(updateUserSettingsError(
                new Error(body.error)
              ));
            }

            return dispatch(updateUserSettings(body));
          })
        )
        .catch(() => (
          // Network error
          dispatch(updateUserSettingsError(
            new Error('We are encountering server issues. Please try again later.')
          ))
        ));
    };
  },
  prepareUserUpdate,
};
