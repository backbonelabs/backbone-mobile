import React, { Component } from 'react';
import {
  Alert,
  View,
} from 'react-native';
import { connect } from 'react-redux';
import Input from '../components/Input';
import Spinner from '../components/Spinner';
import authActions from '../actions/auth';
import styles from '../styles/auth';
import routes from '../routes';
import Button from '../components/Button';
import SensitiveInfo from '../utils/SensitiveInfo';
import { accessTokenStorageKey } from '../utils/constants';

const { PropTypes } = React;

class Signup extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    navigator: PropTypes.shape({
      replace: PropTypes.func,
    }),
    accessToken: PropTypes.string,
    errorMessage: PropTypes.string,
    isSigningUp: PropTypes.bool,
  };

  constructor() {
    super();
    this.state = {
      email: '',
      password: '',
    };
    this.signup = this.signup.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.accessToken && nextProps.accessToken) {
      this.saveAccessToken(nextProps.accessToken);

      this.props.navigator.replace(routes.device);
    } else if (!this.props.errorMessage && nextProps.errorMessage) {
      Alert.alert('Error', nextProps.errorMessage);
    }
  }

  signup() {
    if (!this.state.email || !this.state.password) {
      // Show alert if email or password is missing
      Alert.alert('Missing fields', `${this.state.email ? 'Password' : 'Email'} is required`);
    } else {
      const { email, password } = this.state;
      this.props.dispatch(authActions.signup({ email, password }));
    }
  }

  saveAccessToken(accessToken) {
    SensitiveInfo.setItem(accessTokenStorageKey, accessToken);
  }

  render() {
    return (
      <View style={styles.container}>
        {this.props.isSigningUp ?
          <Spinner />
          :
          <View style={styles.formContainer}>
            <Input
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
              handleRef={ref => (
                this.passwordField = ref
              )}
              value={this.state.password}
              autoCapitalize="none"
              placeholder="Password"
              keyboardType="default"
              onChangeText={text => this.setState({ password: text })}
              onSubmitEditing={() => this.verifyPasswordField.focus()}
              autoCorrect={false}
              secureTextEntry
              returnKeyType="next"
            />
            <Input
              handleRef={ref => (
                this.verifyPasswordField = ref
              )}
              value={this.state.verifyPassword}
              autoCapitalize="none"
              placeholder="Verify Password"
              keyboardType="default"
              onChangeText={text => this.setState({ verifyPassword: text })}
              onSubmitEditing={this.signup}
              autoCorrect={false}
              secureTextEntry
              returnKeyType="go"
            />
            <Button
              text="Sign Up"
              disabled={this.props.isSigningUp}
              onPress={this.signup}
            />
          </View>
        }
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  const { auth } = state;
  return auth;
};

export default connect(mapStateToProps)(Signup);

