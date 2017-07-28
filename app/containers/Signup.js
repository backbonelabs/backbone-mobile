import React, { Component, PropTypes } from 'react';
import {
  Alert,
  View,
  Text,
  LayoutAnimation,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  Platform,
  Linking,
  TouchableOpacity,
  NativeModules,
  StatusBar,
} from 'react-native';
import autobind from 'class-autobind';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Input from '../components/Input';
import Spinner from '../components/Spinner';
import authActions from '../actions/auth';
import styles from '../styles/auth';
import routes from '../routes';
import Button from '../components/Button';
import constants from '../utils/constants';
import BackBoneLogo from '../images/logo.png';
import BodyText from '../components/BodyText';
import relativeDimensions from '../utils/relativeDimensions';
import SecondaryText from '../components/SecondaryText';
import theme from '../styles/theme';

const { applyWidthDifference, height } = relativeDimensions;
// Android statusbar height
const statusBarHeightDroid = StatusBar.currentHeight;
const { Environment } = NativeModules;
const isiOS = Platform.OS === 'ios';

class Signup extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    navigator: PropTypes.shape({
      pop: PropTypes.func,
      replace: PropTypes.func,
      resetTo: PropTypes.func,
    }),
    accessToken: PropTypes.string,
    errorMessage: PropTypes.string,
    inProgress: PropTypes.bool,
  };

  constructor() {
    super();
    autobind(this);
    this.state = {
      email: '',
      password: '',
      emailWarning: false,
      passwordWarning: false,
      errorMessage: '',
      imageHeight: applyWidthDifference(110),
      headingFlex: 1,
      containerHeight: 0,
      hideContent: false,
    };
  }

  componentWillMount() {
    const kbShow = isiOS ? 'keyboardWillShow' : 'keyboardDidShow';
    const kbHide = isiOS ? 'keyboardWillHide' : 'keyboardDidHide';

    this.keyboardWillShowListener = Keyboard.addListener(
      kbShow,
      this.keyboardDidShow
    );
    this.keyboardWillHideListener = Keyboard.addListener(
      kbHide,
      this.keyboardDidHide
    );
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.accessToken && nextProps.accessToken) {
      this.props.navigator.resetTo(routes.profileSetupOne);
    } else if (!this.props.errorMessage && nextProps.errorMessage) {
      // Handles error messages returned from API server
      if (nextProps.errorMessage === 'Email is not available') {
        this.setState({ emailWarning: true, errorMessage: nextProps.errorMessage.toUpperCase() });
      // Handles error relating to network issues
      } else if (nextProps.errorMessage === constants.errorMessages.NETWORK_ERROR) {
        this.setState({ errorMessage: nextProps.errorMessage });
      }
      // For Facebook signup error messages
      // Alert.alert('Error', nextProps.auth.errorMessage);
    }
  }

  componentWillUnmount() {
    if (this.keyboardWillShowListener) {
      this.keyboardWillShowListener.remove();
    }
    if (this.keyboardWillHideListener) {
      this.keyboardWillHideListener.remove();
    }
  }

  onEmailChange(email) {
    this.setState({ email });
  }

  onPasswordChange(password) {
    return this.setState({ password });
  }

  keyboardDidShow(e) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    // apply styles when keyboard is open
    this.setState({
      imageHeight: 0,
      headingFlex: 0,
      containerHeight: e.endCoordinates.height,
      hideContent: true,
    });
  }

  keyboardDidHide() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    this.setState({
      imageHeight: applyWidthDifference(110),
      headingFlex: 1,
      containerHeight: 0,
      hideContent: false,
    });
  }

  signup() {
    const { email, password } = this.state;
    const validPassword = password.length >= 8;
    const validEmail = constants.emailRegex.test(email);

    if (!validEmail) {
      this.emailField.focus();
      return this.setState({
        emailWarning: true,
        passwordWarning: false,
        errorMessage: 'INVALID EMAIL',
      });
    } else if (!validPassword) {
      this.passwordField.focus();
      return this.setState({
        passwordWarning: true,
        emailWarning: false,
        errorMessage: 'PASSWORD MUST BE AT LEAST 8 CHARACTERS',
      });
    }
    this.setState({ emailWarning: false, passwordWarning: false });
    this.props.dispatch(authActions.signup({ email, password }));
  }

  openTOS() {
    const url = `${Environment.WEB_SERVER_URL}/legal/terms`;
    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          return Linking.openURL(url);
        }
        throw new Error();
      })
      .catch(() => {
        // This catch handler will handle rejections from Linking.openURL as well
        // as when the user's phone doesn't have any apps to open the URL
        Alert.alert(
          'Terms of Service',
          'We could not launch your browser. You can read the Terms of Service ' + // eslint-disable-line prefer-template, max-len
          'by visiting ' + url + '.',
        );
      });
  }

  openPrivacyPolicy() {
    const url = `${Environment.WEB_SERVER_URL}/legal/privacy`;
    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          return Linking.openURL(url);
        }
        throw new Error();
      })
      .catch(() => {
        // This catch handler will handle rejections from Linking.openURL as well
        // as when the user's phone doesn't have any apps to open the URL
        Alert.alert(
          'Privacy Policy',
          'We could not launch your browser. You can read the Privacy Policy ' + // eslint-disable-line prefer-template, max-len
          'by visiting ' + url + '.',
        );
      });
  }

  render() {
    const {
      email,
      password,
      emailWarning,
      passwordWarning,
      containerHeight,
      hideContent,
      errorMessage,
    } = this.state;
    let newHeight = height - containerHeight - theme.statusBarHeight;

    if (!isiOS) {
      newHeight -= statusBarHeightDroid;
    }
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles._container, { height: newHeight }]}>
          {this.props.inProgress
            ? <Spinner />
            : <View>
              <View
                style={[styles.heading, { flex: this.state.headingFlex }]}
              >
                <View style={styles.logoContainer}>
                  <Image
                    source={BackBoneLogo}
                    style={[
                      styles.backboneLogo,
                      {
                        height: this.state.imageHeight,
                      },
                    ]}
                  />
                </View>
                <View style={styles.tabsContainer}>
                  <TouchableOpacity
                    style={styles.tab}
                    onPress={() => this.props.navigator.pop()}
                  >
                    <BodyText>Log In</BodyText>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.currentTab, styles.tab]}>
                    <BodyText style={styles._currentTabText}>
                        Sign Up
                    </BodyText>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.formContainer}>
                <View style={styles.inputsContainer}>
                  {
                    hideContent ? null :
                      <View>
                        <Button
                          style={styles._fbBtn}
                          textStyle={styles._fbBtnText}
                          text="SIGN UP WITH FACEBOOK"
                          fbBtn
                          onPress={() => null}
                        />
                        <View style={styles.breakContainer}>
                          <View style={styles.breakLine} />
                          <Text style={styles.textBreak}>OR</Text>
                          <View style={styles.breakLine} />
                        </View>
                      </View>
                  }
                  <Input
                    containerStyles={styles._inputFieldContainer}
                    style={{ color: emailWarning ? '#F44336' : '#231F20' }}
                    iconStyle={{
                      color: emailWarning ? '#F44336' : '#9E9E9E',
                    }}
                    handleRef={ref => (this.emailField = ref)}
                    value={email}
                    autoFocus={emailWarning}
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
                  <Input
                    containerStyles={styles._inputFieldContainer}
                    style={{ color: passwordWarning ? '#F44336' : '#231F20' }}
                    iconStyle={{ color: passwordWarning ? '#F44336' : '#9E9E9E' }}
                    handleRef={ref => (this.passwordField = ref)}
                    value={password}
                    autoFocus={passwordWarning}
                    autoCapitalize="none"
                    placeholder="Password"
                    keyboardType="default"
                    onChangeText={this.onPasswordChange}
                    autoCorrect={false}
                    secureTextEntry
                    iconFont="MaterialIcon"
                    iconLeftName="lock"
                  />
                  {
                    errorMessage ?
                      <View style={styles.warningContainer}>
                        <Icon
                          name={'warning'}
                          color={'#F44336'}
                          size={20}
                        />
                        <BodyText style={styles._warning}>
                          {errorMessage}
                        </BodyText>
                      </View>
                      : null
                    }
                  <View style={styles.legalContainer}>
                    <SecondaryText>
                      By signing up, you agree to our
                    </SecondaryText>
                    <TouchableOpacity
                      onPress={this.openTOS}
                      activeOpacity={0.4}
                    >
                      <SecondaryText style={styles._legalLink}>
                          Terms of Service
                      </SecondaryText>
                    </TouchableOpacity>
                    <SecondaryText> and </SecondaryText>
                    <TouchableOpacity
                      onPress={this.openPrivacyPolicy}
                      activeOpacity={0.4}
                      style={styles.priv}
                    >
                      <SecondaryText style={styles._legalLink}>
                          Privacy Policy
                      </SecondaryText>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.CTAContainer}>
                  <Button
                    style={styles._CTAButton}
                    text="SIGN UP"
                    primary
                    disabled={!email || !password}
                    onPress={this.signup}
                  />
                </View>
              </View>
            </View>}
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

const mapStateToProps = (state) => {
  const { auth } = state;
  return auth;
};

export default connect(mapStateToProps)(Signup);
