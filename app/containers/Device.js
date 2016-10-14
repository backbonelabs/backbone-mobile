import React, { Component } from 'react';
import {
  View,
  Text,
  NativeModules,
  NativeAppEventEmitter,
} from 'react-native';
import routes from '../routes';
import styles from '../styles/device';
import Spinner from '../components/Spinner';
import List from './List';

const { PropTypes } = React;

const { DeviceManagementService } = NativeModules;

export default class Device extends Component {
  static propTypes = {
    navigator: PropTypes.shape({
      replace: PropTypes.func,
      popToTop: PropTypes.func,
      pop: PropTypes.func,
    }),
  };

  constructor() {
    super();
    this.state = {
      deviceList: [],
    };
    this.selectDevice = this.selectDevice.bind(this);
    this.retryConnect = this.retryConnect.bind(this);
    this.forgetDevice = this.forgetDevice.bind(this);
  }

  componentWillMount() {
    DeviceManagementService.getDeviceStatus((status) => {
      if (status === 2) {
        this.props.navigator.replace(routes.postureDashboard);
      } else {
        this.getSavedDevice();
      }
    });
  }

  componentWillUnmount() {
    NativeAppEventEmitter.removeAllListeners('DevicesFound');

    // Stop device scanning in case a scan is in progress
    DeviceManagementService.stopScanForDevices();
  }

  getSavedDevice() {
    DeviceManagementService.getSavedDevice((savedDevice) => {
      if (savedDevice) {
        this.connectToDevice();
      } else {
        this.scanForDevices();
      }
    });
  }

  connectToDevice() {
    NativeAppEventEmitter.once('ConnectionStatus', status => {
      // TODO: Refactor to use new status shape: { isConnected: boolean, message: string }
      if (!status.message) {
        this.props.navigator.replace(routes.postureDashboard);
      } else {
        this.deviceError(status);
      }
    });
    DeviceManagementService.connectToDevice();
  }

  scanForDevices() {
    NativeAppEventEmitter.addListener('DevicesFound', deviceList => this.setState({ deviceList }));

    DeviceManagementService.scanForDevices(error => {
      if (error) {
        this.deviceError(error);
      }
    });
  }

  deviceError(errors) {
    this.props.navigator.replace(
      Object.assign({}, routes.errors, {
        errorMessage: errors.message,
        iconName: {
          header: 'warning',
          footer: 'chain-broken',
        },
        onPress: {
          primary: this.retryConnect,
          secondary: this.forgetDevice,
        },
        onPressText: {
          primary: 'Retry',
          secondary: 'Forget this device',
        },
      })
    );
  }

  selectDevice(deviceData) {
    DeviceManagementService.selectDevice(deviceData.identifier, error => {
      if (error) {
        this.deviceError(error);
      } else {
        this.connectToDevice();
      }
    });
  }

  retryConnect() {
    this.props.navigator.popToTop();
  }

  forgetDevice() {
    DeviceManagementService.forgetDevice((error) => {
      if (!error) {
        this.props.navigator.pop();
      } else {
        this.deviceError(error);
      }
    });
  }

  formatDeviceRow(rowData) {
    return (
      <View>
        <Text style={styles.deviceName}>{rowData.name}</Text>
        <Text style={styles.deviceID}>{rowData.identifier}</Text>
      </View>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <Spinner />
        <List
          dataBlob={this.state.deviceList}
          formatRowData={this.formatDeviceRow}
          onPressRow={this.selectDevice}
        />
      </View>
    );
  }
}
