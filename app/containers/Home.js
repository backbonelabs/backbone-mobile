import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';
import { connect } from 'react-redux';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import logo from '../images/logo.png';
import bg from '../images/bg.jpg';
import styles from '../styles/home';
import routes from '../routes';
import SensitiveInfo from '../utils/SensitiveInfo';
import authActions from '../actions/auth';

class Home extends Component {
  static propTypes = {
    accessToken: React.PropTypes.string,
    isFetchingAccessToken: React.PropTypes.bool,
    dispatch: React.PropTypes.func,
    navigator: React.PropTypes.object,
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
      .then(() => {
        this.setState({ isInitializing: false });
      })
      .catch(() => {
        this.setState({ isInitializing: false });
      });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.isFetchingAccessToken && !nextProps.isFetchingAccessToken) {
      // Finished login attempt
      if (nextProps.errorMessage) {
        // Access token is invalid
        // Delete from local device to prevent unnecessary API calls on subsequent app load
        SensitiveInfo.deleteItem('accessToken');
      } else {
        // Successful login, save new access token
        SensitiveInfo.setItem('accessToken', nextProps.accessToken);
      }
    }
  }

  getMainBody() {
    const { accessToken } = this.props;

    return (
      <Button
        onPress={
          () => this.props.navigator.push(accessToken ? routes.device.deviceConnect : routes.login)
        }
        text={accessToken ? 'Connect' : 'Log In'}
      />
    );
  }

  render() {
    const { accessToken } = this.props;

    return (
      <View style={styles.container}>
        <Image style={styles.background} source={bg} />
        <View style={styles.header}>
          <Image style={styles.logo} source={logo} />
        </View>
        <View style={styles.body}>
          {this.state.isInitializing || this.props.isFetchingAccessToken ?
            <Spinner /> : this.getMainBody()
          }
        </View>
        <TouchableOpacity
          style={styles.footer}
          onPress={accessToken ?
            SensitiveInfo.deleteItem('accessToken') : () => this.props.navigator.push(routes.signup)
          }
        >
          <Text style={styles.footerText}>
            {accessToken ? 'Delete access token' : 'Don\'t have an account? Sign up'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const mapStateToProps = state => {
  const { auth } = state;
  return auth;
};

export default connect(mapStateToProps)(Home);
