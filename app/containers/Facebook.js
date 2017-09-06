import React, { PropTypes } from 'react';
import {
  View,
  Alert,
} from 'react-native';
import {
  AccessToken as FBAccessToken,
  LoginManager,
  GraphRequest,
  GraphRequestManager,
} from 'react-native-fbsdk';
import { connect } from 'react-redux';
import constants from '../utils/constants';
import authActions from '../actions/auth';
import userActions from '../actions/user';
import styles from '../styles/facebook';
import Button from '../components/Button';

const Facebook = (props) => (
  <Button
    style={[styles.fbBtn, props.style]}
    textStyle={styles.fbBtnText}
    text={props.buttonText}
    fbBtn
    onPress={() => { Facebook.login(props); }}
  />
);

Facebook.propTypes = {
  dispatch: PropTypes.func,
  buttonText: PropTypes.string,
  style: View.propTypes.style,
};

Facebook.login = (props) => {
  LoginManager.logInWithReadPermissions(['public_profile', 'email']).then(result => {
    if (result && !result.isCancelled) {
      // After a Facebook user successfully authenticates, we use the returned Facebook
      // access token to get their profile.
      FBAccessToken.getCurrentAccessToken()
          .then((data) => {
            if (data) {
              const callback = (error, graphResults) => {
                if (error) {
                  Alert.alert('Please try again.');
                } else if (Object.keys(props.user).length !== 0) {
                  // Handles Facebook logins from the Profile route. The user's
                  // email must be confirmed before Facebook integration is allowed.
                  props.dispatch(userActions.updateUser({
                    _id: props.user.user._id,
                    facebookId: data.userID,
                  }));
                } else {
                  const user = Object.assign({
                    accessToken: data.accessToken,
                    applicationID: data.applicationID,
                  }, graphResults, {
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
                callback
              );

              new GraphRequestManager().addRequest(infoRequest).start();
            }
          }
        )
        .catch(() => {
          Alert.alert('Unable to authenticate with Facebook. Try again later.');
        });
    }
  });
};

const mapStateToProps = (state) => {
  const { user } = state;
  return user;
};

export default connect(mapStateToProps)(Facebook);
