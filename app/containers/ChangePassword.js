import React, { Component, PropTypes } from 'react';
import {
  View,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import autobind from 'autobind-decorator';
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
    navigator: PropTypes.shape({
      pop: PropTypes.func,
    }),
  }

  constructor() {
    super();

    this.state = {
      currentPassword: '',
      newPassword: '',
      newPasswordPristine: true,
      confirmNewPassword: '',
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.isUpdating && !nextProps.isUpdating) {
      if (nextProps.errorMessage) {
        // Display an alert when failing to save changed user data
        Alert.alert('Error', `${nextProps.errorMessage}`);
      } else {
        // Upon a successful save
        Alert.alert(
          'Success',
          'Password Saved',
          [
            {
              text: 'ok',
              onPress: this.props.navigator.pop,
            },
          ]
        );
      }
    }
  }

  @autobind
  onPasswordChange(newPassword) {
    if (this.state.newPasswordPristine) {
      return this.setState({ newPasswordPristine: false, newPassword });
    }

    return this.setState({ newPassword });
  }

  @autobind
  save() {
    const { currentPassword, newPassword, confirmNewPassword } = this.state;
    const { user } = this.props;

    if (
      currentPassword.length < 8 || newPassword.length < 8 || confirmNewPassword.length < 8
      ) {
      // Show alert if any field is not 8 characters long
      Alert.alert('Password must be at least 8 characters');
    } else if (newPassword !== confirmNewPassword) {
      // Show alert if new and confirm password don't match
      Alert.alert('New Password and Confirm New Password do not match');
    } else if (newPassword === currentPassword) {
      // Show alert if new and current password match
      Alert.alert('New Password and Current Password cannot be the same');
    } else {
      return this.props.dispatch(userActions.updateUser({
        _id: user._id,
        password: newPassword,
        verifyPassword: confirmNewPassword,
        currentPassword,
      }));
    }
  }

  render() {
    const { newPassword, newPasswordPristine } = this.state;
    const validPassword = newPassword.length >= 8;
    const passwordIconProps = {};
    if (!newPasswordPristine) {
      passwordIconProps.iconRightName = validPassword ? 'check' : 'close';
    }

    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {
            this.props.isUpdating ?
              <Spinner /> :
                <View style={styles.innerContainer}>
                  <View style={styles.inputContainer}>
                    <Input
                      style={styles._currentPassword}
                      autoCapitalize="none"
                      handleRef={ref => (
                        this.currentPassword = ref
                      )}
                      placeholder="Current Password"
                      keyboardType="default"
                      value={this.state.currentPassword}
                      onChangeText={text => this.setState({ currentPassword: text })}
                      onSubmitEditing={() => this.newPassword.focus()}
                      autoCorrect={false}
                      secureTextEntry
                      returnKeyType="next"
                    />
                  </View>
                  <View style={styles.inputContainer}>
                    <Input
                      style={styles._inputField}
                      autoCapitalize="none"
                      handleRef={ref => (
                        this.newPassword = ref
                      )}
                      placeholder="New Password"
                      keyboardType="default"
                      value={this.state.newPassword}
                      onChangeText={this.onPasswordChange}
                      onSubmitEditing={() => this.confirmNewPassword.focus()}
                      autoCorrect={false}
                      secureTextEntry
                      returnKeyType="next"
                      {...passwordIconProps}
                    />
                  </View>
                  <View style={styles.inputContainer}>
                    <Input
                      style={styles._inputField}
                      autoCapitalize="none"
                      handleRef={ref => (
                        this.confirmNewPassword = ref
                      )}
                      placeholder="Confirm New Password"
                      keyboardType="default"
                      value={this.state.confirmNewPassword}
                      onChangeText={text => this.setState({ confirmNewPassword: text })}
                      autoCorrect={false}
                      secureTextEntry
                      returnKeyType="next"
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
      </TouchableWithoutFeedback>
    );
  }
}

const mapStateToProps = (state) => {
  const { user } = state;
  return user;
};

export default connect(mapStateToProps)(ChangePassword);
