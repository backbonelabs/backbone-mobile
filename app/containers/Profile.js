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
      profileDidChange: false,
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
        <ScrollView style={styles.innerContainer}>
          <Input
            value={this.state.firstName}
            placeholder="First name"
            onChangeText={text => this.setState({ profileDidChange: true, firstName: text })}
          />
          <Input
            value={this.state.lastName}
            placeholder="Last name"
            onChangeText={text => this.setState({ profileDidChange: true, lastName: text })}
          />
          <Input
            value={this.state.password}
            placeholder="Password"
            onChangeText={text => this.setState({ profileDidChange: true, password: text })}
          />
          <Input
            value={this.state.verifyPassword}
            placeholder="Verify password"
            onChangeText={text => this.setState({ profileDidChange: true, verifyPassword: text })}
          />
          <Button disabled={!this.state.profileDidChange} onPress={this.update} text="Save" />
        </ScrollView>
      </View>
    );
  }
}

export default connect()(Profile);
