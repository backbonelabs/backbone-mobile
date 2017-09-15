import React, { Component, PropTypes } from 'react';
import {
  View,
  NativeModules,
  NativeEventEmitter,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import autobind from 'class-autobind';
import { connect } from 'react-redux';
import uniqBy from 'lodash/uniqBy';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from '../styles/onBoardingFlow/deviceSetup';
import List from '../containers/List';
import BodyText from '../components/BodyText';
import Button from '../components/Button';
import SecondaryText from '../components/SecondaryText';
import Spinner from '../components/Spinner';
import theme from '../styles/theme';
import routes from '../routes';
import constants from '../utils/constants';
import Mixpanel from '../utils/Mixpanel';
import deviceActions from '../actions/device';
import appActions from '../actions/app';
import reception1 from '../images/onboarding/reception-icon-1.png';
import reception2 from '../images/onboarding/reception-icon-2.png';
import reception3 from '../images/onboarding/reception-icon-3.png';
import reception4 from '../images/onboarding/reception-icon-4.png';

const { BluetoothService, DeviceManagementService } = NativeModules;
const deviceManagementServiceEvents = new NativeEventEmitter(DeviceManagementService);
const { ON, OFF, TURNING_ON, TURNING_OFF } = constants.bluetoothStates;
const isiOS = Platform.OS === 'ios';

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
    app: PropTypes.shape({
      bluetoothState: PropTypes.number,
    }),
    device: PropTypes.shape({
      device: PropTypes.shape({
        identifier: PropTypes.string,
      }),
      errorMessage: PropTypes.string,
      isConnecting: PropTypes.bool,
      isConnected: PropTypes.bool,
    }),
    navigator: PropTypes.shape({
      replace: PropTypes.func,
      push: PropTypes.func,
      getCurrentRoutes: PropTypes.func,
      pop: PropTypes.func,
    }),
    dispatch: PropTypes.func,
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
    Mixpanel.track('deviceScan');
    // If there is a device in our store
    if (this.props.device.device.identifier) {
      this.setState(() => ({
        deviceList: this.state.deviceList.concat(this.props.device),
        selectedIdentifier: this.props.device.device.identifier,
      }));
    }

    // Set listener for updating deviceList with discovered devices
    this.devicesFoundListener = deviceManagementServiceEvents.addListener(
      'DevicesFound',
      deviceList => {
        if (this.props.device.device.identifier) {
          return this.setState(() => ({
            deviceList: uniqBy([this.props.device, ...deviceList], 'identifier'),
          }));
        }
        return this.setState({ deviceList });
      }
    );

    if (this.props.app.bluetoothState === ON) {
      // Bluetooth is on, initiate scanning
      this.initiateScanning();
    } else {
      // Remind user that their Bluetooth is off
      this.props.dispatch(appActions.showPartialModal({
        title: {
          caption: 'Error',
          color: theme.warningColor,
        },
        detail: {
          caption: 'Unable to scan. Turn on Bluetooth first.',
        },
        buttons: [
          { caption: 'OKAY' },
        ],
        backButtonHandler: () => {
          this.props.dispatch(appActions.hidePartialModal());
        },
      }));
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.device.errorMessage && nextProps.device.errorMessage) {
      this.props.dispatch(appActions.showPartialModal({
        title: {
          caption: 'Error',
          color: theme.warningColor,
        },
        detail: {
          caption: nextProps.device.errorMessage,
        },
        buttons: [
          { caption: 'OKAY' },
        ],
        backButtonHandler: () => {
          this.props.dispatch(appActions.hidePartialModal);
        },
      }));
    }

    const currentBluetoothState = this.props.app.bluetoothState;
    const newBluetoothState = nextProps.app.bluetoothState;

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
    if (!this.props.device.isConnected && nextProps.device.isConnected) {
      const routeStack = this.props.navigator.getCurrentRoutes();
      const lastRoute = routeStack[routeStack.length - 2];
      if (lastRoute.name === routes.deviceSetup.name) {
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
    if (this.state.inProgress || this.props.device.isConnecting ||
      (this.props.app.bluetoothState === constants.bluetoothStates.OFF)
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
          path: 'app/containers/DeviceScan',
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
    if (this.props.device.isConnecting) {
      return;
    }

    // if there is a connected device, disconnect it before connecting another device
    if (this.props.device.isConnected) {
      this.props.dispatch(deviceActions.disconnect());
    }

    this.setState({ selectedIdentifier: deviceData.identifier });

    // Stop scanning, since device has been selected
    DeviceManagementService.stopScanForDevices();

    BluetoothService.getState((error, { state }) => {
      if (!error) {
        if (state === ON) {
          return this.props.dispatch(deviceActions.connect(deviceData.identifier));
        }
      }

      return this.props.dispatch(appActions.showPartialModal({
        title: {
          caption: 'Error',
          color: theme.warningColor,
        },
        detail: {
          caption: 'Bluetooth is off. Turn on Bluetooth before continuing.',
        },
        buttons: [
          { caption: 'OKAY' },
        ],
        backButtonHandler: () => {
          this.props.dispatch(appActions.hidePartialModal());
        },
      }));
    });
  }

 /**
   * Formats device data into a list item row
   * @param {Object}  rowData  Device data for a single row
   */
  formatDeviceRow(rowData) {
    const { selectedIdentifier } = this.state;
    const { isConnected, isConnecting, device } = this.props.device;
    let message = null;
    let messageColor = theme.primaryFontColor;
    let icon = getRssiIcon(rowData.RSSI);
    const connecting = isConnecting && (selectedIdentifier === rowData.identifier);
    const connected = isConnected &&
    ((device.identifier || selectedIdentifier) === rowData.identifier);

    // row icons
    const spinner = <Spinner style={styles.spinner} color={theme.secondaryColor} size="small" />;
    const iconCheck = <Icon name={'check'} color={'#66BB6A'} size={25} />;

    if (connecting) {
      message = 'CONNECTING...';
      messageColor = theme.secondaryFontColor;
      icon = spinner;
    } else if (connected) {
      message = 'CONNECTED!';
      messageColor = theme.green400;
      icon = iconCheck;
    }

    return (
      <View style={styles.deviceRow}>
        <BodyText>
          { isiOS ? rowData.identifier.substr(rowData.identifier.lastIndexOf('-') + 1)
          : rowData.identifier}
        </BodyText>
        <BodyText style={{ color: messageColor }}>
          {message}
        </BodyText>
        {icon}
      </View>
    );
  }

  skip() {
    if (this.props.device.isConnecting) {
      return;
    }

    this.props.navigator.push(routes.howToVideo);
    Mixpanel.track('deviceScan-skip');
  }

  render() {
    const { inProgress, deviceList } = this.state;
    const { bluetoothStates } = constants;
    const { isConnecting, errorMessage } = this.props.device;
    const btn = inProgress ? 'SCANNING...' : 'SCAN FOR MORE DEVICES';
    const isBluetoothOn = this.props.app.bluetoothState === bluetoothStates.ON;

    return (
      <View style={styles.container}>
        <BodyText style={styles.deviceScan_header}>
          Select a device
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
                  <BodyText style={styles.deviceNotFoundText}>No Devices Found</BodyText>
                  { errorMessage ? <BodyText style={styles.deviceNotFoundErrorText}>
                    {errorMessage}</BodyText> : null }
                </View> : null
            }
            {
              inProgress && (deviceList.length === 0) ?
                <Spinner
                  style={styles.devicesNotFound}
                  color={theme.secondaryColor}
                  size="large"
                /> : null
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
              style={styles.CTAButton}
              text={btn}
              primary
              disabled={inProgress || isConnecting ||
                (this.props.app.bluetoothState === bluetoothStates.OFF)}
            />
          </View>
          {
            this.props.showSkip ? <TouchableOpacity
              activeOpacity={0.4}
              onPress={this.skip}
            >
              <SecondaryText style={styles.skip}>
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
  return { app, device };
};

export default connect(mapStateToProps)(DeviceScan);
