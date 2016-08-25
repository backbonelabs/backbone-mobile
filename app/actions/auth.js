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

const checkConfirmationStart = () => ({ type: 'CHECK_CONFIRMATION__START' });

const checkConfirmation = payload => ({
  type: 'CHECK_CONFIRMATION',
  payload,
});

const checkConfirmationError = error => ({
  type: 'CHECK_CONFIRMATION__ERROR',
  payload: error,
  error: true,
});

const resendConfirmationStart = () => ({ type: 'RESEND_CONFIRMATION__START' });

const resendConfirmation = payload => ({
  type: 'RESEND_CONFIRMATION',
  payload,
});

const resendConfirmationError = error => ({
  type: 'RESEND_CONFIRMATION__ERROR',
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
        .then(response => {
          dispatch(verifyAccessToken(response.ok)); // response.ok is true when status code is 2xx
        })
        .catch(() => {
          // Network error
          dispatch(verifyAccessTokenError(
            new Error('We are encountering server issues. Please try again later.')
          ));
        });
    };
  },

  checkConfirmation(email) {
    return dispatch => {
      dispatch(checkConfirmationStart());
      return Fetcher.get({
        url: `${Environment.API_SERVER_URL}/users/confirm/${email}`,
      })
        .then(response => response.json())
        .then(body => {
          dispatch(checkConfirmation(body));
        })
        .catch(() => {
          dispatch(checkConfirmationError(
            new Error('We are encountering server issues. Please try again later.')
          ));
        });
    };
  },

  resendConfirmation(email) {
    return dispatch => {
      dispatch(resendConfirmationStart());
      return Fetcher.post({
        url: `${Environment.API_SERVER_URL}/users/resend/`,
        body: JSON.stringify(email),
      })
        .then(response => {
          dispatch(resendConfirmation(response.ok));
        })
        .catch(() => {
          dispatch(resendConfirmationError(
            new Error('We are encountering server issues. Please try again later.')
          ));
        });
    };
  },
};
