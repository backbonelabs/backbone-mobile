import React, { Component } from 'react';
import {
  View,
  Alert,
  Text,
  NativeModules,
} from 'react-native';
import { connect } from 'react-redux';
import routes from '../../routes';
import appActions from '../../actions/app.js';
import styles from '../../styles/device';
import Spinner from '../../components/Spinner';

const { PropTypes } = React;
const { DeviceManagementService } = NativeModules;

class DeviceConnect extends Component {
  static propTypes = {
    navigator: PropTypes.shape({
      replace: PropTypes.func,
      popToTop: PropTypes.func,
    }),
    connectionStatus: PropTypes.shape({
      isConnected: PropTypes.number,
      message: PropTypes.string,
    }),
    dispatch: PropTypes.func,
    inProgress: PropTypes.bool,
    errorMessage: PropTypes.string,
  };

  constructor() {
    super();
    this.state = {};
  }

  componentWillMount() {
    // Check current connection status with Backbone device
    DeviceManagementService.getDeviceStatus((status) => {
      // Status code 2 means that it's currently connected
      if (status === 2) {
        // Replace scene in nav stack, since user can't go back
        this.props.navigator.replace(routes.posture.postureDashboard);
      } else {
        this.getSavedDevice();
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    // If connectionStatus is true, then alert the user that
    // the device is successfully connected to their smartphone
    if (!this.props.connectionStatus && nextProps.connectionStatus) {
      Alert.alert('Success', nextProps.connectionStatus.message, [{
        text: 'Continue',
        onPress: () => this.props.navigator.replace(routes.posture.postureDashboard),
      }]);
    } else if (!this.props.errorMessage && nextProps.errorMessage) {
      // On a failed attempt to connect, send them to the
      // Errors scene with the connectionStatus error message
      this.deviceError(nextProps.errorMessage);
    }
  }

  // Check whether there's a saved device
  getSavedDevice() {
    DeviceManagementService.getSavedDevice((device) => {
      if (device) {
        // Saved device is found, attempt to connect
        this.props.dispatch(appActions.connect());
      } else {
        // There's no device, route to scene for scanning
        this.props.navigator.replace(routes.deviceScan);
      }
    });
  }

  // Handle connectionStatus error message and allows user to perform
  // actions such as retrying a connection attempt or forgetting device
  deviceError(errorMessage) {
    this.props.navigator.replace(
      Object.assign({}, routes.errors, {
        errorMessage,
        iconName: {
          header: 'warning',
          footer: 'chain-broken',
        },
        onPress: {
          primary: () => this.props.navigator.replace(routes.deviceConnect),
          secondary: () => DeviceManagementService.forgetDevice(error => {
            if (error) {
              // Do something about the forget device error
            } else {
              this.props.navigator.popToTop();
            }
          }),
        },
        onPressText: {
          primary: 'Retry',
          secondary: 'Forget this device',
        },
      })
    );
  }

  render() {
    return (
      <View style={styles.container}>
        { this.props.inProgress &&
          <View style={styles.spinner}>
            <Spinner />
            <Text style={styles.spinnerText}>Connecting</Text>
          </View>
        }
      </View>
    );
  }
}

const mapStateToProps = state => {
  const { app } = state;
  return app;
};

export default connect(mapStateToProps)(DeviceConnect);
