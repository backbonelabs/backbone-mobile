import React, { Component } from 'react';

import {
  View,
  Text,
  Alert,
  NativeModules,
  NativeAppEventEmitter,
} from 'react-native';
import { connect } from 'react-redux';
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
      pop: PropTypes.func,
    }),
    dispatch: PropTypes.func,
    inProgress: PropTypes.bool,
    errorMessage: PropTypes.string,
  };


  constructor() {
    super();
    this.state = {
      deviceList: [],
    };
    this.selectDevice = this.selectDevice.bind(this);
  }

  // Begin scanning for hardware devices in the vicinity
  componentWillMount() {
    NativeAppEventEmitter.addListener('DevicesFound', deviceList => this.setState({ deviceList }));

    DeviceManagementService.scanForDevices(error => {
      if (error) {
        this.deviceError(error);
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    // Check for error message
    if (!this.props.errorMessage && nextProps.errorMessage) {
      Alert.alert(
        'Error',
        nextProps.errorMessage,
        [{ text: 'OK', onPress: () => this.props.navigator.pop() }]
      );
    }
  }

  componentWillUnmount() {
    NativeAppEventEmitter.removeAllListeners('DevicesFound');

    // Stop device scanning in case a scan is in progress
    DeviceManagementService.stopScanForDevices();
  }

  // Calls selectDevice action with the deviceData identifier
  // in order to specify which device to connect to
  selectDevice(deviceData) {
    DeviceManagementService.selectDevice(deviceData.identifier, (error) => {
      if (error) {
        // Do something about the select device error
      } else {
        this.props.navigator.replace(routes.deviceConnect);
      }
    });
  }

  // Formats row data and displays it in a component
  formatDeviceRow(rowData) {
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
        <Spinner />
        <List
          dataBlob={this.state.deviceList || []}
          formatRowData={this.formatDeviceRow}
          onPressRow={this.selectDevice}
        />
      </View>
    );
  }
}

const mapStateToProps = state => {
  const { app } = state;
  return app;
};

export default connect(mapStateToProps)(DeviceScan);
