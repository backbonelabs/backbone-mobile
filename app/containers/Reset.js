import React, { Component, PropTypes } from 'react';
import {
  View,
  Alert,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { connect } from 'react-redux';
import authActions from '../actions/auth';
import Input from '../components/Input';
import Button from '../components/Button';
import styles from '../styles/auth';
import Spinner from '../components/Spinner';
import BackBoneLogo from '../images/bblogo.png';
import HeadingText from '../components/HeadingText';
import BodyText from '../components/BodyText';

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
    this.state = {
      email: null,
    };
    this.sendPasswordResetRequest = this.sendPasswordResetRequest.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.passwordResetSent && nextProps.passwordResetSent) {
      // Pop up an alert and have user check their inbox to confirm
      Alert.alert(
        'Success',
        'We sent you a password reset link. ' +
        'Please check your email and use the link to reset your password.',
        [{
          text: 'OK',
          onPress: () => this.props.navigator.pop(),
        }]
      );
    }
    // if there is an authentication error, reset email state
    if (!this.props.errorMessage && nextProps.errorMessage) {
      this.setState({ email: null });
    }
  }

  sendPasswordResetRequest() {
    this.props.dispatch(authActions.reset({ email: this.state.email }));
  }

  render() {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          { this.props.inProgress ?
            <Spinner />
            :
              <View style={styles.innerContainer}>
                <Image source={BackBoneLogo} style={styles.backboneLogo} />
                <HeadingText size={2} style={styles._headingText}>No problem!</HeadingText>
                <BodyText style={styles._subHeadingText}>What's your email?</BodyText>
                <View style={styles.formContainer}>
                  <View style={styles.inputFieldContainer}>
                    <Input
                      style={styles._inputField}
                      autoCapitalize="none"
                      placeholder="Email"
                      keyboardType="email-address"
                      onChangeText={text => this.setState({ email: text })}
                      onSubmitEditing={this.state.email ? this.sendPasswordResetRequest : null}
                      autoCorrect={false}
                      returnKeyType="go"
                    />
                  </View>
                  <View style={styles.CTAContainer}>
                    <Button
                      disabled={!this.state.email}
                      style={styles._CTAButton}
                      primary
                      text="RESET"
                      onPress={this.sendPasswordResetRequest}
                    />
                  </View>
                </View>
              </View>
          }
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

const mapPropsToState = (state) => {
  const { auth } = state;
  return auth;
};

export default connect(mapPropsToState)(Reset);
