import React, { Component, PropTypes } from 'react';
import {
  View,
  Alert,
  NativeModules,
  NativeEventEmitter,
  TouchableOpacity,
  Image,
  Text,
} from 'react-native';
import autobind from 'class-autobind';
import { connect } from 'react-redux';
import uniqBy from 'lodash/uniqBy';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from '../../styles/onBoardingFlow/deviceSetup';
import List from '../../containers/List';
import BodyText from '../../components/BodyText';
import Button from '../../components/Button';
import SecondaryText from '../../components/SecondaryText';
import Spinner from '../../components/Spinner';
import theme from '../../styles/theme';
import routes from '../../routes';
import constants from '../../utils/constants';
import SensitiveInfo from '../../utils/SensitiveInfo';
import Mixpanel from '../../utils/Mixpanel';
import deviceActions from '../../actions/device';
import reception1 from '../../images/onboarding/reception-icon-1.png';
import reception2 from '../../images/onboarding/reception-icon-2.png';
import reception3 from '../../images/onboarding/reception-icon-3.png';
import reception4 from '../../images/onboarding/reception-icon-4.png';

const { BluetoothService, DeviceManagementService } = NativeModules;
const deviceManagementServiceEvents = new NativeEventEmitter(DeviceManagementService);
const { ON, OFF, TURNING_ON, TURNING_OFF } = constants.bluetoothStates;

/**
 * Returns a RSSI icon based on the RSSI strength
 * @param  {Integer} rssi
 * @return {Image}
 */
const getRssiIcon = (rssi) => {
  let iconSource;
  if (rssi > -65) {
    iconSource = reception4;
  } else if (rssi > -75 && rssi <= -65) {
    iconSource = reception3;
  } else if (rssi > -80 && rssi <= -75) {
    iconSource = reception2;
  } else {
    iconSource = reception1;
  }
  return <Image source={iconSource} style={styles.receptionIcon} />;
};

class DeviceScan extends Component {
  static propTypes = {
    navigator: PropTypes.shape({
      replace: PropTypes.func,
      push: PropTypes.func,
      getCurrentRoutes: PropTypes.func,
      pop: PropTypes.func,
    }),
    device: PropTypes.shape({
      identifier: PropTypes.string,
    }),
    bluetoothState: PropTypes.number,
    dispatch: PropTypes.func,
    isConnecting: PropTypes.bool,
    isConnected: PropTypes.bool,
    errorMessage: PropTypes.string,
    showSkip: PropTypes.bool,
  };

  constructor() {
    super();
    autobind(this);
    this.state = {
      // List's data source
      deviceList: [],
      inProgress: false,
      selectedIdentifier: null,
    };

    this.scanTimeout = null;
    this.devicesFoundListener = null;
  }

  componentWillMount() {
    // If there is a device in our store
    if (this.props.device.identifier) {
      this.setState(() => ({
        deviceList: this.state.deviceList.concat(this.props.device),
        selectedIdentifier: this.props.device.identifier,
      }));
    }

    // Set listener for updating deviceList with discovered devices
    this.devicesFoundListener = deviceManagementServiceEvents.addListener(
      'DevicesFound',
      deviceList => {
        if (this.props.device.identifier) {
          return this.setState(() => ({
            deviceList: uniqBy([this.props.device, ...deviceList], 'identifier'),
          }));
        }
        return this.setState({ deviceList });
      }
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
      this.setState(() => ({ inProgress: false, deviceList: [], selectedIdentifier: null }), () => {
        DeviceManagementService.stopScanForDevices();
      });
    }

    // After connecting
    // if previous route is deviceSetup, replace with howtovideo
    // else go back to previous route
    if (!this.props.isConnected && nextProps.isConnected) {
      const routeStack = this.props.navigator.getCurrentRoutes();
      const lastRoute = routeStack[routeStack.length - 2];
      if (lastRoute.name === 'deviceSetup') {
        return this.props.navigator.replace(routes.howToVideo);
      }
      return this.props.navigator.pop();
    }
  }

  componentWillUnmount() {
    // Remove listener
    this.devicesFoundListener.remove();

    // Clears the device scan timer
    clearTimeout(this.scanTimeout);

    // Stop scanning for devices
    DeviceManagementService.stopScanForDevices();
  }

