import React, { Component, PropTypes } from 'react';
import {
  View,
  NativeModules,
  NativeEventEmitter,
} from 'react-native';
import {
  MKProgress,
  MKSpinner,
} from 'react-native-material-kit';
import HeadingText from '../components/HeadingText';
import BodyText from '../components/BodyText';
import Button from '../components/Button';
import styles from '../styles/firmwareUpdate';

const { DeviceManagementService } = NativeModules;
const eventEmitter = new NativeEventEmitter(DeviceManagementService);

const SingleColorSpinner = MKSpinner.singleColorSpinner()
  .withStrokeColor('red')
  .withStyle(styles.spinner)
  .build();

export default class FirmwareUpdate extends Component {
  static propTypes = {
    firmwareUpdateComplete: PropTypes.func,
  }

  constructor() {
    super();
    this.state = {
      updateProgress: null,
    };

    this.firmwareUpdateListener = null;
  }

  componentWillMount() {
    // Listen for firmware update progress
    // this.firmwareUpdateListener = eventEmitter.addListener(
    //   'UpdateProgress',
    //   this.updateProgressHandler,
    // );
  }

  componentWillUnmount() {
    // this.firmwareUpdateListener.remove();
  }

  updateProgressHandler(progress) {
    this.setState({ updateProgress: progress }, this.props.firmwareUpdateComplete);
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
              style={{ width: 190 }}
              progress={0.2}
              progressColor="red"
              buffer={1}
              bufferColor="#CCC"
            />
            <SingleColorSpinner style={styles.spinner} />
          </View>
          <BodyText>Downloading updates: 20%</BodyText>
        </View>
        <View style={styles.buttonContainer}>
          <Button disabled primary text="Done" />
        </View>
      </View>
    );
  }
}
