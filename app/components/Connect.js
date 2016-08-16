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
      modalVisible: true,
    };

    this.connectToDevice = this.connectToDevice.bind(this);
    this.connectError = this.connectError.bind(this);
    this.scanForDevices = this.scanForDevices.bind(this);
    this.selectDevice = this.selectDevice.bind(this);
  }

  // componentWillMount() {
  //   this.connectError();
  // }

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

  connectToDevice() {
    NativeAppEventEmitter.once('ConnectionStatus', (status) => {
      this.setState({
        modalVisible: false,
      }, () => {
        if (status.code === 2) {
          this.props.navigator.push(routes.posture);
        } else {
          this.connectError(status);
        }
      });
    });
    DeviceManagementService.connectToDevice();
  }

  connectError(errors) {
    const connectError = Object.assign(routes.connectError, errors);
    this.props.navigator.push(connectError);
  }

  scanForDevices() {
    DeviceManagementService.scanForDevices((error, devices) => {
      if (error) {
        this.connectErrors(error);
      } else {
        setTimeout(() => {
          this.setState({ modalVisible: false, devices });
        }, 1000);
      }
    });
  }

  selectDevice(deviceIdentifier) {
    this.setState({
      modalVisible: true,
    }, () => {
      DeviceManagementService.selectDevice(deviceIdentifier, () => {
        this.connectToDevice();
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
          <ConnectionProgress color={styles._activityIndicator.color} />
        </Modal>
      </View>
    );
  }
}
