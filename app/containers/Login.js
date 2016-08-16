import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableHighlight,
} from 'react-native';
import { connect } from 'react-redux';
import userActions from '../actions/user';
import styles from '../styles/home';
import routes from '../routes';

class Login extends Component {
  static propTypes = {
    dispatch: React.PropTypes.func,
    navigator: React.PropTypes.object,
    user: React.PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {
      submitted: false,
    };
    this.login = this.login.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.user && nextProps.user) {
      // User successfully authenticated, redirect to Home
      this.props.navigator.replace(routes.home);
    }
  }

  login() {
    // TODO: Refactor to capture email and password from form fields
    this.setState({ submitted: true }, () => {
      this.props.dispatch(userActions.login({
        email: 'kev@gobackbone.com',
        password: 'Password1',
      }));
    });
  }

  render() {
    // TODO: Add form to capture email and password
    // TODO: Show ActivityIndicator when form is submitted
    return (
      <View>
        {this.props.user ?
          <Text>{this.props.user.email}</Text>
          :
          <TouchableHighlight style={styles.button} onPress={this.login}>
            <Text style={styles.buttonText}>Log in</Text>
          </TouchableHighlight>
        }
      </View>
    );
  }
}

const mapStateToProps = state => {
  const { user } = state;
  return {
    user: user.user, // TODO: Revisit user state shape
  };
};

export default connect(mapStateToProps)(Login);
