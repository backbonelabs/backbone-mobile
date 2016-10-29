import React, { Component } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
} from 'react-native';
import { connect } from 'react-redux';
import Spinner from '../components/Spinner';
import SecondaryText from '../components/SecondaryText';
import Button from '../components/Button';
import logo from '../images/logo.png';
import bg from '../images/bg.jpg';
import styles from '../styles/home';
import routes from '../routes';
import SensitiveInfo from '../utils/SensitiveInfo';
import authActions from '../actions/auth';
import constants from '../utils/constants';

const { PropTypes } = React;

class Home extends Component {
  static propTypes = {
    auth: PropTypes.shape({
      accessToken: PropTypes.string,
    }),
    app: PropTypes.shape({
      bluetoothState: PropTypes.number,
      config: PropTypes.object,
    }),
    user: PropTypes.object,
    dispatch: PropTypes.func,
    navigator: PropTypes.shape({
      push: PropTypes.func,
    }),
  };

  constructor() {
    super();
    this.state = {
      isInitializing: true,
    };
  }

  componentWillMount() {
    // This is the initialization process where we check if there
    // is a stored access token. An access token would have been saved
    // on a previously successful login.
    SensitiveInfo.getItem('accessToken')
      .then((accessToken) => {
        if (accessToken) {
          // There is a saved access token
          // Dispatch access token to app store
          this.props.dispatch(authActions.setAccessToken(accessToken));

          // Check if there is already a user profile in the app store
          if (!this.props.user) {
            // There is no user profile in the app store, so check local storage
            return SensitiveInfo.getItem(constants.userStorageKey)
              .then((user) => {
                if (user) {
                  // There is a user profile in local storage
                  // Dispatch user profile to app store
                  this.props.dispatch({
                    type: 'FETCH_USER',
                    payload: user,
                  });

                  // Redirect user to dashboard
                  this.props.navigator.push(routes.postureDashboard);
                }
                this.setState({ isInitializing: false });
              });
          }
        }
        this.setState({ isInitializing: false });
      })
      .catch(() => {
        this.setState({ isInitializing: false });
      });
  }

  getMainBody() {
    const hasValidData = this.props.auth.accessToken && this.props.user;
    const { bluetoothStates } = constants;

    return (
      <Button
        onPress={
          () => this.props.navigator.push(hasValidData ? routes.deviceConnect : routes.login)
        }
        primary
        disabled={hasValidData && this.props.app.bluetoothState === bluetoothStates.OFF}
        text={hasValidData ? 'Connect' : 'Log In'}
      />
    );
  }

  render() {
    const { accessToken } = this.props.auth;
    return (
      <View style={styles.container}>
        <Image style={styles.background} source={bg} />
        <View style={styles.header}>
          <Image style={styles.logo} source={logo} />
        </View>
        <View style={styles.body}>
          {this.state.isInitializing ?
            <Spinner /> : this.getMainBody()
          }
        </View>
        <TouchableOpacity
          style={styles.footer}
          onPress={() => (
            this.props.app.config.DEV_MODE && accessToken ?
              SensitiveInfo.deleteItem('accessToken') : this.props.navigator.push(routes.signup)
          )}
        >
          <SecondaryText style={styles._footerText}>
            {this.props.app.config.DEV_MODE && accessToken ?
              'Delete access token' : 'Don\'t have an account? Sign up'}
          </SecondaryText>
        </TouchableOpacity>
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  const { auth, app, user: userReducer } = state;
  const { user } = userReducer;
  return { auth, app, user };
};

export default connect(mapStateToProps)(Home);
