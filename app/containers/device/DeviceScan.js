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
import deviceActions from '../../actions/device';
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
    deviceList: PropTypes.array,
    dispatch: PropTypes.func,
    inProgress: PropTypes.bool,
    errorMessage: PropTypes.string,
  };


  constructor() {
    super();
    this.selectDevice = this.selectDevice.bind(this);
  }

  // Begin scanning for hardware devices in the vicinity
  componentWillMount() {
    console.log('device actions');
    this.props.dispatch(deviceActions.scan());
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
        this.props.dispatch({ type: 'SELECT_DEVICE__ERROR', error });
      } else {
        this.props.navigator.replace(routes.deviceConnect);
      }
    });
  }

  // Formats row data and displays it in a component
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
        { this.props.inProgress && <Spinner /> }
        <List
          dataBlob={this.props.deviceList || []}
          formatRowData={this.formatDeviceRow}
          onPressRow={this.selectDevice}
        />
      </View>
    );
  }
}

const mapStateToProps = state => {
  const { device } = state;
  return device;
};

export default connect(mapStateToProps)(DeviceScan);
