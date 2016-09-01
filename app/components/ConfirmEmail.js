import React, { Component } from 'react';
import {
  View,
  Text,
} from 'react-native';
import { connect } from 'react-redux';
import Spinner from './Spinner';
import styles from '../styles/confirmEmail';
import postureRoutes from '../routes/posture';
import authActions from '../actions/auth';

class ConfirmEmail extends Component {
  static propTypes = {
    dispatch: React.PropTypes.func,
    isConfirmed: React.PropTypes.bool,
    navigator: React.PropTypes.object,
    currentRoute: React.PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.setPollingInterval = setInterval(() =>
      props.dispatch(
        authActions.checkEmailConfirmation(this.props.currentRoute.email)
      ), 5000
    );
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.isConfirmed && nextProps.isConfirmed) {
      clearInterval(this.setPollingInterval);
      this.props.navigator.replace(postureRoutes.postureDashboard);
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Spinner />
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

export default connect(mapStateToProps)(ConfirmEmail);
