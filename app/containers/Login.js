import React, { Component } from 'react';
import {
  Alert,
  View,
  Text,
  TextInput,
  TouchableHighlight,
} from 'react-native';
import { connect } from 'react-redux';
import userActions from '../actions/user';
import styles from '../styles/login';
import routes from '../routes';

class Login extends Component {
  static propTypes = {
    authError: React.PropTypes.string,
    dispatch: React.PropTypes.func,
    navigator: React.PropTypes.object,
    user: React.PropTypes.object,
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
    if (!this.props.user && nextProps.user) {
      // User successfully authenticated, redirect to Home
      this.props.navigator.replace(routes.home);
    } else if (!this.props.authError && nextProps.authError) {
      // Authentication error
      Alert.alert('Authentication Error', 'Invalid email/password. Please try again.');
    }
  }

  login() {
    if (!this.state.email || !this.state.password) {
      // Show alert if email or password is missing
      Alert.alert('Missing fields', `${this.state.email ? 'Password' : 'Email'} is required`);
    } else {
      this.setState({ submitted: true }, () => {
        const { email, password } = this.state;
        this.props.dispatch(userActions.login({ email, password }));
      });
    }
  }

  render() {
    // TODO: Show ActivityIndicator when form is submitted
    return (
      <View style={styles.container}>
        {this.props.user ?
          <Text>{this.props.user.email}</Text>
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
            <TouchableHighlight style={styles.button} onPress={this.login}>
              <Text style={styles.buttonText}>Log in</Text>
            </TouchableHighlight>
          </View>
        }
      </View>
    );
  }
}

const mapStateToProps = state => {
  const { user } = state;
  return {
    user: user.user, // TODO: Revisit user state shape
    authError: user.errorMessage,
    isFetching: user.isFetching,
  };
};

export default connect(mapStateToProps)(Login);
