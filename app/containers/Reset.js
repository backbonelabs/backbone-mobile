import React, { Component } from 'react';

import {
  View,
  Alert,
} from 'react-native';
import { connect } from 'react-redux';
import authActions from '../actions/auth';
import Input from '../components/Input';
import Button from '../components/Button';
import styles from '../styles/auth';
import Spinner from '../components/Spinner';

const { PropTypes } = React;

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
      <View style={styles.container}>
        { this.props.inProgress ?
          <Spinner />
          :
          <View style={styles.formContainer}>
            <Input
              autoCapitalize="none"
              placeholder="Email"
              keyboardType="email-address"
              onChangeText={text => this.setState({ email: text })}
              onSubmitEditing={this.sendPasswordResetRequest}
              autoCorrect={false}
              autoFocus
              returnKeyType="go"
            />
            <Button
              style={{ marginTop: 5 }}
              text="Reset Password"
              onPress={this.sendPasswordResetRequest}
            />
          </View>

        }
      </View>
    );
  }
}

const mapPropsToState = (state) => {
  const { auth } = state;
  return auth;
};

export default connect(mapPropsToState)(Reset);
