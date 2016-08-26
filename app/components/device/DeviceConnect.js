import React, { Component } from 'react';
import {
  View,
  Modal,
  NativeModules,
  ActivityIndicator,
  NativeAppEventEmitter,
} from 'react-native';
import routes from '../../routes';
import styles from '../../styles/device/deviceConnect';
import DeviceList from './DeviceList';
import DeviceError from './DeviceError';

const { DeviceManagementService } = NativeModules;

function InProgress(props) {
  return (
    <View style={styles.progressContainer}>
      <ActivityIndicator
        animating
        size="large"
        color={props.color}
      />
    </View>
  );
}

InProgress.propTypes = {
  color: React.PropTypes.string,
};

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
    DeviceManagementService.getDeviceStatus((status) => {
      if (status === 2) {
        this.props.navigator.push(routes.posture);
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
      this.setState({ inProgress: false }, () => {
        if (!status.message) {
          this.props.navigator.push(routes.posture);
        } else {
          this.deviceError(status);
        }
      });
    });
    DeviceManagementService.connectToDevice();
  }

  scanForDevices() {
    NativeAppEventEmitter.addListener('DevicesFound', (deviceList) => {
      this.setState({ deviceList });
    });
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

  selectDevice(deviceIdentifier) {
    this.setState({ inProgress: true }, () => {
      DeviceManagementService.selectDevice(deviceIdentifier, (error) => {
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

  render() {
    return (
      <View style={styles.container}>
        { this.state.newDevice ?
          (<DeviceList
            deviceList={this.state.deviceList}
            selectDevice={this.selectDevice}
            rescanForDevices={this.rescanForDevices}
            inProgress={this.state.inProgress}
          />) :
          <View />
        }
        <Modal animationType="fade" visible={this.state.inProgress} transparent>
          { this.state.hasError ?
            (<DeviceError
              forgetDevice={this.forgetDevice}
              retryConnect={this.retryConnect}
              deviceError={this.state.deviceError}
            />) :
            <InProgress color={styles._activityIndicator.color} />
          }
        </Modal>
      </View>
    );
  }
}
