import React, { Component, PropTypes } from 'react';
import {
  View,
  Image,
} from 'react-native';
import { connect } from 'react-redux';
import Spinner from '../components/Spinner';
import HeadingText from '../components/HeadingText';
import BodyText from '../components/BodyText';
import Button from '../components/Button';
import logo from '../images/bblogo.png';
import styles from '../styles/welcome';
import routes from '../routes';
import SensitiveInfo from '../utils/SensitiveInfo';
import authActions from '../actions/auth';
import constants from '../utils/constants';

const { storageKeys } = constants;

class Welcome extends Component {
  static propTypes = {
    user: PropTypes.object,
    dispatch: PropTypes.func,
    navigator: PropTypes.shape({
      push: PropTypes.func,
      replace: PropTypes.func,
    }),
  };

  constructor() {
    super();
    this.state = {
      isInitializing: true,
    };
    this._completeInitialization = this._completeInitialization.bind(this);
  }

  componentWillMount() {
    // This is the initialization process where we check if there
    // is a stored access token. An access token would have been saved
    // on a previously successful login.
    SensitiveInfo.getItem(storageKeys.ACCESS_TOKEN)
      .then((accessToken) => {
        if (accessToken) {
          // There is a saved access token
          // Dispatch access token to app store
          this.props.dispatch(authActions.setAccessToken(accessToken));

          // Check if there is already a user profile in the app store
          if (this.props.user._id) {
            // There is a user profile in the app store
            // Redirect user to dashboard
            this.props.navigator.replace(routes.postureDashboard);
          } else {
            // There is no user profile in the app store, so check local storage
            return SensitiveInfo.getItem(storageKeys.USER)
              .then((user) => {
                if (user) {
                  // There is a user profile in local storage
                  // Dispatch user profile to app store
                  this.props.dispatch({
                    type: 'FETCH_USER',
                    payload: user,
                  });

                  // Redirect user to dashboard
                  if (user.hasOnboarded) {
                    this.props.navigator.replace(routes.postureDashboard);
                  } else {
                    this.props.navigator.replace(routes.onboarding);
                  }
                } else {
                  this._completeInitialization();
                }
              });
          }
        } else {
          this._completeInitialization();
        }
      })
      .catch(() => {
        this._completeInitialization();
      });
  }

  _completeInitialization() {
    this.setState({ isInitializing: false });
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.body}>
          <Image source={logo} />
          <View style={styles.heading}>
            <HeadingText size={1} style={styles._text}>Welcome to Backbone</HeadingText>
          </View>
          <View style={styles.caption}>
            <BodyText style={styles._text}>
              Look & feel your strongest with Backbone
            </BodyText>
          </View>
        </View>
        <View style={styles.footer}>
          {this.state.isInitializing ? <Spinner /> : (
            <View style={styles.CTAContainer}>
              <Button
                primary
                onPress={() => this.props.navigator.push(routes.login)}
                text="Log In"
              />
              <Button
                onPress={() => this.props.navigator.push(routes.signup)}
                text="Sign Up"
              />
            </View>
          )}
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  const { user: { user } } = state;
  return { user };
};

export default connect(mapStateToProps)(Welcome);
