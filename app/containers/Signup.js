import React, { Component, PropTypes } from 'react';
import {
  Alert,
  View,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
} from 'react-native';
import { connect } from 'react-redux';
import Input from '../components/Input';
import Spinner from '../components/Spinner';
import authActions from '../actions/auth';
import styles from '../styles/auth';
import routes from '../routes';
import Button from '../components/Button';
import SensitiveInfo from '../utils/SensitiveInfo';
import constants from '../utils/constants';
import BackBoneLogo from '../images/bblogo.png';
import BodyText from '../components/BodyText';

const { accessTokenStorageKey } = constants;

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
      emailError: false,
    };
    this.signup = this.signup.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.accessToken && nextProps.accessToken) {
      this.saveAccessToken(nextProps.accessToken);

      this.props.navigator.replace(routes.deviceConnect);
    } else if (!this.props.errorMessage && nextProps.errorMessage) {
      this.setState({ emailError: true });
      Alert.alert('Error', nextProps.errorMessage);
    }
  }

  signup() {
    const emailRegex = /.+@.+\..+/;
    const testEmail = emailRegex.test(this.state.email);

    if (!testEmail) {
      // Show alert if email is not valid
      Alert.alert('Please enter a valid email address');
      this.setState({ emailError: true });
    } else {
      const { email, password } = this.state;
      this.props.dispatch(authActions.signup({ email, password }));
    }
  }

  saveAccessToken(accessToken) {
    SensitiveInfo.setItem(accessTokenStorageKey, accessToken);
  }

  render() {
    const { email, password, emailError } = this.state;
    const close = emailError ? 'close' : null;

    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {this.props.inProgress ?
            <Spinner />
            :
              <View style={styles.formContainer}>
                <View style={styles.backBoneLogoWrapper}>
                  <Image style={styles.backBoneLogo} source={BackBoneLogo} />
                </View>
                <BodyText style={styles._signupHeading}>
                  Feel and look your strongest with better posture
                </BodyText>
                <View style={styles.signupEmailContainer}>
                  <Input
                    style={styles._signupEmail}
                    handleRef={ref => (
                      this.emailField = ref
                    )}
                    value={email}
                    autoCapitalize="none"
                    placeholder="example@email.com"
                    keyboardType="email-address"
                    onChangeText={text => this.setState({ email: text })}
                    onSubmitEditing={() => this.passwordField.focus()}
                    autoCorrect={false}
                    autoFocus
                    returnKeyType="next"
                    iconRightName={(email && !emailError) ? 'check' : close}
                  />
                </View>
                <View style={styles.signupPasswordContainer}>
                  <Input
                    style={styles._signupPassword}
                    handleRef={ref => (
                      this.passwordField = ref
                    )}
                    value={password}
                    autoCapitalize="none"
                    placeholder="choose pasword"
                    keyboardType="default"
                    onChangeText={text => this.setState({ password: text })}
                    onSubmitEditing={this.signup}
                    autoCorrect={false}
                    secureTextEntry
                    returnKeyType="go"
                    iconRightName={password ? 'check' : null}
                  />
                </View>
                <Button
                  style={styles._signupBtn}
                  text="SIGN UP"
                  primary
                  disabled={this.props.inProgress || (!email || !password)}
                  onPress={this.signup}
                />
                <Button
                  style={styles._signupBackBtn}
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

export default connect(mapStateToProps)(Signup);

