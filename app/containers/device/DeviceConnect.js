import React, { Component } from 'react';
import {
  View,
  Alert,
  Text,
  NativeModules,
} from 'react-native';
import { connect } from 'react-redux';
import routes from '../../routes';
import deviceActions from '../../actions/device';
import styles from '../../styles/device';
import Spinner from '../../components/Spinner';

const { PropTypes } = React;
const { DeviceManagementService } = NativeModules;

class DeviceConnect extends Component {
  static propTypes = {
    navigator: PropTypes.shape({
      replace: PropTypes.func,
      pop: PropTypes.func,
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
    // Check current connection status with device
    DeviceManagementService.getDeviceStatus((status) => {
      // Status code 2 means that it's currently connected
      if (status === 2) {
        // Already connected, replace route with postureDashboard
        // since there's no need to navigate back to this scene
        this.props.navigator.replace(routes.postureDashboard);
      } else {
        this.checkForDevice();
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    // If connectionStatus is true, then alert the user that
    // the device is successfully connected to their smartphone
    if (!this.props.connectionStatus && nextProps.connectionStatus) {
      Alert.alert('Success', nextProps.connectionStatus.message, [{
        text: 'Continue',
        onPress: () => this.props.navigator.replace(routes.postureDashboard),
      }]);
    } else if (!this.props.errorMessage && nextProps.errorMessage) {
      // On a failed attempt to connect, send them to the
      // Errors scene with the connectionStatus error message
      this.deviceError(nextProps.errorMessage);
    }
  }

  // Check whether there's currently a device assigned to _sharedDevice
  checkForDevice() {
    DeviceManagementService.checkForDevice((device) => {
      if (device) {
        // Stored device is found, attempt to connect
        this.props.dispatch(deviceActions.connect());
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
          secondary: () => this.props.dispatch(deviceActions.forget()),
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
  const { device } = state;
  return device;
};

export default connect(mapStateToProps)(DeviceConnect);
