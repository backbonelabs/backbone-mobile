import React, { Component, PropTypes } from 'react';

import {
  View,
  Alert,
  NativeModules,
  NativeAppEventEmitter,
} from 'react-native';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from '../../styles/device';
import List from '../../containers/List';
import Spinner from '../../components/Spinner';
import BodyText from '../../components/BodyText';
import SecondaryText from '../../components/SecondaryText';
import theme from '../../styles/theme';
import routes from '../../routes';
import constants from '../../utils/constants';

const { DeviceManagementService } = NativeModules;
const { ON, OFF } = constants.bluetoothStates;

class DeviceScan extends Component {
  static propTypes = {
    navigator: PropTypes.shape({
      replace: PropTypes.func,
    }),
    bluetoothState: PropTypes.number,
  };

  constructor() {
    super();
    this.state = {
      // List's data source
      deviceList: [
        // Dummy data
        { deviceName: 'Backbone', identifier: 'd2f12936-a749-4da3-941c' },
        { deviceName: 'Backbone', identifier: 'd2f12936-a749-4da3-941c' },
        { deviceName: 'Backbone', identifier: 'd2f12936-a749-4da3-941c' },
      ],
      inProgress: false,
    };
    this.selectDevice = this.selectDevice.bind(this);
  }

  componentWillMount() {
    if (this.props.bluetoothState === ON) {
      // Bluetooth is on, initiate scanning
      this.initiateScanning();
    } else {
      // Remind user that their Bluetooth is off
      Alert.alert('Error', 'Unable to scan. Turn Bluetooth on first');
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.bluetoothState === OFF && nextProps.bluetoothState === ON) {
      // User has switched Bluetooth on, initiate scanning
      this.initiateScanning();
    } else if (this.props.bluetoothState === ON && nextProps.bluetoothState === OFF) {
      // User has switched Bluetooth off, stop scanning
      // TO DO: Call native module method to stop device scanning
      this.setState({ inProgress: false });
    }
  }

  componentWillUnmount() {
    // Remove listener
    NativeAppEventEmitter.removeAllListeners('DevicesFound');

    // Stop scanning
    DeviceManagementService.stopScanForDevices();
  }

  initiateScanning() {
    // Update deviceList with discovered devices
    NativeAppEventEmitter.addListener('DevicesFound', deviceList => (
      this.setState({ deviceList })
    ));

    // Initiate scanning
    DeviceManagementService.scanForDevices(error => {
      if (error) {
        Alert.alert(
          'Error',
          `Unable to scan. ${error.message}`,
          [
            { text: 'Cancel' },
            { text: 'Try Again', onPress: this.initiateScanning },
          ],
        );
      } else {
        this.setState({ inProgress: true });
      }
    });
  }

  /**
   * Selects a device to connect to
   * @param {Object}  deviceData  Selected device's data
   */
  selectDevice(deviceData) {
    DeviceManagementService.selectDevice(deviceData.identifier, error => {
      if (error) {
        Alert.alert(
          'Error',
          'Unable to connect',
          [{ text: 'Try Again' }],
        );
      } else {
        // Attempt connect to selected device
        this.props.navigator.replace(routes.deviceConnect);
      }
    });
  }

 /**
   * Formats device data into a list item row
   * @param {Object}  rowData  Device data for a single row
   */
  formatDeviceRow(rowData) {
    return (
      <View style={styles.cardStyle}>
        <View style={styles.textContainer}>
          <BodyText>{rowData.deviceName}</BodyText>
          <SecondaryText style={styles._secondaryText}>
            Unique ID: {rowData.identifier}
          </SecondaryText>
        </View>
        <Icon
          name="keyboard-arrow-right"
          size={styles._icon.height}
          color={theme.primaryFontColor}
        />
      </View>
    );
  }

  render() {
    const { inProgress, deviceList } = this.state;

    return (
      <View style={styles.container}>
        { inProgress &&
          <Spinner style={styles.spinner} />
        }
        <List
          dataBlob={deviceList}
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
