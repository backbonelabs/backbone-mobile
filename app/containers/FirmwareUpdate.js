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
import deviceActions from '../actions/device';
import HeadingText from '../components/HeadingText';
import BodyText from '../components/BodyText';
import Button from '../components/Button';
import styles from '../styles/firmwareUpdate';
import constants from '../utils/constants';
import Fetcher from '../utils/Fetcher';

const { firmwareStatuses: {
  FIRMWARE_UPDATE_STATE_BEGIN,
  FIRMWARE_UPDATE_STATE_END_SUCCESS,
  FIRMWARE_UPDATE_STATE_END_ERROR,
} } = constants;

const { BootLoaderService, Environment } = NativeModules;
const eventEmitter = new NativeEventEmitter(BootLoaderService);
const firmwareUrl = `${Environment.API_SERVER_URL}/firmware`;

const SingleColorSpinner = MKSpinner.singleColorSpinner()
  .withStrokeColor('red')
  .withStyle(styles.spinner)
  .build();

export default class FirmwareUpdate extends Component {
  static propTypes = {
    navigator: PropTypes.shape({
      pop: PropTypes.func,
    }),
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

    this.updateFirmware();
  }

  componentWillUnmount() {
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
          }
        }))
      );
  }

  @autobind
  firmwareUpdateStatusHandler(status) {
    const { status: firmwareStatus } = status;
    if (firmwareStatus === FIRMWARE_UPDATE_STATE_BEGIN) {
      this.setState({ isUpdating: true });
    } else if (
      firmwareStatus === FIRMWARE_UPDATE_STATE_END_SUCCESS ||
      firmwareStatus === FIRMWARE_UPDATE_STATE_END_ERROR
    ) {
      const firmwareUpdateSuccess = firmwareStatus === FIRMWARE_UPDATE_STATE_END_SUCCESS;
      const firmwareAlert = firmwareUpdateSuccess ?
      { title: 'Success', message: 'You have successfully updated your Backbone!' }
      :
      { title: 'Failed', message: 'Your Backbone update has failed, please try again.' };

      // Firmware update has finished, display firmware update status message
      this.setState({ isUpdating: false }, () => {
        // If firmware was successful, get latest device info and store locally
        if (firmwareUpdateSuccess) {
          deviceActions.getInfo();
        }

        Alert.alert(
          firmwareAlert.title,
          firmwareAlert.message,
          [{ text: 'OK', onPress: () => this.props.navigator.pop() }]
        );
      });
    }
  }

  @autobind
  firmwareUploadProgressHandler(progress) {
    this.setState({ updateProgress: progress.percentage });
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <HeadingText size={2}>
            Update status
          </HeadingText>
          <View style={styles.progressContainer}>
            <MKProgress
              style={styles.progressBar}
              progress={this.state.updateProgress / 100}
              progressColor="red"
              buffer={1}
              bufferColor="#CCC"
            />
            { this.state.isUpdating === FIRMWARE_UPDATE_STATE_BEGIN &&
              <SingleColorSpinner style={styles.spinner} />
            }
          </View>
          <BodyText>Downloading updates: {this.state.updateProgress}%</BodyText>
        </View>
        <View style={styles.buttonContainer}>
          <Button disabled primary text="Done" />
        </View>
      </View>
    );
  }
}
