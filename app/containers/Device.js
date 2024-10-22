import React, { Component, PropTypes } from 'react';
import {
  Image,
  View,
  InteractionManager,
  NativeModules,
  NativeEventEmitter,
  Platform,
} from 'react-native';
import autobind from 'class-autobind';
import ReactNativeFS from 'react-native-fs';
import { connect } from 'react-redux';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import appActions from '../actions/app';
import deviceActions from '../actions/device';
import deviceOrangeIcon from '../images/settings/device-orange-icon.png';
import deviceLowBatteryIcon from '../images/settings/device-low-battery-icon.png';
import deviceFirmwareIcon from '../images/settings/device-firmware-icon.png';
import deviceSpinnerGif from '../images/settings/device-spinner.gif';
import deviceSuccessIcon from '../images/settings/device-success-icon.png';
import deviceErrorIcon from '../images/settings/device-error-icon.png';
import deviceWarningIcon from '../images/settings/device-warning-icon.png';
import styles from '../styles/deviceSettings';
import theme from '../styles/theme';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import BodyText from '../components/BodyText';
import HeadingText from '../components/HeadingText';
import routes from '../routes';
import constants from '../utils/constants';
import Fetcher from '../utils/Fetcher';
import Mixpanel from '../utils/Mixpanel';

const { firmwareUpdateStates: {
  INVALID_SERVICE,
  INVALID_FILE,
  BEGIN,
  END_SUCCESS,
  END_ERROR,
} } = constants;

const {
  BootLoaderService,
  Environment,
} = NativeModules;

const eventEmitter = new NativeEventEmitter(BootLoaderService);
const baseFirmwareUrl = `${Environment.API_SERVER_URL}/firmware`;
const isiOS = Platform.OS === 'ios';

const getBatteryIcon = (batteryLevel) => {
  let batteryIcon;
  if (batteryLevel >= 90) {
    batteryIcon = 'battery-full';
  } else if (batteryLevel >= 75) {
    batteryIcon = 'battery-three-quarters';
  } else if (batteryLevel >= 50) {
    batteryIcon = 'battery-half';
  } else if (batteryLevel >= 25) {
    batteryIcon = 'battery-quarter';
  } else {
    batteryIcon = 'battery-empty';
  }
  return batteryLevel < 25 ?
    <FontAwesomeIcon name={batteryIcon} style={styles.batteryIconRed} /> :
      <FontAwesomeIcon name={batteryIcon} style={styles.batteryIconBlack} />;
};

