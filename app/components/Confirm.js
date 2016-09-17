import React, { Component } from 'react';
import {
  View,
  Text,
} from 'react-native';
import { connect } from 'react-redux';
import Spinner from './Spinner';
import styles from '../styles/confirm';
import routes from '../routes';
import authActions from '../actions/auth';
import SensitiveInfo from '../utils/SensitiveInfo';

class Confirm extends Component {
  static propTypes = {
    dispatch: React.PropTypes.func,
    navigator: React.PropTypes.object,
    accessToken: React.PropTypes.string,
    currentRoute: React.PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.setPollingInterval = setInterval(() => (
      this.props.dispatch(
        authActions.checkConfirmation(this.props.currentRoute.email)
      )
    ), 5000);
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.accessToken && nextProps.accessToken) {
      clearInterval(this.setPollingInterval);
      SensitiveInfo.setItem('accessToken', nextProps.accessToken);
      this.props.navigator.replace(routes.device);
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

const mapStateToProps = (state) => {
  const { auth } = state;
  return auth;
};

export default connect(mapStateToProps)(Confirm);
