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
                new Error('Invalid email/password. Please try again.')
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
      dispatch(fetchAccessTokenStart());
      return global.fetch(`${Environment.API_SERVER_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      })
        .then(response => response.json()
          .then(body => {
            if (body.error) {
              // Error received from API server
              dispatch(fetchAccessTokenError(
                new Error('Invalid email/password. Please try again.')
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
};
