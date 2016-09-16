import React, { Component } from 'react';

import {
  View,
} from 'react-native';
import { connect } from 'react-redux';
import authActions from '../actions/auth';
import Input from '../components/Input';
import Button from '../components/Button';
import styles from '../styles/auth';

class Recover extends Component {
  static propTypes = {
    dispatch: React.PropTypes.func,
  };

  constructor() {
    super();
    this.state = {
      email: null,
    };
    this.recoverPassword = this.recoverPassword.bind(this);
  }

  recoverPassword() {
    this.props.dispatch(authActions.recover(this.state.email));
  }

  render() {
    return (
      <View style={styles.container}>
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
      </View>
    );
  }
}

export default connect()(Recover);
