import React, { Component, PropTypes } from 'react';
import { Alert } from 'react-native';
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
import styles from '../styles/auth';
import Button from '../components/Button';

class Facebook extends Component {
  static propTypes = {
    buttonText: PropTypes.string,
    dispatch: PropTypes.func,
    navigator: PropTypes.shape({
      push: PropTypes.func,
    }),
  };

  constructor() {
    super();
    autobind(this);
  }

  getFBUserInfo(fbAccessToken) {
    const _responseInfoCallback = (error, result) => {
      if (error) {
        Alert.alert('Please try again.');
      } else {
        // New user object containing request facebook graph fields and login
        // access tokens from facebook
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
        style={styles._fbBtn}
        textStyle={styles._fbBtnText}
        text={this.props.buttonText}
        fbBtn
        onPress={() =>
          LoginManager.logInWithReadPermissions(['public_profile', 'email']).then(result => {
            if (result && !result.isCancelled) {
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

const mapStateToProps = state => {
  const { auth } = state;
  return auth;
};

export default connect(mapStateToProps)(Facebook);
