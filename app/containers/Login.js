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
import constants from '../utils/constants';
import Spinner from '../components/Spinner';
import Input from '../components/Input';
import authActions from '../actions/auth';
import styles from '../styles/auth';
import routes from '../routes';
import Button from '../components/Button';
import SecondaryText from '../components/SecondaryText';
import BackBoneLogo from '../images/bblogo.png';
import HeadingText from '../components/HeadingText';
import BodyText from '../components/BodyText';

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
      validEmail: false,
      emailPristine: true,
      passwordPristine: true,
    };
    this.autoFocus = true;
  }

  componentDidMount() {
    this.autoFocus = false;
  }

  componentWillReceiveProps(nextProps) {
    const newAccessToken = nextProps.auth.accessToken;
    if (newAccessToken && this.props.auth.accessToken !== newAccessToken) {
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
  onEmailChange(email) {
    const stateChanges = {
      validEmail: constants.emailRegex.test(email),
      email,
    };

    if (this.state.emailPristine) {
      stateChanges.emailPristine = false;
    }

    this.setState(stateChanges);
  }

  @autobind
  onPasswordChange(password) {
    if (this.state.passwordPristine) {
      return this.setState({ passwordPristine: false, password });
    }

    return this.setState({ password });
  }

  @autobind
  login() {
    const { email, password } = this.state;
    this.props.dispatch(authActions.login({ email, password }));
  }

  render() {
    const { inProgress } = this.props.auth;
    const autoFocusProp = this.autoFocus ? { autoFocus: true } : {};
    const { email, password, validEmail, emailPristine, passwordPristine } = this.state;
    const validPassword = password.length >= 8;
    let passwordWarning;
    const emailIconProps = {};
    const passwordIconProps = {};
    if (!emailPristine) {
      emailIconProps.iconRightName = validEmail ? 'check' : 'close';
    }
    if (!passwordPristine) {
      passwordIconProps.iconRightName = validPassword ? 'check' : 'close';
      passwordWarning = validPassword ? '' : 'Password must be at least 8 characters';
    }
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
                        onChangeText={this.onEmailChange}
                        onSubmitEditing={() => this.passwordField.focus()}
                        autoCorrect={false}
                        returnKeyType="next"
                        {...autoFocusProp}
                        {...emailIconProps}
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
                        onChangeText={this.onPasswordChange}
                        onSubmitEditing={
                          ((!email || !validEmail) || (!password || !validPassword)) ?
                          null
                          :
                            this.login
                        }
                        autoCorrect={false}
                        secureTextEntry
                        returnKeyType="go"
                        {...passwordIconProps}
                      />
                    </View>
                    <BodyText style={styles._warning}>
                      {passwordWarning}
                    </BodyText>
                    <View style={styles.CTAContainer}>
                      <Button
                        style={styles._CTAButton}
                        text="LOGIN"
                        primary
                        disabled={
                          inProgress ||
                          ((!email || !validEmail) ||
                          (!password || !validPassword))
                        }
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
