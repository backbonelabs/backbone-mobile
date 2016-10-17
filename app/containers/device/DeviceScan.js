import React, { Component } from 'react';

import {
  View,
  Text,
  Alert,
  NativeModules,
  NativeAppEventEmitter,
} from 'react-native';
import List from '../List';
import Spinner from '../../components/Spinner';
import styles from '../../styles/device';
import routes from '../../routes';

const { PropTypes } = React;
const { DeviceManagementService } = NativeModules;

class DeviceScan extends Component {
  static propTypes = {
    navigator: PropTypes.shape({
      replace: PropTypes.func,
      popToTop: PropTypes.func,
    }),
  };


  constructor() {
    super();
    this.state = {
      deviceList: [],
      inProgress: false,
    };
    this.selectDevice = this.selectDevice.bind(this);
  }

  // Begin scanning for hardware devices in the vicinity
  componentWillMount() {
    // Native module listener will constantly update deviceList
    NativeAppEventEmitter.addListener('DevicesFound', deviceList => this.setState({ deviceList }));

    DeviceManagementService.scanForDevices(error => {
      if (error) {
        Alert.alert('Error', 'Unable to scan for devices', [{
          text: 'Try Again',
          onPress: this.props.navigator.popToTop,
        }]);
      } else {
        this.setState({ inProgress: true });
      }
    });
  }

  componentWillUnmount() {
    NativeAppEventEmitter.removeAllListeners('DevicesFound');

    // Stop device scanning in case a scan is in progress
    DeviceManagementService.stopScanForDevices();
  }

  // Saves the selected device and attempts to connect to it
  selectDevice(deviceData) {
    DeviceManagementService.selectDevice(deviceData.identifier, (error) => {
      if (error) {
        // Do something about the select device error
      } else {
        // Navigate to DeviceConnect where it'll attempt to connect
        this.props.navigator.replace(routes.deviceConnect);
      }
    });
  }

  // Formats row data and displays it in a component
  formatDeviceRow(rowData) {
    // Pressing on a row will select device and attempt connect
    return (
      <View onPress={() => this.selectDevice(rowData)}>
        <Text style={styles.deviceName}>{rowData.name}</Text>
        <Text style={styles.deviceID}>{rowData.identifier}</Text>
      </View>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        { this.state.inProgress && <Spinner /> }
        <List
          dataBlob={this.state.deviceList}
          formatRowData={this.formatDeviceRow}
          onPressRow={this.selectDevice}
        />
      </View>
    );
  }
}

export default DeviceScan;
