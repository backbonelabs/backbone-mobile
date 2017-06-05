import React, { Component, PropTypes } from 'react';
import {
  Alert,
  LayoutAnimation,
  View,
  Image,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Keyboard,
  Text,
  KeyboardAvoidingView,
} from 'react-native';
import autobind from 'class-autobind';
import { connect } from 'react-redux';
import constants from '../utils/constants';
import Spinner from '../components/Spinner';
import Input from '../components/Input';
import authActions from '../actions/auth';
import styles from '../styles/auth';
import routes from '../routes';
import Button from '../components/Button';
import SecondaryText from '../components/SecondaryText';
import BackBoneLogo from '../images/logo.png';
import BodyText from '../components/BodyText';
import relativeDimensions from '../utils/relativeDimensions';

const { heightDifference } = relativeDimensions;

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
    navigator: PropTypes.shape({
      resetTo: PropTypes.func,
      push: PropTypes.func,
    }),
  };

  constructor() {
    super();
    autobind(this);
    this.state = {
      email: '',
      password: '',
      validEmail: false,
      emailPristine: true,
      passwordPristine: true,
      imageHeight: 85 * heightDifference,
      tabContainerHeight: 20 * heightDifference,
      headingFlex: 1,
    };
  }

  componentWillMount() {
    this.keyboardDidShowListener = Keyboard.addListener(
      'keyboardWillShow',
      this.keyboardDidShow
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardWillHide',
      this.keyboardDidHide
    );
  }

  componentWillReceiveProps(nextProps) {
    const newAccessToken = nextProps.auth.accessToken;
    if (newAccessToken && this.props.auth.accessToken !== newAccessToken) {
      // User has already gone through onboarding
      if (nextProps.user.hasOnboarded) {
        this.props.navigator.resetTo(routes.deviceConnect);
      } else {
        // User hasn't completed onboarding process
        this.props.navigator.resetTo(routes.onboarding);
      }
    } else if (!this.props.auth.errorMessage && nextProps.auth.errorMessage) {
      // Authentication error
      Alert.alert('Authentication Error', nextProps.auth.errorMessage);
    }
  }

  componentWillUnmount() {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

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

  onPasswordChange(password) {
    if (this.state.passwordPristine) {
      return this.setState({ passwordPristine: false, password });
    }

    return this.setState({ password });
  }

  goToSignup() {
    this.setState({
      email: '',
      password: '',
      authError: '',
      validEmail: false,
      emailPristine: true,
      passwordPristine: true,
    });
    this.props.navigator.push(routes.signup);
  }

  keyboardDidShow() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    // apply styles when keyboard is open
    this.setState({
      imageHeight: 0,
      headingFlex: 0,
      tabContainerHeight: 65 * heightDifference,
    });
  }

  keyboardDidHide() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    this.setState({
      imageHeight: 85 * heightDifference,
      headingFlex: 1,
      tabContainerHeight: 20 * heightDifference,
    });
  }

  login() {
    const { email, password } = this.state;
    this.props.dispatch(authActions.login({ email, password }));
  }

  render() {
    const { inProgress } = this.props.auth;
    const {
      email,
      password,
      validEmail,
      emailPristine,
      passwordPristine,
    } = this.state;
    const validPassword = password.length >= 8;
    let passwordWarning;
    let emailWarning;
    if (!emailPristine) {
      emailWarning = validEmail ? '' : 'Invalid Email';
    }
    if (!passwordPristine) {
      passwordWarning = validPassword
        ? ''
        : 'Password must be at least 8 characters';
    }
    // The main View is composed in the TouchableWithoutFeedback to allow
    // the keyboard to be closed when tapping outside of an input field
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles._container}>
          {inProgress
            ? <Spinner />
            : <KeyboardAvoidingView behavior="padding">
              <View
                style={[{ flex: this.state.headingFlex }, styles.heading]}
              >
                <View style={styles.logoContainer}>
                  <Image
                    source={BackBoneLogo}
                    style={[
                      {
                        height: this.state.imageHeight,
                      },
                      styles.backboneLogo,
                    ]}
                  />
                </View>
                <View
                  style={[
                      { height: this.state.tabContainerHeight },
                    styles.tabsContainer,
                  ]}
                >
                  <TouchableOpacity style={[styles.currentTab, styles.tab]}>
                    <BodyText style={styles._currentTabText}>
                        Sign In
                    </BodyText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.tab}
                    onPress={this.goToSignup}
                  >
                    <BodyText>Sign Up</BodyText>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.formContainer}>
                <View style={styles.inputsContainer}>
                  <View style={styles.fbBtnContainer}>
                    <Button
                      style={styles._fbBtn}
                      textStyle={styles._fbBtnText}
                      text="SIGN UP WITH FACEBOOK"
                      fbBtn
                      onPress={() => null}
                    />
                  </View>
                  <View style={styles.breakContainer}>
                    <View style={styles.leftSideBreak} />
                    <Text style={styles.textBreak}>OR</Text>
                    <View style={styles.rightSideBreak} />
                  </View>
                  <View style={styles.inputFieldContainer}>
                    <Input
                      style={{
                        color: emailWarning ? '#E53935' : '#231F20',
                        ...styles._inputField,
                      }}
                      iconStyle={{
                        color: emailWarning ? '#E53935' : '#9E9E9E',
                      }}
                      handleRef={ref => this.emailField = ref}
                      value={this.state.email}
                      autoCapitalize="none"
                      placeholder="Email"
                      keyboardType="email-address"
                      onChangeText={this.onEmailChange}
                      onSubmitEditing={() => this.passwordField.focus()}
                      autoCorrect={false}
                      returnKeyType="next"
                      iconFont="MaterialIcon"
                      iconLeftName="email"
                    />
                  </View>
                  <View style={styles.inputFieldContainer}>
                    <Input
                      style={{
                        color: passwordWarning ? '#E53935' : '#231F20',
                        ...styles._inputField,
                      }}
                      iconStyle={{
                        color: passwordWarning ? '#E53935' : '#9E9E9E',
                      }}
                      handleRef={ref => this.passwordField = ref}
                      value={this.state.password}
                      autoCapitalize="none"
                      placeholder="Password"
                      keyboardType="default"
                      onChangeText={this.onPasswordChange}
                      onSubmitEditing={
                          !email || !validEmail || (!password || !validPassword)
                            ? null
                            : this.login
                        }
                      autoCorrect={false}
                      secureTextEntry
                      iconFont="MaterialIcon"
                      iconLeftName="lock"
                      returnKeyType="go"
                    />
                  </View>
                  <BodyText style={styles._warning}>
                    {passwordWarning || emailWarning}
                  </BodyText>
                  <TouchableOpacity
                    onPress={() => this.props.navigator.push(routes.reset)}
                    activeOpacity={0.4}
                  >
                    <SecondaryText style={styles._forgotPassword}>
                        Forgot your password?
                    </SecondaryText>
                  </TouchableOpacity>
                </View>
                <View style={styles.CTAContainer}>
                  <Button
                    style={styles._CTAButton}
                    text="SIGN IN"
                    primary
                    disabled={
                        inProgress ||
                          (!email ||
                            !validEmail ||
                            (!password || !validPassword))
                      }
                    onPress={this.login}
                  />
                </View>
              </View>
            </KeyboardAvoidingView>}
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

const mapStateToProps = state => {
  const { auth, user: { user } } = state;
  return { auth, user };
};

export default connect(mapStateToProps)(Login);
