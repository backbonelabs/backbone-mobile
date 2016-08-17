import { NativeModules } from 'react-native';

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

export default {
  login(user) {
    return dispatch => {
      dispatch(fetchAccessTokenStart());
      return global.fetch(`${Environment.API_SERVER_URL}/auth/login`, {
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
};
