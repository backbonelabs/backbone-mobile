import React, { Component } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
} from 'react-native';
import { connect } from 'react-redux';
import styles from '../styles/userConfirm';
import routes from '../routes/';
import authActions from '../actions/auth';

class UserConfirm extends Component {
  static propTypes = {
    dispatch: React.PropTypes.func,
    isConfirmed: React.PropTypes.bool,
    navigator: React.PropTypes.object,
    currentRoute: React.PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.setPollingInterval = setInterval(() =>
      this.props.dispatch(
        authActions.checkEmailConfirmation(this.props.currentRoute.email)
      ), 5000
    );
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.isConfirmed && nextProps.isConfirmed) {
      clearInterval(this.setPollingInterval);
      this.props.navigator.replace(routes.posture);
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <ActivityIndicator
          animating
          size="large"
          color={styles._activityIndicator.color}
        />
        <Text style={styles.confirmText}>
          Check your email inbox and click on the confirmation link!
        </Text>
      </View>
    );
  }
}

const mapStateToProps = state => {
  const { auth } = state;
  return auth;
};

export default connect(mapStateToProps)(UserConfirm);
