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
const getFBUserInfo = (fbAccountInfo, props) => {
  const _responseInfoCallback = (error, result) => {
    if (error) {
      Alert.alert('Please try again.');
    } else {
      let emailSwap = {};
      if (Object.keys(props.user).length !== 0) {
        // Handles Facebook logins from the Profile route.  If a confirmed
        // email/password users wants Facebook integration, we replace their
        // Facebook email with the current exiting one so a new local account
        // won't be created. A facebookId field will be added to the account.
        emailSwap = { email: props.user.user.email };
      }
      const user = Object.assign({}, result, emailSwap, fbAccountInfo, {
        authMethod: constants.authMethods.FACEBOOK,
      });
      props.dispatch(authActions.login(user));
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

const login = (props) => {
  LoginManager.logInWithReadPermissions(['public_profile', 'email']).then(result => {
    if (result && !result.isCancelled) {
        // After a Facebook user successfully authenticates, we use the returned Facebook
        // access token to get their profile.
      FBAccessToken.getCurrentAccessToken()
          .then((data) => {
            if (data) {
              getFBUserInfo(data, props);
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
    onPress={() => { login(props); }}
  />
    );

Facebook.propTypes = {
  dispatch: PropTypes.func,
  buttonText: PropTypes.string,
  style: PropTypes.object,
};

const mapStateToProps = (state) => {
  const { user } = state;
  return user;
};

export default { button: connect(mapStateToProps)(Facebook), login };
