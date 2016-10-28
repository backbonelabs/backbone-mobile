import React, { Component, PropTypes } from 'react';
import {
  Alert,
  View,
  Image,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
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

class Login extends Component {
  static propTypes = {
    accessToken: PropTypes.string,
    errorMessage: PropTypes.string,
    dispatch: PropTypes.func,
    inProgress: PropTypes.bool,
    navigator: PropTypes.object,
  };

  constructor() {
    super();
    this.state = {
      email: '',
      password: '',
    };
    this.login = this.login.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.accessToken && nextProps.accessToken) {
      // User successfully authenticated, save access token to local device
      this.saveAccessToken(nextProps.accessToken);

      // Redirect for device connect
      this.props.navigator.replace(routes.deviceConnect);
    } else if (!this.props.errorMessage && nextProps.errorMessage) {
      // Authentication error
      Alert.alert('Authentication Error', nextProps.errorMessage);
    }
  }

  saveAccessToken(accessToken) {
    SensitiveInfo.setItem('accessToken', accessToken);
  }

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
    // The main View is composed in the TouchableWithoutFeedback to allow
    // the keyboard to be closed when tapping outside of an input field
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles._container}>
          {this.props.inProgress ?
            <Spinner />
            :
              <View style={styles.formContainer}>
                <View style={styles.backBoneLogoWrapper}>
                  <Image style={styles.backBoneLogo} source={BackBoneLogo} />
                </View>
                <HeadingText size={2} style={styles._loginHeading}>Welcome back!</HeadingText>
                <Input
                  style={styles._emailInput}
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
                  autoFocus
                  returnKeyType="next"
                />
                <Input
                  style={styles._passwordInput}
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
                <Button
                  style={styles._loginButton}
                  text="LOGIN"
                  primary
                  disabled={this.props.inProgress}
                  onPress={this.login}
                />
                <View style={styles.forgotPasswordWrapper}>
                  <TouchableOpacity
                    onPress={() => this.props.navigator.push(routes.reset)}
                    activeOpacity={0.4}
                  >
                    <SecondaryText style={styles._forgotPassword}>
                      Forgot your password?
                    </SecondaryText>
                  </TouchableOpacity>
                </View>
                <Button
                  style={styles._backButton}
                  text="BACK"
                  disabled={this.props.inProgress}
                  onPress={this.props.navigator.pop}
                />
              </View>
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

export default connect(mapStateToProps)(Login);
