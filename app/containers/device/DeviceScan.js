import React, { Component, PropTypes } from 'react';
import {
  View,
  Alert,
  NativeModules,
  NativeEventEmitter,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import autobind from 'autobind-decorator';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from '../../styles/device';
import List from '../../containers/List';
import BodyText from '../../components/BodyText';
import HeadingText from '../../components/HeadingText';
import SecondaryText from '../../components/SecondaryText';
import theme from '../../styles/theme';
import routes from '../../routes';
import constants from '../../utils/constants';
import Mixpanel from '../../utils/Mixpanel';

const { DeviceManagementService } = NativeModules;
const deviceManagementServiceEvents = new NativeEventEmitter(DeviceManagementService);
const { ON, OFF, TURNING_ON, TURNING_OFF } = constants.bluetoothStates;

const DeviceConnectHelp = props => (
  <View style={styles.helpContainer}>
    <HeadingText size={2}>
      {/* I'll add the ' at the end because unclosed ' messes with my IDE.*/}
      Dont see your Backbone device?
    </HeadingText>
    <BodyText style={styles._helpItems}>
      1. Make sure your Backbone device and smartphone are close to each other.
    </BodyText>
    <BodyText style={styles._helpItems}>
      2. Fully charge the Backbone device using the provided USB cable.
    </BodyText>
    <BodyText style={styles._helpItems}>
      3. Unpair the Backbone device with any other smartphones.
    </BodyText>
    <TouchableOpacity onPress={() => props.navigator.replace(routes.support)}>
      <SecondaryText style={styles._helpSupport}>Need more help?</SecondaryText>
    </TouchableOpacity>
  </View>
);

DeviceConnectHelp.propTypes = {
  navigator: PropTypes.shape({
    replace: PropTypes.func,
  }),
};

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
      // true for the initial scan when component mounts
      inProgress: true,
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

  /**
   * Toggles the RefreshControl, clears the deviceList, and initiates scanning
   */
  @autobind
  onRefresh() {
    this.setState({
      inProgress: true,
      deviceList: [],
    });
    this.initiateScanning();
  }

  /**
   * Initiates a 5 second scanning for Backbone devices.
   */
  @autobind
  initiateScanning() {
    // Initiate scanning
    Mixpanel.track('scanForDevices');
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

        Mixpanel.trackError({
          errorContent: error,
          path: 'app/containers/device/DeviceScan',
          stackTrace: ['initiateScanning', 'DeviceManagementService.scanForDevices'],
        });
      } else {
        setTimeout(() => {
          DeviceManagementService.stopScanForDevices();
          this.setState({ inProgress: false });
        }, 5000);
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
    // Send user back to DeviceConnect route with selected device identifier
    this.props.navigator.replace(
      Object.assign({}, routes.deviceConnect, { deviceIdentifier: deviceData.identifier })
    );
  }

 /**
   * Formats device data into a list item row
   * @param {Object}  rowData  Device data for a single row
   */
  @autobind
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
    const { bluetoothStates } = constants;
    const { navigator } = this.props;

    return (
      <View style={styles.container}>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={inProgress}
              onRefresh={this.onRefresh}
              colors={[theme.primaryColor]}
              tintColor={theme.primaryColor}
            />
          }
        >
          <SecondaryText style={{ textAlign: 'center' }}>
            {inProgress ? 'Refreshing...' : 'Pull down to refresh...'}
          </SecondaryText>
          { (!inProgress && deviceList.length === 0) &&
            <DeviceConnectHelp navigator={navigator} />
          }
          <List
            dataBlob={deviceList}
            formatRowData={this.formatDeviceRow}
            onPressRow={
              this.props.bluetoothState === bluetoothStates.ON ? this.selectDevice : null
            }
          />
        </ScrollView>
      </View>
    );
  }
}

const mapStateToProps = state => {
  const { app } = state;
  return app;
};

export default connect(mapStateToProps)(DeviceScan);
