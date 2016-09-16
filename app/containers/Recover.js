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
import routes from '../routes';

const { PropTypes } = React;

class Recover extends Component {

  static propTypes = {
    dispatch: PropTypes.func,
    navigator: PropTypes.object,
    confirmationSent: PropTypes.bool,
    inProgress: PropTypes.bool,
    errorMessage: PropTypes.string,
  };

  constructor() {
    super();
    this.state = {
      email: null,
      inProgress: false,
    };
    this.recoverPassword = this.recoverPassword.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.confirmationSent && nextProps.confirmationSent) {
      const { email } = this.state;
      this.props.navigator.replace(Object.assign({}, routes.confirm, { email }));
    } else if (!this.props.errorMessage && nextProps.errorMessage) {
      Alert.alert('Error', nextProps.errorMessage);
    }

    if (!this.props.inProgress !== nextProps.inProgress) {
      this.setState({
        inProgress: true,
      });
    }
  }

  recoverPassword() {
    console.log('recover password');
    this.props.dispatch(authActions.recover({ email: this.state.email }));
  }

  render() {
    return (
      <View style={styles.container}>
        { this.state.inProgress ?
          <Spinner /> :
          <View style={styles.formContainer}>
            <Input
              autoCapitalize="none"
              placeholder="Email"
              keyboardType="email-address"
              onChangeText={text => this.setState({ email: text })}
              onSubmitEditing={() => this.recoverPassword}
              autoCorrect={false}
              autoFocus
              returnKeyType="go"
            />
            <Button style={{ marginTop: 5 }} text="Recover" onPress={this.recoverPassword} />
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

export default connect(mapPropsToState)(Recover);
