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
import logo from '../images/bblogo.png';
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
      );
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
    return (
      <View style={styles.container}>
        <View style={styles.body}>
          <Image source={logo} />
          <View style={styles.heading}>
            <HeadingText size={1} style={styles._text}>Welcome to Backbone</HeadingText>
          </View>
          <View style={styles.caption}>
            <BodyText style={styles._text}>
              Feel and look your strongest with better posture
            </BodyText>
          </View>
        </View>
        <View style={styles.footer}>
          {this.props.auth.inProgress ? <Spinner /> : (
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
          {this.props.app.config.DEV_MODE &&
            <View style={{ marginTop: 5 }}>
              <TouchableOpacity
                onPress={() => SensitiveInfo.deleteItem('accessToken')}
              >
                <SecondaryText>Delete access token</SecondaryText>
              </TouchableOpacity>
            </View>
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
