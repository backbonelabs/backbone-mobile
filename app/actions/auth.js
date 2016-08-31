import { NativeModules } from 'react-native';
import Fetcher from '../utils/Fetcher';

const { Environment } = NativeModules;

const fetchAccessTokenStart = () => ({ type: 'FETCH_ACCESS_TOKEN__START' });

const fetchAccessToken = payload => ({
  type: 'FETCH_ACCESS_TOKEN',
  payload,
});

const fetchAccessTokenError = error => ({
  type: 'FETCH_ACCESS_TOKEN__ERROR',
  payload: error,
  error: true,
});

const verifyAccessTokenStart = () => ({ type: 'VERIFY_ACCESS_TOKEN__START' });

const verifyAccessToken = payload => ({
  type: 'VERIFY_ACCESS_TOKEN',
  payload,
});

const verifyAccessTokenError = error => ({
  type: 'VERIFY_ACCESS_TOKEN__ERROR',
  payload: error,
  error: true,
});

const createUserAccountStart = () => ({ type: 'CREATE_USER_ACCOUNT__START' });

const createUserAccount = payload => ({
  type: 'CREATE_USER_ACCOUNT',
  payload,
});

const createUserAccountError = error => ({
  type: 'CREATE_USER_ACCOUNT__ERROR',
  payload: error,
  error: true,
});

const checkEmailConfirmationStart = () => ({ type: 'CHECK_EMAIL_CONFIRMATION__START' });

const checkEmailConfirmation = payload => ({
  type: 'CHECK_EMAIL_CONFIRMATION',
  payload,
});

const checkEmailConfirmationError = error => ({
  type: 'CHECK_EMAIL_CONFIRMATION__ERROR',
  payload: error,
  error: true,
});

export default {
  login(user) {
    return dispatch => {
      dispatch(fetchAccessTokenStart());
      return Fetcher.post({
        url: `${Environment.API_SERVER_URL}/auth/login`,
        body: JSON.stringify(user),
      })
        .then(response => response.json()
          .then(body => {
            if (body.error) {
              // Error received from API server
              dispatch(fetchAccessTokenError(
                new Error(body.error)
              ));
            } else {
              dispatch(fetchAccessToken(body));
            }
          })
        )
        .catch(() => {
          // Network error
          dispatch(fetchAccessTokenError(
            new Error('We are encountering server issues. Please try again later.')
          ));
        });
    };
  },

  signup(user) {
    return dispatch => {
      dispatch(createUserAccountStart());
      return Fetcher.post({
        url: `${Environment.API_SERVER_URL}/users/`,
        body: JSON.stringify(user),
      })
        .then(response => response.json()
          .then(body => {
            if (body.error) {
              // Error received from API server
              dispatch(createUserAccountError(
                new Error(body.error)
              ));
            } else {
              dispatch(createUserAccount(body));
            }
          })
        )
        .catch(() => {
          // Network error
          dispatch(createUserAccountError(
            new Error('We are encountering server issues. Please try again later.')
          ));
        });
    };
  },

  verifyAccessToken(accessToken) {
    return dispatch => {
      dispatch(verifyAccessTokenStart());
      return Fetcher.post({
        url: `${Environment.API_SERVER_URL}/auth/verify`,
        body: JSON.stringify({ accessToken }),
      })
        .then(response => response.json()
          .then(body => {
            dispatch(verifyAccessToken(body));
          })
        )
        .catch(() => {
          // Network error
          dispatch(verifyAccessTokenError(
            new Error('We are encountering server issues. Please try again later.')
          ));
        });
    };
  },

  checkEmailConfirmation(email) {
    return dispatch => {
      dispatch(checkEmailConfirmationStart());
      return Fetcher.get({
        url: `${Environment.API_SERVER_URL}/users/confirm/${email}`,
      })
        .then(response => {
          dispatch(checkEmailConfirmation(response.ok));
        })
        .catch(() => {
          dispatch(checkEmailConfirmationError(
            new Error('We are encountering server issues. Please try again later.')
          ));
        });
    };
  },
};
