import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { connect } from 'react-redux';
import styles from '../styles/confirmAccount';
import routes from '../routes/';
import authActions from '../actions/auth';
import SensitiveInfo from '../utils/SensitiveInfo';

class ConfirmAccount extends Component {
  static propTypes = {
    dispatch: React.PropTypes.func,
    accessToken: React.PropTypes.string,
    navigator: React.PropTypes.object,
    currentRoute: React.PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {
      pollingCount: 0,
      resendThreshold: 3,
    };

    this.setPollingInterval = setInterval(() => {
      this.setState({ pollingCount: ++this.state.pollingCount }, () =>
        props.dispatch(authActions.checkConfirmation(props.currentRoute.email))
      );
    }, 5000);
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.accessToken && nextProps.accessToken) {
      clearInterval(this.setPollingInterval);
      this.saveAccessToken(nextProps.accessToken);
      this.props.navigator.replace(routes.posture);
    }
  }

  saveAccessToken(accessToken) {
    SensitiveInfo.setItem('accessToken', accessToken);
  }

  resendEmail() {
    this.setState({
      pollingCount: 0,
      resendThreshold: this.state.resendThreshold * 2,
    }, () =>
      this.props.dispatch(authActions.resendConfirmation({ email: this.props.currentRoute.email }))
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.activityIndicatorContainer}>
          <ActivityIndicator
            animating
            size="large"
            color={styles._activityIndicator.color}
          />
        </View>
        <View style={styles.confirmTextContainer}>
          <Text style={styles.confirmText}>
            Check your email inbox and click the link to confirm your account
          </Text>
        </View>
        <View style={styles.resendTextContainer}>
        { this.state.pollingCount === this.state.resendThreshold &&
          <TouchableOpacity
            style={styles.resendButton}
            onPress={() => this.resendEmail()}
          >
            <Text style={styles.resendText}>Resend Confirmation</Text>
          </TouchableOpacity>
        }
        </View>
      </View>
    );
  }
}

const mapStateToProps = state => {
  const { auth } = state;
  return auth;
};

export default connect(mapStateToProps)(ConfirmAccount);
