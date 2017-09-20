import React, { PropTypes } from 'react';
import { View } from 'react-native';
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
import appActions from '../actions/app';
import styles from '../styles/facebook';
import theme from '../styles/theme';
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
                  this.props.dispatch(appActions.showPartialModal({
                    title: {
                      caption: 'Error',
                      color: theme.warningColor,
                    },
                    detail: {
                      caption: 'Please try again.',
                    },
                    buttons: [
                      {
                        caption: 'OK',
                        onPress: () => {
                          this.props.dispatch(appActions.hidePartialModal());
                        },
                      },
                    ],
                    backButtonHandler: () => {
                      this.props.dispatch(appActions.hidePartialModal());
                    },
                  }));
                } else if (Object.keys(props.user).length !== 0) {
                  // Handles Facebook logins from the Profile route. The user's
                  // email must be confirmed before Facebook integration is allowed.
                  props.dispatch(userActions.updateUser({
                    _id: props.user.user._id,
                    facebookAccessToken: data.accessToken,
                    facebookAppId: data.applicationID,
                    facebookId: data.userID,
                    facebookEmail: graphResults.email,
                    facebookVerified: graphResults.verified,
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
          this.props.dispatch(appActions.showPartialModal({
            title: {
              caption: 'Error',
              color: theme.warningColor,
            },
            detail: {
              caption: 'Unable to authenticate with Facebook. Try again later.',
            },
            buttons: [
              {
                caption: 'OK',
                onPress: () => {
                  this.props.dispatch(appActions.hidePartialModal());
                },
              },
            ],
            backButtonHandler: () => {
              this.props.dispatch(appActions.hidePartialModal());
            },
          }));
        });
    }
  });
};

const mapStateToProps = (state) => {
  const { user } = state;
  return user;
};

export default connect(mapStateToProps)(Facebook);
