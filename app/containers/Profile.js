import React, { Component } from 'react';
import { ScrollView, View } from 'react-native';
import { connect } from 'react-redux';
import { get, isEmpty } from 'lodash';
import Input from '../components/Input';
import Button from '../components/Button';
import styles from '../styles/profile';

const { PropTypes } = React;

class Profile extends Component {
  static propTypes = {
    user: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
    }),
  };

  constructor(props) {
    super(props);
    this.state = {
      isPristine: true,
      firstName: get(this.props.user, 'firstName'),
      lastName: get(this.props.user, 'lastName'),
      password: '',
      verifyPassword: '',
    };
    this.isValid = this.isValid.bind(this);
    this.update = this.update.bind(this);
  }

  isValid() {
    const {
      firstName,
      lastName,
      password,
      verifyPassword,
    } = this.state;

    return !isEmpty(firstName) && !isEmpty(lastName) && password === verifyPassword;
  }

  update() {
    console.log('update', this.state);
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.innerContainer}>
          <Input
            value={this.state.firstName}
            placeholder="First name*"
            onChangeText={text => this.setState({ isPristine: false, firstName: text })}
          />
          <Input
            value={this.state.lastName}
            placeholder="Last name*"
            onChangeText={text => this.setState({ isPristine: false, lastName: text })}
          />
          <Input
            value={this.state.password}
            placeholder="Password"
            onChangeText={text => this.setState({ isPristine: false, password: text })}
            autoCorrect={false}
            secureTextEntry
          />
          <Input
            value={this.state.verifyPassword}
            placeholder="Verify password"
            onChangeText={text => this.setState({ isPristine: false, verifyPassword: text })}
            autoCorrect={false}
            secureTextEntry
          />
          <Button
            disabled={this.state.isPristine || !this.isValid()}
            onPress={this.update}
            text="Save"
          />
        </ScrollView>
      </View>
    );
  }
}

const mapStateToProps = state => {
  const { user } = state;
  return user;
};

export default connect(mapStateToProps)(Profile);
