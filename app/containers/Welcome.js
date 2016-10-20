import React, { Component } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
} from 'react-native';
import { connect } from 'react-redux';
import Spinner from '../components/Spinner';
import HeadingText from '../components/HeadingText';
import BodyText from '../components/BodyText';
import SecondaryText from '../components/SecondaryText';
import Button from '../components/Button';
import logo from '../images/logo.png';
import styles from '../styles/welcome';
import routes from '../routes';
import SensitiveInfo from '../utils/SensitiveInfo';
import authActions from '../actions/auth';

const { PropTypes } = React;

class Welcome extends Component {
  static propTypes = {
    auth: PropTypes.shape({
      accessToken: PropTypes.string,
      inProgress: PropTypes.bool,
    }),
    app: PropTypes.shape({
      bluetoothState: PropTypes.number,
      config: PropTypes.object,
    }),
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
    if (this.props.auth.inProgress && !nextProps.auth.inProgress) {
      // Finished login attempt
      if (nextProps.auth.errorMessage) {
        // Access token is invalid
        // Delete from local device to prevent unnecessary API calls on subsequent app load
        SensitiveInfo.deleteItem('accessToken');
      } else {
        // Successful login, save new access token
        SensitiveInfo.setItem('accessToken', nextProps.auth.accessToken);

        // Navigate to Home
        this.props.navigator.replace(routes.home);
      }
    }
  }

  render() {
    const { accessToken, inProgress } = this.props.auth;

    return (
      <View style={styles.container}>
        <View style={styles.body}>
          <Image source={logo} style={styles.logo} />
          <HeadingText size={1}>Welcome to Backbone</HeadingText>
          <BodyText>Lorem ipsum dolor sit amet, consectetur adipiscing elit</BodyText>
        </View>
        <View style={styles.footer}>
          {this.state.isInitializing || inProgress ?
            <Spinner />
            : (
              <View style={styles.CTAContainer}>
                <Button
                  onPress={() => this.props.navigator.push(routes.login)}
                  text="Log In"
                />
                <Button
                  onPress={() => this.props.navigator.push(routes.signup)}
                  text="Sign Up"
                />
              </View>
            )
          }
          {this.props.app.config.DEV_MODE && accessToken &&
            <TouchableOpacity
              onPress={() => SensitiveInfo.deleteItem('accessToken')}
            >
              <SecondaryText>Delete access token</SecondaryText>
            </TouchableOpacity>
          }
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  const { auth, app } = state;
  return { auth, app };
};

export default connect(mapStateToProps)(Welcome);
