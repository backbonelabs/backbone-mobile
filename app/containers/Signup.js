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
/* eslint-disable max-len */
const emailRegex = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
/* eslint-disable max-len */

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
    this.signup = this.signup.bind(this);
    this.onEmailChange = this.onEmailChange.bind(this);
    this.onPasswordChange = this.onPasswordChange.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.accessToken && nextProps.accessToken) {
      this.saveAccessToken(nextProps.accessToken);

      this.props.navigator.replace(routes.deviceConnect);
    } else if (!this.props.errorMessage && nextProps.errorMessage) {
      Alert.alert('Error', nextProps.errorMessage);
    }
  }

  onEmailChange(email) {
    const testEmail = emailRegex.test(email);
    this.setState({ email });

    if (this.state.emailPristine) {
      this.setState({ emailPristine: false });
    }

    if (testEmail) {
      return this.setState({ validEmail: true });
    }

    return this.setState({ validEmail: false });
  }

  onPasswordChange(password) {
    if (this.state.passwordPristine) {
      this.setState({ passwordPristine: false });
    }

    this.setState({ password });
  }

  saveAccessToken(accessToken) {
    SensitiveInfo.setItem(accessTokenStorageKey, accessToken);
  }

  signup() {
    const { email, password } = this.state;
    this.props.dispatch(authActions.signup({ email, password }));
  }

  render() {
    const { email, password, validEmail, emailPristine, passwordPristine } = this.state;
    const validPassword = password.length >= 8;
    const emailCross = (!emailPristine && !validEmail) ? 'close' : null;
    const passwordCross = (!passwordPristine && !validPassword) ? 'close' : null;
    const passwordWarning = (!passwordPristine && !validPassword) ? 'Password must be at least 8 characters' : '';
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
                    style={styles._signupInput}
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
                    iconRightName={(!emailPristine && validEmail) ? 'check' : emailCross}
                  />
                </View>
                <View style={styles.signupPasswordContainer}>
                  <Input
                    style={styles._signupInput}
                    handleRef={ref => (
                      this.passwordField = ref
                    )}
                    value={password}
                    autoCapitalize="none"
                    placeholder="Password"
                    keyboardType="default"
                    onChangeText={this.onPasswordChange}
                    onSubmitEditing={((!email || !validEmail) || (!password || !validPassword)) ? null : this.signup}
                    autoCorrect={false}
                    secureTextEntry
                    returnKeyType="go"
                    iconRightName={(!passwordPristine && validPassword) ? 'check' : passwordCross}
                  />
                  <BodyText style={styles._warning}>
                    { (!passwordPristine && validPassword) ? '' : passwordWarning }
                  </BodyText>
                </View>
                <Button
                  style={styles._signupBtn}
                  text="SIGN UP"
                  primary
                  disabled={this.props.inProgress || ((!email || !validEmail) || (!password || !validPassword))}
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

