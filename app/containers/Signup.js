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

class Signup extends Component {
  static propTypes = {
    dispatch: React.PropTypes.func,
    navigator: React.PropTypes.object,
    accessToken: React.PropTypes.string,
    errorMessage: React.PropTypes.string,
    isFetchingAccessToken: React.PropTypes.bool,
  };

  constructor() {
    super();
    this.state = {
      email: 'kp@go.com',
      password: 'hulahula',
    };
    this.signup = this.signup.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.accessToken && nextProps.accessToken) {
      this.props.navigator.replace(routes.posture.postureDashboard);
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

  render() {
    return (
      <View style={styles.container}>
      {this.props.isFetchingAccessToken ?
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
            onSubmitEditing={this.signup}
            autoCorrect={false}
            secureTextEntry
            returnKeyType="go"
          />
          <Button
            text="Sign Up"
            disabled={this.props.isFetchingAccessToken}
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

