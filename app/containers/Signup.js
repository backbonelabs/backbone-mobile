import React, { Component } from 'react';

import {
  View,
  Text,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { connect } from 'react-redux';
import SensitiveInfo from '../utils/SensitiveInfo';
import authActions from '../actions/auth';
import styles from '../styles/signup';
import routes from '../routes/signup';

class Signup extends Component {
  static propTypes = {
    accessToken: React.PropTypes.string,
    errorMessage: React.PropTypes.string,
    dispatch: React.PropTypes.func,
    isFetching: React.PropTypes.bool,
    navigator: React.PropTypes.object,
  };

  constructor() {
    super();

    this.state = {
      email: '',
      password: '',
      confirmPassword: '',
    };
    this.signup = this.signup.bind();
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.accessToken && nextProps.accessToken) {
      // User successfully authenticated, save access token to local device
      this.saveAccessToken(nextProps.accessToken);

      // Redirect to DeviceConnect
      this.props.navigator.replace(routes.deviceConnect);
    } else if (!this.props.errorMessage && nextProps.errorMessage) {
      // Authentication error
      Alert.alert('Authentication Error', nextProps.errorMessage);
    }
  }

  saveAccessToken(accessToken) {
    SensitiveInfo.setItem('accessToken', accessToken);
  }

  signup() {
    if (!this.state.email || !this.state.password) {
      // Show alert if email, password, or confirm password is missing
      Alert.alert('Missing fields', `${this.state.email ? 'Password' : 'Email'} is required`);
    } else if (this.state.password !== this.state.confirmPassword) {
      // Show alert if passwords don't match
      Alert.alert(
        'Passwords don\'t match',
        'Please try again',
        { text: 'OK',
          onPress: () => {
            this.setState({
              password: '',
              confirmPassword: '',
            });
          },
        },
      );
    } else {
      this.setState({ submitted: true }, () => {
        const { email, password } = this.state;
        this.props.dispatch(authActions.signup({ email, password }));
      });
    }
  }

  render() {
    // TODO: Show ActivityIndicator when form is submitted
    return (
      <View style={styles.container}>
      {this.props.isFetching ?
        <ActivityIndicator
          animating
          size="large"
          color={styles._activityIndicator.color}
        />
        :
        <View style={styles.formContainer}>
          <View style={styles.textFieldView}>
            <TextInput
              ref={ref => {
                this.emailField = ref;
              }}
              style={styles.textField}
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
          </View>
          <View style={styles.textFieldView}>
            <TextInput
              ref={ref => {
                this.passwordField = ref;
              }}
              style={styles.textField}
              value={this.state.password}
              autoCapitalize="none"
              placeholder="Password"
              keyboardType="default"
              onChangeText={text => this.setState({ password: text })}
              onSubmitEditing={this.signup}
              autoCorrect={false}
              secureTextEntry
              returnKeyType="go"
            />
          </View>
          <TouchableHighlight
            style={styles.button}
            disabled={this.props.isFetching}
            onPress={this.signup}
          >
            <Text style={styles.buttonText}>Log in</Text>
          </TouchableHighlight>
        </View>
      }
      </View>
    );
  }
}

const mapStateToProps = state => {
  const { auth } = state;
  return auth;
};

export default connect(mapStateToProps)(Signup);

