import React, { Component, PropTypes } from 'react';
import {
  View,
  Alert,
  NativeModules,
  NativeEventEmitter,
} from 'react-native';
import autobind from 'autobind-decorator';
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
const deviceManagementServiceEvents = new NativeEventEmitter(DeviceManagementService);
const { ON, OFF, TURNING_ON, TURNING_OFF } = constants.bluetoothStates;

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
      deviceList: [],
      inProgress: false,
    };

    this.devicesFoundListener = null;
  }

  componentWillMount() {
    // Set listener for updating deviceList with discovered devices
    this.devicesFoundListener = deviceManagementServiceEvents.addListener(
      'DevicesFound',
      deviceList => this.setState({ deviceList }),
    );

    if (this.props.bluetoothState === ON) {
      // Bluetooth is on, initiate scanning
      this.initiateScanning();
    } else {
      // Remind user that their Bluetooth is off
      Alert.alert('Error', 'Unable to scan. Turn Bluetooth on first');
    }
  }

  componentWillReceiveProps(nextProps) {
    const currentBluetoothState = this.props.bluetoothState;
    const newBluetoothState = nextProps.bluetoothState;
    if ((currentBluetoothState === OFF || currentBluetoothState === TURNING_ON)
      && newBluetoothState === ON) {
      // User has switched Bluetooth on, initiate scanning
      this.initiateScanning();
    } else if (currentBluetoothState === ON &&
      (newBluetoothState === OFF || newBluetoothState === TURNING_OFF)) {
      // User has switched Bluetooth off, stop scanning
      this.setState({ inProgress: false }, DeviceManagementService.stopScanForDevices);
    }
  }

  componentWillUnmount() {
    // Remove listener
    this.devicesFoundListener.remove();

    // Stop scanning for devices
    DeviceManagementService.stopScanForDevices();
  }

  @autobind
  initiateScanning() {
    // Initiate scanning
    DeviceManagementService.scanForDevices(error => {
      if (error) {
        Alert.alert(
          'Error',
          'Unable to scan.', // Add error message here (if available)
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
   * @param {Object} deviceData Selected device's data
   */
  @autobind
  selectDevice(deviceData) {
    // Stop scanning, since device has been selected
    DeviceManagementService.stopScanForDevices();
    // Send user back to DeviceConnect route with selected device UUID
    this.props.navigator.replace(
      Object.assign({}, routes.deviceConnect, { deviceUUID: deviceData.identifier })
    );
  }

 /**
   * Formats device data into a list item row
   * @param {Object}  rowData  Device data for a single row
   */
  formatDeviceRow(rowData) {
    return (
      <View style={styles.cardStyle}>
        <View style={styles.textContainer}>
          <BodyText>{rowData.name}</BodyText>
          <SecondaryText style={styles._secondaryText}>
            {rowData.identifier}
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
