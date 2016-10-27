import React, { Component, PropTypes } from 'react';

import {
  View,
  Alert,
  Image,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { connect } from 'react-redux';
import authActions from '../actions/auth';
import Input from '../components/Input';
import Button from '../components/Button';
import styles from '../styles/auth';
import Spinner from '../components/Spinner';
import BackBoneLogo from '../images/thinLogo.png';
import SecondaryText from '../components/SecondaryText';

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
        'We\'ve emailed you a confirmation email please check your ' +
        'inbox and follow the instructions to reset your password',
        [{
          text: 'OK',
          onPress: () => this.props.navigator.popToTop(),
        }]
      );
    }
  }

  sendPasswordResetRequest() {
    if (this.state.email && this.state.email.length) {
      this.props.dispatch(authActions.reset({ email: this.state.email }));
    } else {
      Alert.alert('Missing fields', 'Email is required');
    }
  }

  render() {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          { this.props.inProgress ?
            <Spinner />
            :
              <View style={styles._formContainer}>
                <View style={styles._backBoneLogoWrapper}>
                  <Image style={styles._backBoneLogo} source={BackBoneLogo} />
                </View>
                <Text style={styles._loginHeading}>No problem!</Text>
                <Text style={styles._resetSubHeading}>What's your email?</Text>
                <Input
                  style={styles._resetInput}
                  autoCapitalize="none"
                  placeholder="example@email.com"
                  keyboardType="email-address"
                  onChangeText={text => this.setState({ email: text })}
                  onSubmitEditing={this.sendPasswordResetRequest}
                  autoCorrect={false}
                  autoFocus
                  returnKeyType="go"
                />
                <Button
                  buttonType="mainCtsBtn"
                  style={styles._resetButton}
                  text="RESET"
                  onPress={this.sendPasswordResetRequest}
                />
                <View style={styles._nevermindWrapper}>
                  <TouchableOpacity
                    onPress={() => this.props.navigator.pop()}
                    activeOpacity={0.4}
                  >
                    <SecondaryText style={styles._forgotPassword} >
                      Nevermind! Take me back to login
                    </SecondaryText>
                  </TouchableOpacity>
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
