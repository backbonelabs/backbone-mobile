import { NativeModules } from 'react-native';

const { Environment } = NativeModules;

const fetchUserStart = () => ({ type: 'FETCH_USER__START' });

const fetchUser = user => ({
  type: 'FETCH_USER',
  payload: user,
});

const fetchUserError = error => ({
  type: 'FETCH_USER__ERROR',
  payload: error,
  error: true,
});

export default {
  setAccessToken(accessToken) {
    return {
      type: 'ACCESS_TOKEN',
      payload: accessToken,
    };
  },
  login(user) {
    return dispatch => {
      dispatch(fetchUserStart());
      return global.fetch(`${Environment.API_SERVER_URL}/auth/login`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      })
        .then(response => response.json())
        .then(body => {
          if (body.error) {
            throw new Error(body.error);
          } else {
            dispatch(fetchUser(body));
          }
        })
        .catch(err => {
          console.log('error', err);
          dispatch(fetchUserError(err));
        });
    };
  },
};