  /**
   * Initiates a 5 second scanning for Backbone devices.
   */
  initiateScanning() {
    if (this.state.inProgress || this.props.isConnecting ||
      (this.props.bluetoothState === constants.bluetoothStates.OFF)
    ) {
      return;
    }

    this.setState({ inProgress: true });
    Mixpanel.track('scanForDevices');
    DeviceManagementService.scanForDevices(error => {
      if (error) {
        this.setState({ inProgress: false });

        Mixpanel.trackError({
          errorContent: error,
          path: 'app/containers/device/DeviceScan',
          stackTrace: ['initiateScanning', 'DeviceManagementService.scanForDevices'],
        });
      } else {
        this.scanTimeout = setTimeout(() => {
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
  selectDevice(deviceData) {
    // if a device is currently connecting, don't interrupt
    if (this.props.isConnecting) {
      return;
    }

    // if there is a connected device, disconnect it before connecting another device
    if (this.props.isConnected) {
      this.props.dispatch(deviceActions.disconnect());
    }

    this.setState({ selectedIdentifier: deviceData.identifier });

    // Stop scanning, since device has been selected
    DeviceManagementService.stopScanForDevices();

    BluetoothService.getState((error, { state }) => {
      if (!error) {
        if (state === ON) {
          // If deviceIdentifier is truthy, attempt to connect to specified device
          if (deviceData.identifier) {
            return this.props.dispatch(deviceActions.connect(deviceData.identifier));
          }

          // Attempt to use saved device identifier, if any
          return SensitiveInfo.getItem(constants.storageKeys.DEVICE)
            .then(savedDevice => {
              if (savedDevice) {
                return this.props.dispatch(deviceActions.connect(savedDevice.identifier));
              }
            });
        }
      }

      return Alert.alert('Error', 'Bluetooth is off. Turn on Bluetooth before continuing.');
    });
  }

 /**
   * Formats device data into a list item row
   * @param {Object}  rowData  Device data for a single row
   */
  formatDeviceRow(rowData) {
    const { selectedIdentifier } = this.state;
    const { isConnected, isConnecting, device } = this.props;
    let message = null;
    let messageColor = theme.primaryFontColor;
    let icon = getRssiIcon(rowData.RSSI);
    const connecting = isConnecting && (selectedIdentifier === rowData.identifier);
    const connected = isConnected &&
    ((device.identifier || selectedIdentifier) === rowData.identifier);

    // row icons
    const spinner = <Spinner style={styles.spinner} color={'#66BB6A'} size="small" />;
    const iconCheck = <Icon name={'check'} color={'#66BB6A'} size={25} />;

    if (connecting) {
      message = 'CONNECTING...';
      messageColor = theme.secondaryFontColor;
      icon = spinner;
    } else if (connected) {
      message = 'CONNECTED!';
      messageColor = '#66BB6A';
      icon = iconCheck;
    }

    return (
      <View style={styles.deviceRow}>
        <Text style={styles._deviceName}>
          {rowData.identifier.substr(-12)}
        </Text>
        <Text style={[styles._deviceMessage, { color: messageColor }]}>
          {message}
        </Text>
        {icon}
      </View>
    );
  }

  skip() {
    this.props.navigator.push(routes.howToVideo);
  }

  render() {
    const { inProgress, deviceList } = this.state;
    const { bluetoothStates } = constants;
    const { isConnecting, errorMessage } = this.props;
    const btn = inProgress ? 'SCANNING...' : 'SCAN FOR MORE DEVICES';
    const isBluetoothOn = this.props.bluetoothState === bluetoothStates.ON;

    return (
      <View style={styles._container}>
        <BodyText style={styles._deviceScan_header}>
          Setup a device to connect
        </BodyText>
        <View style={styles.innerContainer}>
          <View style={styles.deviceContainer}>
            {
              !inProgress && (deviceList.length === 0 || !isBluetoothOn) ?
                <View style={styles.devicesNotFound}>
                  <Icon
                    name={'error-outline'}
                    size={100}
                    color={'#E0E0E0'}
                    style={styles.devicesNotFoundIcon}
                  />
                  <BodyText style={styles._deviceNotFoundText}>No Devices Found</BodyText>
                  { errorMessage ? <BodyText style={styles._deviceNotFoundErrorText}>
                    {errorMessage}</BodyText> : null }
                </View> : null
            }
            {
              inProgress && (deviceList.length === 0 || !isBluetoothOn) ?
                <Spinner style={styles.devicesNotFound} color={'#66BB6A'} size="large" /> : null
            }
            <List
              containerStyle={{ flex: 1 }}
              dataBlob={deviceList}
              formatRowData={this.formatDeviceRow}
              onPressRow={
                  isBluetoothOn ? this.selectDevice : null
                }
            />
          </View>
        </View>
        <View style={styles.btnContainer}>
          <View style={styles.CTAContainer}>
            <Button
              onPress={this.initiateScanning}
              style={styles._CTAButton}
              text={btn}
              primary
              disabled={inProgress || isConnecting ||
                (this.props.bluetoothState === bluetoothStates.OFF)}
            />
          </View>
          {
            this.props.showSkip ? <TouchableOpacity
              activeOpacity={0.4}
              onPress={this.skip}
            >
              <SecondaryText style={styles._skip}>
                Skip Setup
              </SecondaryText>
            </TouchableOpacity> : null
          }
        </View>
      </View>
    );
  }
}

const mapStateToProps = state => {
  const { app, device } = state;
  return { ...app, ...device };
};

export default connect(mapStateToProps)(DeviceScan);
