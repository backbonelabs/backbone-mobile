import React, { Component, PropTypes } from 'react';
import {
  LayoutAnimation,
  View,
  Image,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Keyboard,
  Text,
  Platform,
  StatusBar,
} from 'react-native';
import {
  LoginManager,
} from 'react-native-fbsdk';
import autobind from 'class-autobind';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
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
import theme from '../styles/theme';
import Facebook from '../containers/Facebook';

const { applyWidthDifference, height } = relativeDimensions;
// Android statusbar height
const statusBarHeightDroid = StatusBar.currentHeight;
const isiOS = Platform.OS === 'ios';

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
      authError: false,
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
      // Logs out the user of Facebook and returns to welcome screen
      LoginManager.logOut();
      // Authentication error
      this.setState({ authError: true });
      // Alert.alert('Authentication Error', nextProps.auth.errorMessage);
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

  goToSignup() {
    this.setState({
      email: '',
      password: '',
      authError: null,
    });
    this.props.navigator.push(routes.signup);
    if (!isiOS) { Keyboard.dismiss(); }
  }

  goToReset() {
    this.setState({
      email: '',
      password: '',
      authError: null,
    });
    this.props.navigator.push(routes.reset);
    if (!isiOS) { Keyboard.dismiss(); }
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
    // apply styles when keyboard is close
    this.setState({
      imageHeight: applyWidthDifference(110),
      headingFlex: 1,
      containerHeight: 0,
      hideContent: false,
    });
  }

  login() {
    const { email, password, authError } = this.state;
    if (authError) {
      this.setState({ authError: false });
    }
    this.props.dispatch(authActions.login({ email, password }));
  }

  render() {
    const { inProgress } = this.props.auth;
    const { email, password, authError, containerHeight, hideContent } = this.state;
    let newHeight = height - containerHeight - theme.statusBarHeight;

    if (!isiOS) {
      newHeight -= statusBarHeightDroid;
    }
    // The main View is composed in the TouchableWithoutFeedback to allow
    // the keyboard to be closed when tapping outside of an input field
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles._container, { height: newHeight }]}>
          {inProgress
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
                  <TouchableOpacity style={[styles.currentTab, styles.tab]}>
                    <BodyText style={styles._currentTabText}>
                        Log In
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
                  {
                    hideContent ? null :
                      <View>
                        <Facebook
                          buttonText="LOG IN WITH FACEBOOK"
                          style={styles._inputField}
                        />
                        <View style={styles.breakContainer}>
                          <View style={styles.breakLine} />
                          <Text style={styles.textBreak}>OR</Text>
                          <View style={styles.breakLine} />
                        </View>
                      </View>
                  }
                  <View style={styles.inputFieldContainer}>
                    <Input
                      style={{
                        ...styles._inputField,
                        color: authError ? '#F44336' : '#231F20',
                      }}
                      iconStyle={{
                        color: authError ? '#F44336' : '#9E9E9E',
                      }}
                      handleRef={ref => (this.emailField = ref)}
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
                        ...styles._inputField,
                        color: authError ? '#F44336' : '#231F20',
                      }}
                      iconStyle={{
                        color: authError ? '#F44336' : '#9E9E9E',
                      }}
                      handleRef={ref => (this.passwordField = ref)}
                      value={this.state.password}
                      autoCapitalize="none"
                      placeholder="Password"
                      keyboardType="default"
                      onChangeText={this.onPasswordChange}
                      onSubmitEditing={
                          !email || !password
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
                  {
                    authError ?
                      <View style={styles.warningContainer}>
                        <Icon
                          name={'warning'}
                          color={'#F44336'}
                          size={20}
                        />
                        <BodyText style={styles._warning}>
                          INCORRECT EMAIL OR PASSWORD
                        </BodyText>
                      </View>
                      : null
                    }
                  <TouchableOpacity
                    onPress={this.goToReset}
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
                    text="LOG IN"
                    primary
                    disabled={inProgress || (!email || !password)}
                    onPress={this.login}
                  />
                </View>
              </View>
            </View>}
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
