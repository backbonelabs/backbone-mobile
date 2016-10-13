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

class Home extends Component {
  static propTypes = {
    auth: React.PropTypes.shape({
      accessToken: React.PropTypes.string,
      isFetchingAccessToken: React.PropTypes.bool,
    }),
    app: React.PropTypes.shape({
      bluetoothState: React.PropTypes.number,
      config: React.PropTypes.object,
    }),
    dispatch: React.PropTypes.func,
    navigator: React.PropTypes.shape({
      push: React.PropTypes.func,
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
      .then(accessToken =>
        // There is a saved access token
        // Attempt to log in using the access token
        accessToken && this.props.dispatch(authActions.login({ accessToken }))
      )
      .then(() => this.setState({ isInitializing: false }))
      .catch(() => this.setState({ isInitializing: false }));
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.auth.isFetchingAccessToken && !nextProps.auth.isFetchingAccessToken) {
      // Finished login attempt
      if (nextProps.auth.errorMessage) {
        // Access token is invalid
        // Delete from local device to prevent unnecessary API calls on subsequent app load
        SensitiveInfo.deleteItem('accessToken');
      } else {
        // Successful login, save new access token
        SensitiveInfo.setItem('accessToken', nextProps.auth.accessToken);
      }
    }
  }

  getMainBody() {
    const { accessToken } = this.props.auth;
    const { bluetoothStates } = constants;

    return (
      <Button
        onPress={
          () => this.props.navigator.push(accessToken ? routes.deviceConnect : routes.login)
        }
        disabled={accessToken && this.props.app.bluetoothState === bluetoothStates.OFF}
        text={accessToken ? 'Connect' : 'Log In'}
      />
    );
  }

  render() {
    const { accessToken, isFetchingAccessToken } = this.props.auth;

    return (
      <View style={styles.container}>
        <Image style={styles.background} source={bg} />
        <View style={styles.header}>
          <Image style={styles.logo} source={logo} />
        </View>
        <View style={styles.body}>
          {this.state.isInitializing || isFetchingAccessToken ?
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
  const { auth, app } = state;
  return { auth, app };
};

export default connect(mapStateToProps)(Home);
