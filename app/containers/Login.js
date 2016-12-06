import React, { Component, PropTypes } from 'react';
import {
  Alert,
  View,
  Image,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import autobind from 'autobind-decorator';
import { connect } from 'react-redux';
import Spinner from '../components/Spinner';
import Input from '../components/Input';
import SensitiveInfo from '../utils/SensitiveInfo';
import authActions from '../actions/auth';
import styles from '../styles/auth';
import routes from '../routes';
import Button from '../components/Button';
import SecondaryText from '../components/SecondaryText';
import BackBoneLogo from '../images/bblogo.png';
import HeadingText from '../components/HeadingText';
import constants from '../utils/constants';

const { storageKeys } = constants;

class Login extends Component {
  static propTypes = {
    auth: PropTypes.shape({
      accessToken: PropTypes.string,
      errorMessage: PropTypes.string,
      inProgress: PropTypes.bool,
    }),
    user: PropTypes.shape({
      hasOnboarded: PropTypes.bool,
    }),
    dispatch: PropTypes.func,
    navigator: PropTypes.object,
  };

  constructor() {
    super();
    this.state = {
      email: '',
      password: '',
    };
    this.autoFocus = true;
  }

  componentDidMount() {
    this.autoFocus = false;
  }

  componentWillReceiveProps(nextProps) {
    const newAccessToken = nextProps.auth.accessToken;
    if (newAccessToken && this.props.auth.accessToken !== newAccessToken) {
      // User successfully authenticated, save access token to local device
      SensitiveInfo.setItem(storageKeys.ACCESS_TOKEN, newAccessToken);
      SensitiveInfo.setItem(storageKeys.USER, nextProps.user);

      // User has already gone through onboarding
      if (nextProps.user.hasOnboarded) {
        this.props.navigator.replace(routes.deviceConnect);
      } else {
        // User hasn't completed onboarding process
        this.props.navigator.replace(routes.onboarding);
      }
    } else if (!this.props.auth.errorMessage && nextProps.auth.errorMessage) {
      // Authentication error
      Alert.alert('Authentication Error', nextProps.auth.errorMessage);
    }
  }

  @autobind
  login() {
    if (!this.state.email || !this.state.password) {
      // Show alert if email or password is missing
      Alert.alert('Missing fields', `${this.state.email ? 'Password' : 'Email'} is required`);
    } else {
      const { email, password } = this.state;
      this.props.dispatch(authActions.login({ email, password }));
    }
  }

  render() {
    const { inProgress } = this.props.auth;
    const autoFocusProp = this.autoFocus ? { autoFocus: true } : {};
    // The main View is composed in the TouchableWithoutFeedback to allow
    // the keyboard to be closed when tapping outside of an input field
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles._container}>
          {inProgress ?
            <Spinner />
            :
              <KeyboardAvoidingView behavior="padding">
                <View style={styles.innerContainer}>
                  <Image source={BackBoneLogo} style={styles.backboneLogo} />
                  <HeadingText size={2} style={styles._headingText}>Welcome back!</HeadingText>
                  <View style={styles.formContainer}>
                    <View style={styles.inputFieldContainer}>
                      <Input
                        style={styles._inputField}
                        handleRef={ref => (
                          this.emailField = ref
                        )}
                        value={this.state.email}
                        autoCapitalize="none"
                        placeholder="Email"
                        keyboardType="email-address"
                        onChangeText={text => this.setState({ email: text })}
                        onSubmitEditing={() => this.passwordField.focus()}
                        autoCorrect={false}
                        {...autoFocusProp}
                        returnKeyType="next"
                      />
                    </View>
                    <View style={styles.inputFieldContainer}>
                      <Input
                        style={styles._inputField}
                        handleRef={ref => (
                          this.passwordField = ref
                        )}
                        value={this.state.password}
                        autoCapitalize="none"
                        placeholder="Password"
                        keyboardType="default"
                        onChangeText={text => this.setState({ password: text })}
                        onSubmitEditing={this.login}
                        autoCorrect={false}
                        secureTextEntry
                        returnKeyType="go"
                      />
                    </View>
                    <View style={styles.CTAContainer}>
                      <Button
                        style={styles._CTAButton}
                        text="LOGIN"
                        primary
                        disabled={inProgress}
                        onPress={this.login}
                      />
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => this.props.navigator.push(routes.reset)}
                    activeOpacity={0.4}
                  >
                    <SecondaryText style={styles._forgotPassword}>
                      Forgot your password?
                    </SecondaryText>
                  </TouchableOpacity>
                </View>
              </KeyboardAvoidingView>
          }
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

const mapStateToProps = (state) => {
  const { auth, user: { user } } = state;
  return { auth, user };
};

export default connect(mapStateToProps)(Login);
