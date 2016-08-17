import React, { Component } from 'react';
import {
  ActivityIndicator,
  Alert,
  View,
  Text,
  TextInput,
  TouchableHighlight,
} from 'react-native';
import { connect } from 'react-redux';
import SensitiveInfo from '../utils/SensitiveInfo';
import authActions from '../actions/auth';
import styles from '../styles/login';
import routes from '../routes';

class Login extends Component {
  static propTypes = {
    accessToken: React.PropTypes.string,
    errorMessage: React.PropTypes.string,
    dispatch: React.PropTypes.func,
    isFetching: React.PropTypes.bool,
    navigator: React.PropTypes.object,
  };

  constructor(props) {
    super(props);
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

      // Redirect to Home
      this.props.navigator.replace(routes.home);
    } else if (!this.props.errorMessage && nextProps.errorMessage) {
      // Authentication error
      Alert.alert('Authentication Error', 'Invalid email/password. Please try again.');
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
      this.setState({ submitted: true }, () => {
        const { email, password } = this.state;
        this.props.dispatch(authActions.login({ email, password }));
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
              onSubmitEditing={this.login}
              autoCorrect={false}
              secureTextEntry
              returnKeyType="go"
            />
          </View>
          <TouchableHighlight
            style={styles.button}
            disabled={this.props.isFetching}
            onPress={this.login}
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

export default connect(mapStateToProps)(Login);
