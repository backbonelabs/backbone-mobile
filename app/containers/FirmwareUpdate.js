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
  }

  constructor() {
    super();
    this.state = {
      isUpdating: null,
      updateProgress: 0,
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
    this.updateFirmware();
  }

  componentWillUnmount() {
    BootLoaderService.setHasPendingUpdate(false);
    this.firmwareUpdateStatus.remove();
    this.firmwareUploadProgress.remove();
  }

  @autobind
  updateFirmware() {
    // Local filepath to firmware
    const firmwareFilepath = `${ReactNativeFS.DocumentDirectoryPath}/Backbone.cyacd`;

    return Fetcher.get({ url: firmwareUrl })
      .then(res => res.json()
        .then(body => (
          ReactNativeFS.downloadFile({
            fromUrl: body.url,
            toFile: firmwareFilepath,
          })
        ))
        .then(result => result.promise.then(downloadResult => {
          // Successful file download attempt
          if (downloadResult.statusCode === 200) {
            BootLoaderService.initiateFirmwareUpdate(firmwareFilepath);
          } else {
            this.failedUpdateHandler();
          }
        })
        // Handle network request error for firmware download
        .catch(this.failedUpdateHandler))
      )
      // Handle network request error for getting firmware URL
      .catch(this.failedUpdateHandler);
  }

  @autobind
  firmwareUpdateStatusHandler(status) {
    const { status: firmwareStatus } = status;

    if (firmwareStatus === BEGIN) {
      this.setState({ isUpdating: true });
    } else if (firmwareStatus === END_SUCCESS) {
      // Firmware update has finished, display firmware update status message
      this.setState({ isUpdating: false }, this.successfulUpdateHandler);
    } else if (
      firmwareStatus === END_ERROR ||
      firmwareStatus === INVALID_FILE ||
      firmwareStatus === INVALID_SERVICE
    ) {
      this.setState({ isUpdating: false }, this.failedUpdateHandler);
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

    // Initiate getting of latest device information
    this.props.dispatch(deviceActions.getInfo());

    Alert.alert(
      'Success',
      'You have successfully updated your Backbone!',
      [{ text: 'OK', onPress: this.props.navigator.pop }]
    );
  }

  @autobind
  failedUpdateHandler() {
    BootLoaderService.setHasPendingUpdate(false);

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

export default connect()(FirmwareUpdate);
