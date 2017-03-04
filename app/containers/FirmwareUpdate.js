import React, { Component, PropTypes } from 'react';
import {
  View,
  Alert,
  NativeModules,
  NativeEventEmitter,
} from 'react-native';
import {
  MKProgress,
  MKSpinner,
} from 'react-native-material-kit';
import autobind from 'autobind-decorator';
import ReactNativeFS from 'react-native-fs';
import { connect } from 'react-redux';
import deviceActions from '../actions/device';
import HeadingText from '../components/HeadingText';
import BodyText from '../components/BodyText';
import styles from '../styles/firmwareUpdate';
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

const { BootLoaderService, Environment } = NativeModules;
const eventEmitter = new NativeEventEmitter(BootLoaderService);
const firmwareUrl = `${Environment.API_SERVER_URL}/firmware`;

const SingleColorSpinner = MKSpinner.singleColorSpinner()
  .withStyle(styles.spinner)
  .build();

class FirmwareUpdate extends Component {
  static propTypes = {
    navigator: PropTypes.shape({
      pop: PropTypes.func,
    }),
    dispatch: PropTypes.func,
    device: PropTypes.shape({
      inProgress: PropTypes.bool,
      device: PropTypes.shape({
        firmwareVersion: PropTypes.string,
      }),
    }),
  }

  constructor() {
    super();
    this.state = {
      isUpdating: null,
      updateProgress: 0,
      updateSuccess: false,
    };

    this.firmwareUpdateStatus = null;
    this.firmwareUploadProgress = null;
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

    BootLoaderService.setHasPendingUpdate(true);

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

  componentWillReceiveProps(nextProps) {
    if (!this.state.isUpdating && this.state.updateSuccess &&
      this.props.device.inProgress && !nextProps.device.inProgress) {
      // Firmware update completed successfully
      Mixpanel.track('firmwareUpdate-success');
      Alert.alert(
        'Success',
        'You have successfully updated your Backbone!',
      );

      // Automatically pop the scene without user interaction in case app is in the background
      // so the user won't be stuck on this component when the app is back in the foreground
      this.props.navigator.pop();
    }
  }

  componentWillUnmount() {
    BootLoaderService.setHasPendingUpdate(false);
    this.firmwareUpdateStatus.remove();
    this.firmwareUploadProgress.remove();
  }

  @autobind
  firmwareUpdateStatusHandler(status) {
    const { status: firmwareStatus } = status;

    if (firmwareStatus === BEGIN) {
      this.setState({ isUpdating: true });
    } else if (firmwareStatus === END_SUCCESS) {
      // Firmware update has finished, display firmware update status message
      this.setState({
        isUpdating: false,
        updateSuccess: true,
      }, this.successfulUpdateHandler);
    } else if (
      firmwareStatus === END_ERROR ||
      firmwareStatus === INVALID_FILE ||
      firmwareStatus === INVALID_SERVICE
    ) {
      this.setState({ isUpdating: false }, () => {
        this.failedUpdateHandler(new Error(
          `Error during firmware update. Received firmware status ${firmwareStatus}.`
        ));
      });
    }
  }

  @autobind
  firmwareUploadProgressHandler(progress) {
    // Set state to firmware progress percentage
    this.setState({ updateProgress: progress.percentage });
  }

  @autobind
  successfulUpdateHandler() {
    BootLoaderService.setHasPendingUpdate(false);

    // Fetch latest device information
    // The final steps for a successful firmware update will be done in componentWillReceiveProps
    this.props.dispatch(deviceActions.getInfo());
  }

  /**
   * Handles firmware update errors. The error is sent to Mixpanel and an alert is displayed
   * to the user.
   * @param {Error} err
   */
  @autobind
  failedUpdateHandler(err) {
    BootLoaderService.setHasPendingUpdate(false);

    Mixpanel.trackWithProperties('firmwareUpdate-error', { message: err.message });

    Alert.alert(
      'Failed',
      'Your Backbone update has failed, please try again.',
      [{ text: 'OK', onPress: this.props.navigator.pop }]
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <HeadingText size={2}>Update status</HeadingText>
          <View style={styles.progressContainer}>
            <MKProgress
              style={styles.progressBar}
              progress={this.state.updateProgress / 100}
              progressColor={styles.$progressColor}
              buffer={1}
              bufferColor={styles.$bufferColor}
            />
            {this.state.isUpdating &&
              <SingleColorSpinner strokeColor={styles.$spinnerColor} style={styles.spinner} />
            }
          </View>
          <BodyText>Progress: {this.state.updateProgress}%</BodyText>
        </View>
      </View>
    );
  }
}

const mapStateToProps = state => ({
  device: state.device,
});

export default connect(mapStateToProps)(FirmwareUpdate);