class Device extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    navigator: PropTypes.shape({
      push: PropTypes.func,
      replace: PropTypes.func,
    }),
    isConnected: PropTypes.bool,
    isConnecting: PropTypes.bool,
    inProgress: PropTypes.bool,
    hasPendingUpdate: PropTypes.bool,
    device: PropTypes.shape({
      deviceMode: PropTypes.number,
      batteryLevel: PropTypes.number,
      firmwareVersion: PropTypes.string,
    }),
  };

  constructor(props) {
    super(props);
    autobind(this);

    this.state = {
      isUpdating: false,
      isUpdateMode: false,
      updateProgress: 0,
      updateSuccess: false,
    };

    this.firmwareUpdateStatus = null;
    this.firmwareUploadProgress = null;
    this.firmwareUpdateErrorMessage = 'Connection Lost';
  }

  componentWillMount() {
    // Listen for firmware update status
    this.firmwareUpdateStatus = eventEmitter.addListener(
      'FirmwareUpdateStatus',
      this.firmwareUpdateStatusHandler,
    );

    // Listen for firmware upload progress
    this.firmwareUploadProgress = eventEmitter.addListener(
      'FirmwareUploadProgress',
      this.firmwareUploadProgressHandler,
    );
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      // Initiate firmware update on devices with bootloader issues
      if (this.props.isConnected && this.props.hasPendingUpdate) {
        this.props.dispatch(deviceActions.unsetPendingUpdate());
        this.initiateFirmwareUpdate();
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.device.firmwareVersion && !nextProps.device.firmwareVersion) {
      // Redirect back to Settings scene when no device is being paired with
      this.props.navigator.replace(routes.settings);
    } else if (this.props.isConnected && !nextProps.isConnected && this.state.isUpdating) {
      // Firmware update has failed due to disconnected device
      this.setState({ isUpdating: false, updateSuccess: false }, () => {
        this.failedUpdateHandler(new Error(this.firmwareUpdateErrorMessage));
      });

      Mixpanel.trackWithProperties('firmwareUpdate-error', { message: 'Device disconnected' });
    } else if (!this.state.isUpdating && nextProps.hasPendingUpdate) {
      this.props.dispatch(deviceActions.unsetPendingUpdate());
      this.initiateFirmwareUpdate();
    }
  }

  componentWillUnmount() {
    BootLoaderService.setHasPendingUpdate(false);
    this.firmwareUpdateStatus.remove();
    this.firmwareUploadProgress.remove();
  }

  firmwareUpdateStatusHandler(status) {
    const { status: firmwareStatus, code: errorCode, command: currentCommand } = status;

    if (firmwareStatus === BEGIN) {
      this.setState({ isUpdating: true });
    } else if (firmwareStatus === END_SUCCESS) {
      // Firmware update has finished, display firmware update status message
      this.setState({
        isUpdating: false,
        updateSuccess: true,
      }, this.successfulUpdateHandler);
    } else if (firmwareStatus === END_ERROR) {
      this.setState({ isUpdating: false }, () => {
        this.failedUpdateHandler(new Error(
          `Operation Code: ${currentCommand}. Error code ${errorCode}.`
        ));
      });
    } else if (firmwareStatus === INVALID_FILE) {
      this.setState({ isUpdating: false }, () => {
        this.failedUpdateHandler(new Error(
          'Invalid firmware file'
        ));
      });
    } else if (firmwareStatus === INVALID_SERVICE) {
      this.setState({ isUpdating: false }, () => {
        this.failedUpdateHandler(new Error(
          'Bootloader is not available'
        ));
      });
    }
  }

  firmwareUploadProgressHandler(progress) {
    // Set state to firmware progress percentage
    this.setState({ updateProgress: progress.percentage });
  }

  successfulUpdateHandler() {
    BootLoaderService.setHasPendingUpdate(false);

    this.props.dispatch(deviceActions.firmwareUpdateEnded());

    // Fetch latest device information
    // The final steps for a successful firmware update will be done in componentWillReceiveProps
    this.props.dispatch(deviceActions.getInfo());
  }

  /**
   * Handles firmware update errors. The error is sent to Mixpanel and an alert is displayed
   * to the user.
   * @param {Error} err
   */
  failedUpdateHandler(err) {
    BootLoaderService.setHasPendingUpdate(false);

    this.props.dispatch(deviceActions.firmwareUpdateEnded());

    Mixpanel.trackWithProperties('firmwareUpdate-error', { message: err.message });
    this.firmwareUpdateErrorMessage = err.message;
  }

  connectDevice() {
    this.props.dispatch(deviceActions.getInfo());
  }

  unpairDevice() {
    // Prompt user to confirm that they want to unpair device
    this.props.dispatch(appActions.showPartialModal({
      topView: (<Image source={deviceWarningIcon} />),
      title: { caption: 'Disconnect Device?' },
      detail: { caption: 'Are you sure you want to disconnect your BACKBONE?' },
      buttons: [
        {
          caption: 'DISCONNECT',
          onPress: () => {
            this.props.dispatch(appActions.hidePartialModal());
            this.props.dispatch(deviceActions.forget());
          },
        },
        { caption: 'CANCEL' },
      ],
      backButtonHandler: () => {
        this.props.dispatch(appActions.hidePartialModal());
      },
    }));
  }

  showBluetoothError() {
    this.props.dispatch(appActions.showPartialModal({
      title: {
        caption: 'Error',
        color: theme.warningColor,
      },
      detail: {
        caption: 'Bluetooth is off. Turn on Bluetooth before continuing.',
      },
      buttons: [
        {
          caption: 'OK',
          onPress: () => {
            this.props.dispatch(appActions.hidePartialModal());
          },
        },
      ],
      backButtonHandler: () => {
        this.props.dispatch(appActions.hidePartialModal());
      },
    }));
  }

  initiateFirmwareUpdate() {
    this.setState({
      isUpdating: true,
      isUpdateMode: true,
      updateProgress: 0,
      updateSuccess: false,
    });

    this.props.dispatch(deviceActions.firmwareUpdateStarted());

    BootLoaderService.setHasPendingUpdate(true);

    const device = this.props.device;
    // If the firmwareVersion data doesn't exist, use default value.
    // When a device is booted into the bootloader mode, whether it has been previously unpaired
    // or it is simply a brand new device with bootloader issue,
    // the value of the firmwareVersion data could be empty.
    const firmwareVersion = device.firmwareVersion ? device.firmwareVersion : '1.0.2.0';
    // major software version is Y in W.X.Y.Z
    const currentFirmware = firmwareVersion.split('.');
    const majorSoftwareVersion = currentFirmware[2];
    const firmwareUrl = `${baseFirmwareUrl}/v${majorSoftwareVersion}`;
    // Local filepath to firmware
    const firmwareFilepath = `${ReactNativeFS.DocumentDirectoryPath}/Backbone.cyacd`;

    // Download firmware and begin update process
    Mixpanel.track('firmwareUpdate-begin');
    Fetcher.get({ url: firmwareUrl })
      .then(res => (
        res.json()
          .then(body => (
            ReactNativeFS.downloadFile({
              fromUrl: body.url,
              toFile: firmwareFilepath,
            })
          ))
          .then(result => result.promise)
          .then(downloadResult => {
            const statusCode = downloadResult.statusCode;
            if (statusCode === 200) {
              // Successful file download attempt
              BootLoaderService.initiateFirmwareUpdate(firmwareFilepath);
            } else {
              throw new Error(
                `Failed to download firmware. Received status code ${statusCode}.`
              );
            }
          })
      ))
      .catch(this.failedUpdateHandler);
  }

  updateFirmware() {
    const { batteryLevel } = this.props.device;
    if (!this.props.isConnected) {
      this.props.dispatch(appActions.showPartialModal({
        title: {
          caption: 'Error',
          color: theme.warningColor,
        },
        detail: {
          caption: 'Please connect to your BACKBONE before updating.',
        },
        buttons: [
          {
            caption: 'Cancel',
            onPress: () => {
              this.props.dispatch(appActions.hidePartialModal());
            },
          },
          {
            caption: 'Connect',
            onPress: () => {
              this.props.dispatch(appActions.hidePartialModal());
              this.props.navigator.push(routes.deviceScan);
            },
          },
        ],
        backButtonHandler: () => {
          this.props.dispatch(appActions.hidePartialModal());
        },
      }));
    } else if (batteryLevel >= 0 && batteryLevel <= 15) {
      this.props.dispatch(appActions.showPartialModal({
        title: {
          caption: 'Battery Low',
          color: theme.warningColor,
        },
        detail: {
          caption: 'Charge your BACKBONE to at least 15% power before updating.',
        },
        buttons: [
          {
            caption: 'OK',
            onPress: () => {
              this.props.dispatch(appActions.hidePartialModal());
            },
          },
        ],
        backButtonHandler: () => {
          this.props.dispatch(appActions.hidePartialModal());
        },
      }));
    } else {
      this.props.dispatch(appActions.showPartialModal({
        title: {
          caption: 'Attention',
          color: theme.warningColor,
        },
        detail: {
          caption: 'You must complete the firmware update once it begins!',
        },
        buttons: [
          {
            caption: 'Cancel',
            onPress: () => {
              this.props.dispatch(appActions.hidePartialModal());
            },
          },
          {
            caption: 'Update',
            onPress: () => {
              // Exit the current session
              this.initiateFirmwareUpdate();
              this.props.dispatch(appActions.hidePartialModal());
            },
          },
        ],
        backButtonHandler: () => {
          this.props.dispatch(appActions.hidePartialModal());
        },
      }));
    }
  }

  render() {
    const { device, inProgress, isConnecting, isConnected } = this.props;
    const { updateAvailable, batteryLevel } = device;
    const { isUpdating, isUpdateMode, updateSuccess, updateProgress } = this.state;

    let mainDeviceStatusText;
    let subDeviceStatusText;
    let deviceIdentifier = device.identifier;

    if (isiOS) {
      deviceIdentifier = device.identifier.substr(device.identifier.lastIndexOf('-') + 1);
    }

    if (!isConnected) {
      mainDeviceStatusText = (
        <View style={styles.deviceStatus}>
          <BodyText>
            Make sure your device is close by and charged.
          </BodyText>
        </View>
      );

      subDeviceStatusText = (
        <View style={styles.deviceInfo}>
          <BodyText style={styles.deviceInfoText}>
            Device: { deviceIdentifier || 'n/a' }
          </BodyText>
          <BodyText style={styles.deviceInfoText}>
            Version: { device.firmwareVersion || 'n/a' }
          </BodyText>
        </View>
      );
    } else if (isUpdateMode) {
      if (isUpdating) {
        mainDeviceStatusText = (
          <View style={styles.deviceStatus}>
            <BodyText>
              {updateProgress === 100 ? 'Firmware updated. Rebooting device...' :
              `${updateProgress}% COMPLETED`}
            </BodyText>
          </View>
        );

        subDeviceStatusText = (
          <View>
            <BodyText style={styles.firmwareUpdateInfoText}>
              Please do not disconnect your BACKBONE during
              the firmware update.
            </BodyText>
          </View>
        );
      } else if (updateSuccess) {
        mainDeviceStatusText = (
          <View style={styles.deviceStatus}>
            <BodyText style={styles.green}>
              FIRMWARE UPDATE COMPLETED
            </BodyText>
          </View>
        );

        subDeviceStatusText = (
          <View style={styles.deviceInfo}>
            <BodyText style={styles.deviceInfoText}>
              Device: { deviceIdentifier || 'n/a' }
            </BodyText>
            <BodyText style={styles.deviceInfoText}>
              Version: { device.firmwareVersion || 'n/a' }
            </BodyText>
          </View>
        );
      } else {
        mainDeviceStatusText = (
          <View style={styles.deviceStatus}>
            <BodyText style={styles.red}>
              FIRMWARE UPDATE FAILED
            </BodyText>
          </View>
        );

        subDeviceStatusText = (
          <View>
            <BodyText style={styles.firmwareUpdateInfoText}>
              Make sure your device is close by, at least 15% charged and that
              you have an internet connection.
            </BodyText>
          </View>
        );
      }
    } else {
      mainDeviceStatusText = (
        <View style={styles.batteryInfo}>
          <BodyText
            style={batteryLevel < 25 ? styles.red : null}
          >
            { batteryLevel || '--' }%{'  '}
          </BodyText>
          {getBatteryIcon(batteryLevel)}
        </View>
      );

      subDeviceStatusText = (
        <View style={styles.deviceInfo}>
          <BodyText style={styles.deviceInfoText}>
            Device: { deviceIdentifier || 'n/a' }
          </BodyText>
          <BodyText style={styles.deviceInfoText}>
            Version: { device.firmwareVersion || 'n/a' }
          </BodyText>
        </View>
      );
    }

    let deviceStatusImage;

    if (!isConnected) {
      deviceStatusImage = deviceErrorIcon;
    } else if (isUpdateMode) {
      if (isUpdating) {
        deviceStatusImage = deviceSpinnerGif;
      } else if (updateSuccess) {
        deviceStatusImage = deviceSuccessIcon;
      } else {
        deviceStatusImage = deviceErrorIcon;
      }
    } else if (updateAvailable) {
      deviceStatusImage = deviceFirmwareIcon;
    } else if (batteryLevel < 25) {
      deviceStatusImage = deviceLowBatteryIcon;
    } else {
      deviceStatusImage = deviceOrangeIcon;
    }

    return (inProgress || isConnecting) && !isUpdateMode ?
      <Spinner />
      :
        <View>
          <View style={styles.deviceInfoContainer}>
            <HeadingText size={3} style={styles.deviceConnectionText}>
              {!isConnected ? 'Disconnected from ' : 'Connected to '}BACKBONE
            </HeadingText>
            <Image source={deviceStatusImage} style={styles.deviceStatusImage} />
            {mainDeviceStatusText}
            {subDeviceStatusText}
          </View>
          <View style={styles.buttonContainer}>
            { isConnected ?
              <Button
                primary
                style={styles.button}
                text="DISCONNECT"
                onPress={this.unpairDevice}
                disabled={isUpdating}
              />
              :
                <Button
                  primary
                  text="UNPAIR"
                  onPress={this.unpairDevice}
                />
            }
            { isConnected ?
              <Button
                primary
                style={styles.button}
                text="UPDATE"
                onPress={this.updateFirmware}
                disabled={!device.updateAvailable || isUpdating}
              />
              :
                <Button
                  primary
                  style={styles.button}
                  text="CONNECT"
                  onPress={this.connectDevice}
                />
            }
          </View>
        </View>;
  }
}

const mapStateToProps = state => {
  const { device } = state;
  return device;
};

export default connect(mapStateToProps)(Device);
