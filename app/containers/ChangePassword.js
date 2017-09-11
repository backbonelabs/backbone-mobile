import React, { Component, PropTypes } from 'react';
import {
  View,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import autobind from 'class-autobind';
import { connect } from 'react-redux';
import userActions from '../actions/user';
import styles from '../styles/changePassword';
import Input from '../components/Input';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import BodyText from '../components/BodyText';
import Mixpanel from '../utils/Mixpanel';
import constants from '../utils/constants';

class ChangePassword extends Component {
  static propTypes = {
    isUpdating: PropTypes.bool,
    user: PropTypes.shape({
      _id: PropTypes.string,
      authMethod: PropTypes.number,
    }),
    dispatch: PropTypes.func,
    navigator: PropTypes.shape({
      pop: PropTypes.func,
    }),
  }

  constructor() {
    super();
    autobind(this);
    this.state = {
      currentPassword: '',
      newPassword: '',
      newPasswordPristine: true,
      confirmPassword: '',
      confirmPasswordPristine: true,
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

  onNewPasswordChange(newPassword) {
    if (this.state.newPasswordPristine) {
      return this.setState({ newPasswordPristine: false, newPassword });
    }

    return this.setState({ newPassword });
  }

  onConfirmPasswordChange(confirmPassword) {
    if (this.state.confirmPasswordPristine) {
      return this.setState({ confirmPasswordPristine: false, confirmPassword });
    }

    return this.setState({ confirmPassword });
  }

  save() {
    const { currentPassword, newPassword, confirmPassword } = this.state;
    const { user } = this.props;

    if (currentPassword.length < 8) {
      // Show alert if current password is not 8 characters long
      return Alert.alert('Current Password must be at least 8 characters');
    }

    Mixpanel.track('changePassword');

    return this.props.dispatch(userActions.updateUser({
      _id: user._id,
      password: newPassword,
      verifyPassword: confirmPassword,
      currentPassword,
    }));
  }

  render() {
    const {
      newPassword,
      currentPassword,
      confirmPassword,
      confirmPasswordPristine,
      newPasswordPristine,
    } = this.state;
    const validNewPassword = (newPassword.length >= 8) && (newPassword !== currentPassword);
    const validConfirmPassword = (confirmPassword.length >= 8) && (confirmPassword === newPassword);
    const newPasswordIconProps = {};
    const confirmPasswordIconProps = {};
    let passwordWarning;
    if (!newPasswordPristine) {
      newPasswordIconProps.iconRightName = validNewPassword ? 'check' : 'close';
      if ((newPassword.length > 0) && (currentPassword.length > 0)) {
        if (newPassword === currentPassword) {
          passwordWarning = 'New Password and Current Password cannot be the same';
        } else if (newPassword.length < 8) {
          passwordWarning = 'New Password must be at least 8 characters';
        } else if ((confirmPassword !== newPassword) && (newPassword.length >= 8)) {
          passwordWarning = 'New Passwords do not match';
        } else {
          passwordWarning = '';
        }
      }
    }

    if (!confirmPasswordPristine) {
      confirmPasswordIconProps.iconRightName = validConfirmPassword ? 'check' : 'close';
    }

    // Don't allow users that signed up with Facebook accounts to change the password
    if (this.props.user.authMethod === constants.authMethods.FACEBOOK) {
      return (
        <View style={styles.container}>
          <BodyText style={styles.passwordText}>
            Your account is connected with your Facebook account.
            There is no need to set a password.
            If you need assistance, please contact Support from the Settings screen.
          </BodyText>
        </View>
      );
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
                      style={styles.inputField}
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
                  <BodyText style={styles.warning}>
                    {passwordWarning}
                  </BodyText>
                  <View style={[styles.inputContainer, styles.newPassword]}>
                    <Input
                      style={styles.inputField}
                      autoCapitalize="none"
                      handleRef={ref => (
                        this.newPassword = ref
                      )}
                      placeholder="New Password"
                      keyboardType="default"
                      value={this.state.newPassword}
                      onChangeText={this.onNewPasswordChange}
                      onSubmitEditing={() => this.confirmPassword.focus()}
                      autoCorrect={false}
                      secureTextEntry
                      returnKeyType="next"
                      {...newPasswordIconProps}
                    />
                  </View>
                  <View style={styles.inputContainer}>
                    <Input
                      style={styles.inputField}
                      autoCapitalize="none"
                      handleRef={ref => (
                        this.confirmPassword = ref
                      )}
                      placeholder="Confirm New Password"
                      keyboardType="default"
                      value={this.state.confirmPassword}
                      onChangeText={this.onConfirmPasswordChange}
                      autoCorrect={false}
                      secureTextEntry
                      returnKeyType="next"
                      {...confirmPasswordIconProps}
                    />
                  </View>
                  <Button
                    style={styles.saveButton}
                    text="SAVE PASSWORD"
                    disabled={
                      (
                        !this.state.currentPassword ||
                        !this.state.newPassword ||
                        !this.state.confirmPassword ||
                        (newPassword === currentPassword) ||
                        !validNewPassword ||
                        !validConfirmPassword
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
