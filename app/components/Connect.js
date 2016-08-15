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
import DeviceList from './DeviceList';

const { DeviceManagementService } = NativeModules;

function ConnectionProgress() {
  return (
    <View style={styles.modalContainer}>
      <ActivityIndicator
        animating
        size="large"
        color="#e73e3a"
      />
    </View>
  );
}

export default class Connect extends Component {
  static propTypes = {
    navigator: React.PropTypes.object,
    currentRoute: React.PropTypes.object,
  };

  constructor() {
    super();
    this.state = {
      devices: [],
      modalVisible: true,
    };

    this.connectToDevice = this.connectToDevice.bind(this);
    this.scanForDevices = this.scanForDevices.bind(this);
    this.selectDevice = this.selectDevice.bind(this);
  }

  componentDidMount() {
    DeviceManagementService.getSavedDevice((error, savedDevice) => {
      if (error) {
        // Redirect to Error component
      } else if (!savedDevice) {
        this.scanForDevices();
      } else {
        this.connectToDevice();
      }
    });
  }

  scanForDevices() {
    DeviceManagementService.scanForDevices((error, devices) => {
      if (error) {
        // Redirect to Error component
      } else {
        setTimeout(() => {
          this.setState({ modalVisible: false, devices });
        }, 1000);
      }
    });
  }

  connectToDevice() {
    NativeAppEventEmitter.once('ConnectionStatus', (status) => {
      this.setState({
        modalVisible: false,
      }, () => {
        if (status.code === 2) {
          this.props.navigator.push(routes.posture);
        } else {
          // Redirect to Error component
        }
      });
    });
    DeviceManagementService.connectToDevice();
  }

  selectDevice(deviceIdentifier) {
    this.setState({
      modalVisible: true,
    }, () => {
      DeviceManagementService.selectDevice(deviceIdentifier, (error) => {
        if (error) {
          // Redirect to Error
        } else {
          this.connectToDevice();
        }
      });
    });
  }

  render() {
    return (
      <View style={styles.container}>
        { this.state.devices.length ?
          <DeviceList devices={this.state.devices} selectDevice={this.selectDevice} /> :
          <View />
        }
        <Modal animationType="fade" visible={this.state.modalVisible} transparent>
          <ConnectionProgress />
        </Modal>
      </View>
    );
  }
}
