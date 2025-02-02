import { NativeModules } from 'react-native';
import {
  FETCH_USER,
  UPDATE_USER,
  UPDATE_USER_SETTINGS,
  UPDATE_USER_TRAINING_PLAN_PROGRESS,
  FETCH_USER_SESSIONS,
  PREPARE_USER_UPDATE,
  FETCH_USER_WORKOUTS,
  SELECT_WORKOUT,
  RESEND_CONFIRMATION_EMAIL,
} from './types';
import store from '../store';
import constants from '../utils/constants';
import Fetcher from '../utils/Fetcher';
import SensitiveInfo from '../utils/SensitiveInfo';
import Bugsnag from '../utils/Bugsnag';
import Mixpanel from '../utils/Mixpanel';

const { Environment } = NativeModules;
const { storageKeys, errorMessages } = constants;
const baseUrl = `${Environment.API_SERVER_URL}/users`;
const settingsUrl = `${baseUrl}/settings`;
const sessionsUrl = `${baseUrl}/sessions`;
const workoutsUrl = `${baseUrl}/workouts`;
const sendConfirmationEmailUrl = `${baseUrl}/send-confirmation-email`;

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
      type: FETCH_USER,
      payload: () => Fetcher.get({
        url: `${baseUrl}/${_id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .catch(() => handleNetworkError(fetchUserEventName))
        .then(response => response.json())
        .then((body) => {
          if (body.error) {
            // Error received from API server
            Mixpanel.trackWithProperties(`${fetchUserEventName}-error`, {
              errorMessage: body.error,
            });

            throw new Error(body.error);
          }
          // Update user details in Bugsnag
          Bugsnag.setUser(body._id, body.nickname, body.email || '');

          // Update user profile in Mixpanel
          Mixpanel.setUserProperties(body);

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
      type: UPDATE_USER,
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

          // Update user details in Bugsnag
          Bugsnag.setUser(body._id, body.nickname, body.email || '');

          // Update user profile in Mixpanel
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
      type: UPDATE_USER_SETTINGS,
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

          // Update user profile in Mixpanel
          Mixpanel.setUserProperties(userObj);
          Mixpanel.track(`${updateUserSettingsEventName}-success`);

          return body;
        }),
    };
  },

  updateUserTrainingPlanProgress(progress) {
    const { auth: { accessToken }, user: { user } } = store.getState();
    const eventName = 'updateUserTrainingPlanProgress';

    return {
      type: UPDATE_USER_TRAINING_PLAN_PROGRESS,
      payload: () => Fetcher.post({
        url: `${baseUrl}/${user._id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ trainingPlanProgress: progress }),
      })
        .catch(() => handleNetworkError(eventName))
        .then(response => response.json())
        .then((body) => {
          if (body.error) {
            // Error received from API server
            Mixpanel.trackWithProperties(`${eventName}-error`, {
              errorMessage: body.error,
            });

            throw new Error(body.error);
          }

          // Store updated user in local storage
          SensitiveInfo.setItem(storageKeys.USER, body);

          // Update user profile in Mixpanel
          Mixpanel.setUserProperties(body);
          Mixpanel.track(`${eventName}-success`);

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
      type: FETCH_USER_SESSIONS,
      payload: () => Fetcher.get({
        url: `${sessionsUrl}/${_id}?from=${dates.fromDate}&to=${dates.toDate}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .catch(() => handleNetworkError(fetchUserSessionsEventName))
        .then(response => response.json())
        .then((body) => {
          if (body.error) {
            // Error received from API server
            Mixpanel.trackWithProperties(`${fetchUserSessionsEventName}-error`, {
              errorMessage: body.error,
            });

            throw new Error(body.error);
          }
          Mixpanel.trackWithProperties('fetchUserSessions', {
            from: dates.fromDate,
            to: dates.toDate,
          });
          return body;
        }),
    };
  },

  fetchUserWorkouts() {
    const state = store.getState();
    const { accessToken } = state.auth;
    const { user: { _id } } = state.user;
    const fetchUserWorkoutsEventName = 'fetchUserWorkouts';

    return {
      type: FETCH_USER_WORKOUTS,
      payload: () => Fetcher.get({
        url: `${workoutsUrl}/${_id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .catch(() => handleNetworkError(fetchUserWorkoutsEventName))
        .then(response => response.json())
        .then((body) => {
          if (body.error) {
            // Error received from API server
            Mixpanel.trackWithProperties(`${fetchUserWorkoutsEventName}-error`, {
              errorMessage: body.error,
            });

            throw new Error(body.error);
          }

          Mixpanel.track(`${fetchUserWorkoutsEventName}-success`);

          return body;
        }),
    };
  },

  resendEmail() {
    const state = store.getState();
    const { accessToken } = state.auth;
    const { user: { _id } } = state.user;
    const resendConfirmationEmailEventName = 'resendConfirmationEmail';

    return {
      type: RESEND_CONFIRMATION_EMAIL,
      payload: () => Fetcher.post({
        url: `${sendConfirmationEmailUrl}/${_id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .catch(() => handleNetworkError(resendConfirmationEmailEventName))
        .then(response => response.json())
        .then((body) => {
          if (body.error) {
            Mixpanel.trackWithProperties(`${resendConfirmationEmailEventName}-error`, {
              errorMessage: body.error,
            });

            throw new Error(body.error);
          }
          Mixpanel.track(`${resendConfirmationEmailEventName}-success`);

          return body;
        }),
    };
  },

  prepareUserUpdate(user) {
    return {
      type: PREPARE_USER_UPDATE,
      payload: user,
    };
  },

  selectWorkout(workoutId) {
    return {
      type: SELECT_WORKOUT,
      payload: workoutId,
    };
  },
};
