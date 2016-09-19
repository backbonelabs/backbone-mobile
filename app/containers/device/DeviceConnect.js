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
import styles from '../../styles/deviceConnect';
import Spinner from '../../components/Spinner';

const { DeviceManagementService } = NativeModules;

class DeviceConnect extends Component {
  static propTypes = {
    navigator: React.PropTypes.shape({
      replace: React.PropTypes.func,
      pop: React.PropTypes.func,
    }),
    connectionStatus: React.PropTypes.shape({
      isConnected: React.PropTypes.number,
      message: React.PropTypes.string,
    }),
    dispatch: React.PropTypes.func,
  };

  constructor() {
    super();
    this.state = {
      inProgress: false,
    };
  }

  componentWillMount() {
    // Check current connection status with device
    DeviceManagementService.getDeviceStatus((status) => {
      if (status === 2) {
        this.props.navigator.replace(routes.postureDashboard);
      } else {
        this.checkForDevice();
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.inProgress !== nextProps.inProgress) {
      this.setState({ inProgress: nextProps.inProgress });
    }

    if (!this.props.connectionStatus && nextProps.connectionStatus) {
      if (nextProps.connectionStatus.isConnected) {
        Alert.alert('Success', nextProps.connectionStatus.message, [{
          text: 'Continue',
          onPress: () => this.props.navigator.replace(routes.postureDashboard),
        }]);
      } else {
        this.deviceError(nextProps.connectionStatus.message);
      }
    }
  }

  // Check whether there's currently a device assigned to _sharedDevice
  checkForDevice() {
    DeviceManagementService.checkForDevice((device) => {
      if (device) {
        this.props.dispatch(deviceActions.connect());
      } else {
        // No device found, send to `DeviceScan` with rightButton handler
        this.props.navigator.replace(Object.assign({}, routes.deviceScan, {
          rightButton: {
            onPress: () => this.props.dispatch(deviceActions.scan()),
            iconName: 'refresh',
          },
        }));
      }
    });
  }

  // Handle connect error
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
      { this.state.inProgress &&
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
  const { generic } = state;
  return generic;
};

export default connect(mapStateToProps)(DeviceConnect);
