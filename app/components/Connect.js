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
import DeviceError from './DeviceError';
import DeviceList from './DeviceList';

const { DeviceManagementService } = NativeModules;

function InProgress(props) {
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

InProgress.propTypes = {
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
      modalVisible: false,
      errorVisible: false,
    };

    this.selectDevice = this.selectDevice.bind(this);
    this.retryConnection = this.retryConnection.bind(this);
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

  getSavedDevice() {
    this.setState({ modalVisible: true }, () => {
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
      this.setState({ modalVisible: false }, () => {
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
    NativeAppEventEmitter.addListener('DevicesFound', (devices) => {
      this.setState({ devices });
    });
    this.setState({ newDevice: true }, () => {
      DeviceManagementService.scanForDevices((error) => {
        if (!error) {
          this.setState({ modalVisible: false });
        } else {
          this.deviceError(error);
        }
      });
    });
  }

  deviceError(errors) {
    this.setState({
      errorInfo: errors,
      newDevice: false,
      modalVisible: true,
      errorVisible: true,
    });
  }

  selectDevice(deviceIdentifier) {
    this.setState({ modalVisible: true }, () => {
      DeviceManagementService.selectDevice(deviceIdentifier, (error) => {
        if (!error) {
          this.connectToDevice();
        } else {
          this.deviceError(error);
        }
      });
    });
  }

  retryConnection() {
    this.props.navigator.popToTop();
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
        this.deviceError(error);
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
            (<DeviceError
              forget={this.forgetDevice}
              retry={this.retryConnection}
              errorInfo={this.state.errorInfo}
            />) :
            <InProgress color={styles._activityIndicator.color} />
          }
        </Modal>
      </View>
    );
  }
}
