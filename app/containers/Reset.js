import React, { Component, PropTypes } from 'react';
import {
  View,
  Alert,
  Image,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import autobind from 'class-autobind';
import { connect } from 'react-redux';
import authActions from '../actions/auth';
import Input from '../components/Input';
import Button from '../components/Button';
import styles from '../styles/auth';
import Spinner from '../components/Spinner';
import BackBoneLogo from '../images/logo.png';
import HeadingText from '../components/HeadingText';
import BodyText from '../components/BodyText';
import SecondaryText from '../components/SecondaryText';
import constants from '../utils/constants';

class Reset extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    navigator: PropTypes.object,
    passwordResetSent: PropTypes.bool,
    inProgress: PropTypes.bool,
    errorMessage: PropTypes.string,
  };

  constructor() {
    super();
    autobind(this);
    this.state = {
      email: null,
      emailPristine: true,
      validEmail: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.passwordResetSent && nextProps.passwordResetSent) {
      // Pop up an alert and have user check their inbox to confirm
      Alert.alert(
        'Success',
        'We sent you a password reset link. ' +
          'Please check your email and use the link to reset your password.',
        [
          {
            text: 'OK',
            onPress: this.props.navigator.pop,
          },
        ]
      );
    }
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

  sendPasswordResetRequest() {
    this.setState({ showIcon: false });
    this.props.dispatch(authActions.reset({ email: this.state.email }));
  }

  render() {
    const { email, validEmail, emailPristine } = this.state;
    let emailWarning;
    if (!emailPristine) {
      emailWarning = validEmail ? '' : 'Invalid Email';
    }
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {this.props.inProgress
            ? <Spinner />
            : <KeyboardAvoidingView behavior="position">
              <View style={styles._innerContainer}>
                <Image source={BackBoneLogo} style={styles.backboneLogo} />
                <HeadingText size={2} style={styles._headingText}>
                  Password Recovery
                </HeadingText>
                <BodyText style={styles._subHeadingText}>
                  Please enter your email address below and we'll send you a link
                  to reset your password.
                </BodyText>
                <View style={styles.inputFieldContainer}>
                  <Input
                    style={{
                      color: emailWarning ? '#E53935' : '#231F20',
                      ...styles._inputField,
                    }}
                    iconStyle={{ color: emailWarning ? '#E53935' : '#9E9E9E' }}
                    autoCapitalize="none"
                    placeholder="Email"
                    keyboardType="email-address"
                    onChangeText={this.onEmailChange}
                    value={this.state.email}
                    onSubmitEditing={
                      !email || !validEmail
                        ? null
                        : this.sendPasswordResetRequest
                    }
                    autoCorrect={false}
                    returnKeyType="go"
                    iconFont="MaterialIcon"
                    iconLeftName="email"
                  />
                </View>
                <BodyText style={styles._warning}>
                  {emailWarning}
                </BodyText>
                <Button
                  disabled={!email || !validEmail}
                  style={styles._CTAResetBtn}
                  primary
                  text="RESET"
                  onPress={this.sendPasswordResetRequest}
                />
                <TouchableOpacity
                  onPress={() => this.props.navigator.pop()}
                  activeOpacity={0.4}
                >
                  <SecondaryText style={styles._cancel}>
                  Cancel
                  </SecondaryText>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>}
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

const mapPropsToState = state => {
  const { auth } = state;
  return auth;
};

export default connect(mapPropsToState)(Reset);
