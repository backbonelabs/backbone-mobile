import React, { Component, PropTypes } from 'react';
import {
  View,
  Alert,
} from 'react-native';
import { connect } from 'react-redux';
import userActions from '../actions/user';
import styles from '../styles/changePassword';
import Input from '../components/Input';
import Spinner from '../components/Spinner';
import Button from '../components/Button';

class ChangePassword extends Component {
  static propTypes = {
    isUpdating: PropTypes.bool,
    user: PropTypes.shape({
      _id: PropTypes.string,
    }),
    dispatch: PropTypes.func,
  }

  constructor() {
    super();

    this.state = {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    };
    this.save = this.save.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.isUpdating && !nextProps.isUpdating) {
      if (nextProps.errorMessage) {
        // Display an alert when failing to save changed user data
        Alert.alert('Error', `${nextProps.errorMessage}`);
      } else {
        // Upon a successful save
        Alert.alert('Success', 'Password saved');
      }
    }
  }

  save() {
    const { currentPassword, newPassword, confirmNewPassword } = this.state;
    const { user } = this.props;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      // Show alert if any field is missing
      Alert.alert('Missing fields');
    } else if (
      currentPassword.length < 8 || newPassword.length < 8 || confirmNewPassword.length < 8
      ) {
      // Show alert if any field is not 8 characters long
      Alert.alert('Password must be at least 8 characters');
    } else if (newPassword.toLowerCase() !== confirmNewPassword.toLowerCase()) {
      // Show alert if new and confirm password don't match
      Alert.alert('New password and Confirm password do not match');
    } else {
      return this.props.dispatch(userActions.updateUser({
        _id: user._id,
        currentPassword,
        newPassword,
        confirmNewPassword,
      }));
    }
  }

  render() {
    return (
      <View style={styles.container}>
        {
          this.props.isUpdating ?
            <Spinner /> :
              <View style={styles.innerContainer}>
                <View style={styles.inputContainer}>
                  <Input
                    style={styles._currentPassword}
                    autoCapitalize="none"
                    placeholder="Current Password"
                    keyboardType="default"
                    value={this.state.currentPassword}
                    onChangeText={text => this.setState({ currentPassword: text })}
                    autoCorrect={false}
                    onSubmitEditing={this.save}
                    secureTextEntry
                    returnKeyType="go"
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Input
                    style={styles._inputField}
                    autoCapitalize="none"
                    placeholder="New Password"
                    keyboardType="default"
                    value={this.state.newPassword}
                    onChangeText={text => this.setState({ newPassword: text })}
                    autoCorrect={false}
                    onSubmitEditing={this.save}
                    secureTextEntry
                    returnKeyType="go"
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Input
                    style={styles._inputField}
                    autoCapitalize="none"
                    placeholder="Confirm New Password"
                    keyboardType="default"
                    value={this.state.confirmNewPassword}
                    onChangeText={text => this.setState({ confirmNewPassword: text })}
                    autoCorrect={false}
                    onSubmitEditing={this.save}
                    secureTextEntry
                    returnKeyType="go"
                  />
                </View>
                <Button
                  style={styles._saveButton}
                  text="Save"
                  disabled={
                    (
                      !this.state.currentPassword ||
                      !this.state.newPassword ||
                      !this.state.confirmNewPassword
                    )
                  }
                  onPress={this.save}
                  primary
                />
              </View>
        }
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  const { user } = state;
  return user;
};

export default connect(mapStateToProps)(ChangePassword);
