import React, { Component } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  View,
} from 'react-native';
import { connect } from 'react-redux';
import { get, isEmpty, isEqual, pick } from 'lodash';
import Input from '../components/Input';
import Button from '../components/Button';
import userActions from '../actions/user';
import styles from '../styles/profile';

const { PropTypes } = React;

class Profile extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    errorMessage: PropTypes.string,
    isFetching: PropTypes.bool,
    isUpdating: PropTypes.bool,
    user: PropTypes.shape({
      _id: PropTypes.string,
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
    this.updateField = this.updateField.bind(this);
  }

  componentWillMount() {
    // Fetch latest user profile info
    this.props.dispatch(userActions.fetchUser());
  }

  componentWillReceiveProps(nextProps) {
    let stateChanges = {};

    if (!this.props.errorMessage && nextProps.errorMessage) {
      Alert.alert('Error', nextProps.errorMessage);
    } else if (!isEqual(this.props.user, nextProps.user)) {
      stateChanges = {
        ...stateChanges,
        firstName: nextProps.user.firstName,
        lastName: nextProps.user.lastName,
      };
    }

    // Reset pristine flag after updating profile
    if (this.props.isUpdating && !nextProps.isUpdating && !nextProps.errorMessage) {
      stateChanges = {
        ...stateChanges,
        isPristine: true,
      };
    }

    if (!isEmpty(stateChanges)) {
      this.setState(stateChanges);
    }
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
    const updatedFields = pick(this.state, ['firstName', 'lastName']);
    if (!isEmpty(this.state.password)) {
      updatedFields.password = this.state.password;
      updatedFields.verifyPassword = this.state.verifyPassword;
    }
    this.props.dispatch(userActions.updateUser({
      _id: this.props.user._id,
      ...updatedFields,
    }));
  }

  /**
   * Updates a field and sets the pristine flag to false
   * @param {String} field
   * @param {String} value
   */
  updateField(field, value) {
    this.setState({
      isPristine: false,
      [field]: value,
    });
  }

  render() {
    return (
      <View style={styles.container}>
        {this.props.isFetching || this.props.isUpdating ?
          <ActivityIndicator
            animating
            size="large"
            color={styles._activityIndicator.color}
          />
          :
          <ScrollView style={styles.innerContainer}>
            <Input
              value={this.state.firstName}
              placeholder="First name*"
              onChangeText={text => this.updateField('firstName', text)}
            />
            <Input
              value={this.state.lastName}
              placeholder="Last name*"
              onChangeText={text => this.updateField('lastName', text)}
            />
            <Input
              value={this.state.password}
              placeholder="Password"
              onChangeText={text => this.updateField('password', text)}
              autoCorrect={false}
              secureTextEntry
            />
            <Input
              value={this.state.verifyPassword}
              placeholder="Verify password"
              onChangeText={text => this.updateField('verifyPassword', text)}
              autoCorrect={false}
              secureTextEntry
            />
            <Button
              disabled={this.state.isPristine || !this.isValid()}
              onPress={this.update}
              text="Save"
            />
          </ScrollView>
        }
      </View>
    );
  }
}

const mapStateToProps = state => {
  const { user } = state;
  return user;
};

export default connect(mapStateToProps)(Profile);
