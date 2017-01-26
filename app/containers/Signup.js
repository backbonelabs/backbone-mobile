import React, { Component, PropTypes } from 'react';
import {
  Alert,
  View,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  KeyboardAvoidingView,
  Linking,
  TouchableOpacity,
  NativeModules,
} from 'react-native';
import autobind from 'autobind-decorator';
import { connect } from 'react-redux';
import Input from '../components/Input';
import Spinner from '../components/Spinner';
import authActions from '../actions/auth';
import styles from '../styles/auth';
import routes from '../routes';
import Button from '../components/Button';
import SecondaryText from '../components/SecondaryText';
import constants from '../utils/constants';
import BackBoneLogo from '../images/logo.png';
import BodyText from '../components/BodyText';

const { Environment } = NativeModules;

class Signup extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    navigator: PropTypes.shape({
      pop: PropTypes.func,
      replace: PropTypes.func,
    }),
    accessToken: PropTypes.string,
    errorMessage: PropTypes.string,
    inProgress: PropTypes.bool,
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
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.accessToken && nextProps.accessToken) {
      this.props.navigator.replace(routes.onboarding);
    } else if (!this.props.errorMessage && nextProps.errorMessage) {
      Alert.alert('Error', nextProps.errorMessage);
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
  signup() {
    const { email, password } = this.state;
    this.props.dispatch(authActions.signup({ email, password }));
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
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {this.props.inProgress ?
            <Spinner />
            :
              <KeyboardAvoidingView behavior="padding">
                <View style={styles.innerContainer}>
                  <Image source={BackBoneLogo} style={styles.backboneLogo} />
                  <BodyText style={styles._headingText}>
                    Look and feel stronger with Backbone
                  </BodyText>
                  <View style={styles.formContainer}>
                    <View style={styles.inputFieldContainer}>
                      <Input
                        style={styles._inputField}
                        handleRef={ref => (
                          this.emailField = ref
                        )}
                        value={email}
                        autoCapitalize="none"
                        placeholder="Email"
                        keyboardType="email-address"
                        onChangeText={this.onEmailChange}
                        onSubmitEditing={() => this.passwordField.focus()}
                        autoCorrect={false}
                        autoFocus
                        returnKeyType="next"
                        {...emailIconProps}
                      />
                    </View>
                    <View style={styles.inputFieldContainer}>
                      <Input
                        style={styles._inputField}
                        handleRef={ref => (
                          this.passwordField = ref
                        )}
                        value={password}
                        autoCapitalize="none"
                        placeholder="Password"
                        keyboardType="default"
                        onChangeText={this.onPasswordChange}
                        onSubmitEditing={
                          ((!email || !validEmail) || (!password || !validPassword)) ?
                          null
                          :
                            this.signup
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
                        text="SIGN UP"
                        primary
                        disabled={
                          this.props.inProgress ||
                          ((!email || !validEmail) ||
                          (!password || !validPassword))
                        }
                        onPress={this.signup}
                      />
                    </View>
                    <TouchableOpacity
                      onPress={this.openPrivacyPolicy}
                      activeOpacity={0.4}
                    >
                      <SecondaryText style={styles._forgotPassword}>
                        Privacy policy
                      </SecondaryText>
                    </TouchableOpacity>
                  </View>
                </View>
              </KeyboardAvoidingView>
          }
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

