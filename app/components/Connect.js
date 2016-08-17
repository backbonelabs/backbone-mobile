import React, { Component } from 'react';
import {
  View,
  Modal,
  NativeModules,
  ActivityIndicator,
  NativeAppEventEmitter,
} from 'react-native';
import routes from '../routes/';
import styles from '../styles/connect';
import ConnectError from './ConnectError';
import DeviceList from './DeviceList';

const { DeviceManagementService } = NativeModules;

function ConnectionProgress(props) {
  return (
    <View style={styles.modalContainer}>
      <ActivityIndicator
        animating
        size="large"
        color={props.color}
      />
    </View>
  );
}

ConnectionProgress.propTypes = {
  color: React.PropTypes.string,
};

export default class Connect extends Component {
  static propTypes = {
    navigator: React.PropTypes.object,
    currentRoute: React.PropTypes.object,
  };

  constructor() {
    super();
    this.state = {
      devices: [],
      errorInfo: {},
      newDevice: false,
      modalVisible: true,
      errorVisible: false,
    };

    this.connectToDevice = this.connectToDevice.bind(this);
    this.scanForDevices = this.scanForDevices.bind(this);
    this.connectError = this.connectError.bind(this);
    this.selectDevice = this.selectDevice.bind(this);
    this.rescanForDevices = this.rescanForDevices.bind(this);
    this.retryConnection = this.retryConnection.bind(this);
    this.forgetDevice = this.forgetDevice.bind(this);
  }

  componentDidMount() {
    DeviceManagementService.getSavedDevice((savedDevice) => {
      if (!savedDevice) {
        this.setState({ newDevice: true }, () => {
          this.scanForDevices();
        });
      } else {
        this.connectToDevice();
      }
    });
  }

  scanForDevices() {
    NativeAppEventEmitter.addListener('DevicesFound', (devices) => {
      this.setState({ devices });
    });
    DeviceManagementService.scanForDevices(() => {
      this.setState({ modalVisible: false });
    });
  }

  connectToDevice() {
    NativeAppEventEmitter.once('ConnectionStatus', (status) => {
      this.setState({ modalVisible: false }, () => {
        if (!status.message) {
          this.props.navigator.push(routes.posture);
        } else {
          this.connectError(status);
        }
      });
    });
    DeviceManagementService.connectToDevice();
  }

  connectError(errors) {
    this.setState({
      errorInfo: errors,
      newDevice: false,
      modalVisible: true,
      errorVisible: true,
    });
  }

  selectDevice(deviceIdentifier) {
    this.setState({ modalVisible: true }, (error) => {
      if (!error) {
        DeviceManagementService.selectDevice(deviceIdentifier, () => {
          this.connectToDevice();
        });
      } else {
        this.connectError(error);
      }
    });
  }

  retryConnection() {
    this.setState({ modalVisible: true, errorVisible: false }, () => {
      this.connectToDevice();
    });
  }

  rescanForDevices() {
    this.setState({ modalVisible: true }, () => {
      this.scanForDevices();
    });
  }

  forgetDevice() {
    DeviceManagementService.forgetDevice((error) => {
      if (!error) {
        this.props.navigator.pop();
      } else {
        this.connectError(error);
      }
    });
  }

  render() {
    return (
      <View style={styles.container}>
        { this.state.newDevice ?
          (<DeviceList
            devices={this.state.devices}
            select={this.selectDevice}
            rescan={this.rescanForDevices}
            modal={this.state.modalVisible}
          />) :
          <View />
        }
        <Modal animationType="fade" visible={this.state.modalVisible} transparent>
          { this.state.errorVisible ?
            (<ConnectError
              forget={this.forgetDevice}
              retry={this.retryConnection}
              errorInfo={this.state.errorInfo}
            />) :
            <ConnectionProgress color={styles._activityIndicator.color} />
          }
        </Modal>
      </View>
    );
  }
}
