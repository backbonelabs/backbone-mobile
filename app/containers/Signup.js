import React, { Component, PropTypes } from 'react';
import {
  Alert,
  View,
  Text,
  LayoutAnimation,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  KeyboardAvoidingView,
  Linking,
  TouchableOpacity,
  NativeModules,
} from 'react-native';
import autobind from 'class-autobind';
import { connect } from 'react-redux';
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
import CheckBox from '../components/checkbox';
import SecondaryText from '../components/SecondaryText';

const { heightDifference } = relativeDimensions;
const { Environment } = NativeModules;

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
      validEmail: false,
      emailPristine: true,
      passwordPristine: true,
      imageHeight: 110 * heightDifference,
      tabContainerHeight: 20 * heightDifference,
      headingFlex: 1,
      acceptedTOS: false,
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
    if (!this.props.accessToken && nextProps.accessToken) {
      this.props.navigator.resetTo(routes.onboarding);
    } else if (!this.props.errorMessage && nextProps.errorMessage) {
      Alert.alert('Error', nextProps.errorMessage);
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

  onTOSChange(event) {
    this.setState({ acceptedTOS: event.checked });
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
      imageHeight: 110 * heightDifference,
      headingFlex: 1,
      tabContainerHeight: 20 * heightDifference,
    });
  }

  signup() {
    const { email, password } = this.state;
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
      validEmail,
      emailPristine,
      passwordPristine,
      acceptedTOS,
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
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {this.props.inProgress
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
                  style={
                    [
                      { height: this.state.tabContainerHeight },
                      styles.tabsContainer,
                    ]
                  }
                >
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
                  <Button
                    style={styles._fbBtn}
                    textStyle={styles._fbBtnText}
                    text="LOG IN WITH FACEBOOK"
                    fbBtn
                    onPress={() => null}
                  />
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
                      handleRef={ref => (this.emailField = ref)}
                      value={email}
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
                      handleRef={ref => (this.passwordField = ref)}
                      value={password}
                      autoCapitalize="none"
                      placeholder="Password"
                      keyboardType="default"
                      onChangeText={this.onPasswordChange}
                      autoCorrect={false}
                      secureTextEntry
                      iconFont="MaterialIcon"
                      iconLeftName="lock"
                    />
                  </View>
                  <BodyText style={styles._warning}>
                    {passwordWarning || emailWarning}
                  </BodyText>
                  <View style={styles.legalInnerContainer}>
                    <CheckBox
                      style={styles._checkBox}
                      onCheckedChange={this.onTOSChange}
                      checked={this.state.acceptedTOS}
                    />
                    <View style={styles.textContainer}>
                      <SecondaryText>I agree to the </SecondaryText>
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
                </View>
                <View style={styles.CTAContainer}>
                  <Button
                    style={styles._CTAButton}
                    text="SIGN UP"
                    primary
                    disabled={
                        this.props.inProgress ||
                          !email ||
                          !validEmail ||
                          !password ||
                          !validPassword ||
                          !acceptedTOS
                      }
                    onPress={this.signup}
                  />
                </View>
              </View>
            </KeyboardAvoidingView>}
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
