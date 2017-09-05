import React, { Component, PropTypes } from 'react';
import { Alert, View } from 'react-native';
import {
  AccessToken as FBAccessToken,
  LoginManager,
  GraphRequest,
  GraphRequestManager,
} from 'react-native-fbsdk';
import { connect } from 'react-redux';
import autobind from 'class-autobind';
import constants from '../utils/constants';
import authActions from '../actions/auth';
import styles from '../styles/facebook';
import Button from '../components/Button';

class Facebook extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    buttonText: PropTypes.string,
    style: View.propTypes.style,
  };

  constructor() {
    super();
    autobind(this);
  }

  /**
   * Collects Facebook user profile data and logs into Backbone API
   * @param {object} fbAccessToken Facebook access token
   */
  getFBUserInfo(fbAccessToken) {
    const _responseInfoCallback = (error, result) => {
      if (error) {
        Alert.alert('Please try again.');
      } else {
        // Dispatches login with Facebook user profile
        const user = Object.assign({}, result, fbAccessToken, {
          authMethod: constants.authMethods.FACEBOOK,
        });
        this.props.dispatch(authActions.login(user));
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
  }

  render() {
    return (
      <Button
        style={[styles.fbBtn, this.props.style]}
        textStyle={styles.fbBtnText}
        text={this.props.buttonText}
        fbBtn
        onPress={() =>
          LoginManager.logInWithReadPermissions(['public_profile', 'email']).then(result => {
            if (result && !result.isCancelled) {
              // After a Facebook user successfully authenticates, we use the returned Facebook
              // access token to get their profile.
              FBAccessToken.getCurrentAccessToken()
                .then((data) => {
                  if (data) {
                    this.getFBUserInfo(data);
                  }
                }
              )
              .catch(() => {
                Alert.alert('Unable to authenticate with Facebook. Try again later.');
              });
            }
          })}
      />
    );
  }
}

export default connect()(Facebook);
