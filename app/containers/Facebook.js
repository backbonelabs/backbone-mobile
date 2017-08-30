import React, { PropTypes } from 'react';
import { Alert } from 'react-native';
import {
  AccessToken as FBAccessToken,
  LoginManager,
  GraphRequest,
  GraphRequestManager,
} from 'react-native-fbsdk';
import { connect } from 'react-redux';
import constants from '../utils/constants';
import authActions from '../actions/auth';
import styles from '../styles/facebook';
import Button from '../components/Button';

/**
 * Collects Facebook user profile data and logs into Backbone API
 * @param {object} fbAccessToken Facebook access token
 */
const getFBUserInfo = (fbAccessToken, dispatch) => {
  const _responseInfoCallback = (error, result) => {
    if (error) {
      Alert.alert('Please try again.');
    } else {
        // Dispatches login with Facebook user profile
      const user = Object.assign({}, result, fbAccessToken, {
        authMethod: constants.authMethods.FACEBOOK,
      });
      dispatch(authActions.login(user));
    }
  };

  const infoRequest = new GraphRequest(
      '/me',
    {
      parameters: {
        fields: {
          string: 'email,first_name,last_name,gender,verified',
        },
      },
    },
      _responseInfoCallback
    );

  new GraphRequestManager().addRequest(infoRequest).start();
};

const login = (dispatch) => {
  LoginManager.logInWithReadPermissions(['public_profile', 'email']).then(result => {
    if (result && !result.isCancelled) {
        // After a Facebook user successfully authenticates, we use the returned Facebook
        // access token to get their profile.
      FBAccessToken.getCurrentAccessToken()
          .then((data) => {
            if (data) {
              getFBUserInfo(data, dispatch);
            }
          }
        )
        .catch(() => {
          Alert.alert('Unable to authenticate with Facebook. Try again later.');
        });
    }
  });
};
const Facebook = (props) => (
  <Button
    style={Object.assign({}, styles._fbBtn, props.style)}
    textStyle={styles._fbBtnText}
    text={props.buttonText}
    fbBtn
    onPress={() => { login(props.dispatch); }}
  />
    );

Facebook.propTypes = {
  dispatch: PropTypes.func,
  buttonText: PropTypes.string,
  style: PropTypes.object,
};

export default { button: connect()(Facebook), login };
