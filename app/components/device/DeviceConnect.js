import React, { Component } from 'react';
import {
  View,
  Text,
  Modal,
  NativeModules,
  NativeAppEventEmitter,
} from 'react-native';
import routes from '../../routes';
import styles from '../../styles/device/deviceConnect';
import Spinner from '../Spinner';
import List from '../../containers/List';
import DeviceError from './DeviceError';

const { DeviceManagementService } = NativeModules;

export default class DeviceConnect extends Component {
  static propTypes = {
    navigator: React.PropTypes.object,
    currentRoute: React.PropTypes.object,
  };

  constructor() {
    super();
    this.state = {
      deviceList: [],
      deviceError: {},
      newDevice: false,
      inProgress: false,
      hasError: false,
    };

    this.selectDevice = this.selectDevice.bind(this);
    this.retryConnect = this.retryConnect.bind(this);
    this.rescanForDevices = this.rescanForDevices.bind(this);
    this.forgetDevice = this.forgetDevice.bind(this);
  }

  componentWillMount() {
    NativeAppEventEmitter.addListener('DevicesFound', (deviceList) => {
      this.setState({ deviceList });
    });

    DeviceManagementService.getDeviceStatus((status) => {
      if (status === 2) {
        this.props.navigator.push(routes.posture.postureDashboard);
      } else {
        this.getSavedDevice();
      }
    });
  }

  componentWillUnmount() {
    NativeAppEventEmitter.removeAllListeners('DevicesFound');
  }

  getSavedDevice() {
    this.setState({ inProgress: true }, () => {
      DeviceManagementService.getSavedDevice((savedDevice) => {
        if (savedDevice) {
          this.connectToDevice();
        } else {
          this.scanForDevices();
        }
      });
    });
  }

  connectToDevice() {
    NativeAppEventEmitter.once('ConnectionStatus', (status) => {
      // TODO: Refactor to use new status shape: { isConnected: boolean, message: string }
      this.setState({ inProgress: false }, () => {
        if (!status.message) {
          this.props.navigator.push(routes.posture.postureDashboard);
        } else {
          this.deviceError(status);
        }
      });
    });
    DeviceManagementService.connectToDevice();
  }

  scanForDevices() {
    this.setState({ newDevice: true }, () => {
      DeviceManagementService.scanForDevices((error) => {
        if (!error) {
          this.setState({ inProgress: false });
        } else {
          this.deviceError(error);
        }
      });
    });
  }

  deviceError(errors) {
    this.setState({
      deviceError: errors,
      newDevice: false,
      inProgress: true,
      hasError: true,
    });
  }

  selectDevice(deviceData) {
    this.setState({ inProgress: true }, () => {
      DeviceManagementService.selectDevice(deviceData.identifier, (error) => {
        if (!error) {
          this.connectToDevice();
        } else {
          this.deviceError(error);
        }
      });
    });
  }

  retryConnect() {
    this.props.navigator.popToTop();
  }

  rescanForDevices() {
    this.setState({ inProgress: true }, () => {
      this.scanForDevices();
    });
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
        { this.state.newDevice &&
          <List
            dataBlob={this.state.deviceList}
            formatRowData={this.formatDeviceRow}
            onPressRow={this.selectDevice}
          />
        }
        <Modal
          animationType="fade"
          visible={this.state.inProgress}
          transparent
          onRequestClose={() => {
            // no-op, onRequestClose is required for Android
          }}
        >
          { this.state.hasError ?
            (<DeviceError
              forgetDevice={this.forgetDevice}
              retryConnect={this.retryConnect}
              deviceError={this.state.deviceError}
            />) :
            <View style={styles.progressContainer}>
              <Spinner />
            </View>
          }
        </Modal>
      </View>
    );
  }
}
