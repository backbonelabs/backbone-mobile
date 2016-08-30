import React, { Component } from 'react';
import { ScrollView, View } from 'react-native';
import { connect } from 'react-redux';
import Input from '../components/Input';
import Button from '../components/Button';
import styles from '../styles/profile';

const { PropTypes } = React;

class Profile extends Component {
  static propTypes = {
    firstName: PropTypes.string,
    lastName: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {
      firstName: this.props.firstName,
      lastName: this.props.lastName,
      password: '',
      verifyPassword: '',
    };
    this.update = this.update.bind(this);
  }

  update() {
    console.log('update', this.state);
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView>
          <Input
            value={this.state.firstName}
            placeholder="First name"
            onChangeText={text => this.setState({ firstName: text })}
          />
          <Input
            value={this.state.lastName}
            placeholder="Last name"
            onChangeText={text => this.setState({ lastName: text })}
          />
          <Input
            value={this.state.password}
            placeholder="Password"
            onChangeText={text => this.setState({ password: text })}
          />
          <Input
            value={this.state.verifyPassword}
            placeholder="Verify password"
            onChangeText={text => this.setState({ verifyPassword: text })}
          />
          <Button onPress={this.update} text="Save" />
        </ScrollView>
      </View>
    );
  }
}

export default connect()(Profile);
