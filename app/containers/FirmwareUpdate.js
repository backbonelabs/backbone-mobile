import React, { Component, PropTypes } from 'react';
import {
  View,
  NativeModules,
  NativeEventEmitter,
} from 'react-native';
import HeadingText from '../components/HeadingText';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import styles from '../styles/firmwareUpdate';

const { DeviceManagementService } = NativeModules;
const eventEmitter = new NativeEventEmitter(DeviceManagementService);

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
    this.firmwareUpdateListener = eventEmitter.addListener(
      'UpdateProgress',
      this.updateProgressHandler,
    );
  }

  componentWillUnmount() {
    this.firmwareUpdateListener.remove();
  }

  updateProgressHandler(progress) {
    this.setState({ updateProgress: progress }, this.props.firmwareUpdateComplete);
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={{ flex: 0.5, width: 300, justifyContent: 'flex-end', paddingBottom: 15 }}>
          <HeadingText size={3} style={{ paddingBottom: 15 }}>
            Updating status
          </HeadingText>
          <Spinner style={{ alignSelf: 'center', justifyContent: 'flex-start' }} />
        </View>
        <View style={{ flex: 0.5 }}>
          <Button disabled primary text="Done" />
        </View>
      </View>
    );
  }
}
