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

class ConfirmEmail extends Component {
  static propTypes = {
    dispatch: React.PropTypes.func,
    isConfirmed: React.PropTypes.bool,
    navigator: React.PropTypes.object,
    currentRoute: React.PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {
      pollingCount: 0,
    };

    this.setPollingInterval = setInterval(() => {
      this.setState({ pollingCount: ++this.state.pollingCount }, () => {
        console.log('polling count increment', this.state.pollingCount);
        props.dispatch(authActions.checkEmailConfirmation(props.currentRoute.email));
      }
      );
    }, 5000);
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.isConfirmed && nextProps.isConfirmed) {
      clearInterval(this.setPollingInterval);
      this.props.navigator.replace(routes.posture);
    }
  }

  resendEmail() {
    this.setState({ pollingCount: 0 }, () => {
      console.log('polling count reset');
      props.dispatch(authActions.checkEmailConfirmation(props.currentRoute.email));
    });
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
        { this.state.pollingCount >= 3 &&
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

export default connect(mapStateToProps)(ConfirmEmail);
