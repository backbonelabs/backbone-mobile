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
import authActions from '../actions/auth';
import styles from '../styles/auth';
import routes from '../routes';

class Signup extends Component {
  static propTypes = {
    errorMessage: React.PropTypes.string,
    dispatch: React.PropTypes.func,
    isSignedup: React.PropTypes.bool,
    isCreatingUserAccount: React.PropTypes.bool,
    navigator: React.PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      verifyPassword: '',
    };
    this.signup = this.signup.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.isSignedup && nextProps.isSignedup) {
      const { email } = this.state;
      this.props.navigator.replace(Object.assign({}, routes.confirmEmail, { email }));
    } else if (!this.props.errorMessage && nextProps.errorMessage) {
      Alert.alert('Sign-up Error', nextProps.errorMessage);
    }
  }

  signup() {
    if (!this.state.email || !this.state.password) {
      // Show alert if email or password is missing
      Alert.alert('Missing fields', `${this.state.email ? 'Password' : 'Email'} is required`);
    } else if (!this.state.verifyPassword) {
      Alert.alert('Missing fields', 'Please verify your password');
    } else {
      const { email, password, verifyPassword } = this.state;
      this.props.dispatch(authActions.signup({ email, password, verifyPassword }));
    }
  }

  render() {
    return (
      <View style={styles.container}>
      {this.props.isCreatingUserAccount ?
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
              onSubmitEditing={() => this.verifyPasswordField.focus()}
              autoCorrect={false}
              secureTextEntry
              returnKeyType="next"
            />
          </View>
          <View style={styles.textFieldView}>
            <TextInput
              ref={ref => {
                this.verifyPasswordField = ref;
              }}
              style={styles.textField}
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
          </View>
          <TouchableHighlight
            style={styles.button}
            disabled={this.props.isCreatingUserAccount}
            onPress={this.signup}
          >
            <Text style={styles.buttonText}>Sign-up</Text>
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

