import React, { Component, PropTypes } from 'react';
import {
  Image,
  View,
  Alert,
} from 'react-native';
import { connect } from 'react-redux';
import deviceActions from '../actions/device';
import sensorSmall from '../images/settings/sensorSmall.png';
import styles from '../styles/deviceSettings';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import BodyText from '../components/BodyText';
import HeadingText from '../components/HeadingText';
import routes from '../routes';

class Device extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    navigator: PropTypes.shape({
      push: PropTypes.func,
    }),
    isConnected: PropTypes.bool,
    inProgress: PropTypes.bool,
    device: PropTypes.shape({
      batteryLevel: PropTypes.number,
      firmwareVersion: PropTypes.string,
    }),
  };

  constructor() {
    super();

    this.unpairDevice = this.unpairDevice.bind(this);
    this.addDevice = this.addDevice.bind(this);
    this.updateFirmware = this.updateFirmware.bind(this);
  }

  componentWillMount() {
    // Get latest device information if it's currently connected
    this.props.dispatch(deviceActions.getInfo(this.props.isConnected));
  }

  unpairDevice() {
    // Prompt user to confirm that they want to unpair device
    Alert.alert(
      'Are you sure?',
      'This will remove your Backbone',
      [
        { text: 'Cancel' },
        {
          text: 'Unpair',
          onPress: () => this.props.dispatch(deviceActions.forget()),
        },
      ]
    );
  }

  addDevice() {
    // Navigate to deviceAdd route
    this.props.navigator.push(routes.deviceAdd);
  }

  updateFirmware() {
    if (!this.props.isConnected) {
      Alert.alert(
          'Error',
          'Device not found, please connect to your Backbone before updating.',
        [
          { text: 'Cancel' },
          {
            text: 'Connect',
            onPress: () => this.props.navigator.push(routes.deviceAdd),
          },
        ]
      );
    }
  }

  render() {
    const { device, inProgress } = this.props;

    return inProgress ?
      <Spinner />
      :
        <View style={styles.container}>
          <View style={styles.deviceInfoContainer}>
            <Image source={sensorSmall} style={styles.sensorImage} />
            <HeadingText size={3}>
              Firmware Version: { (device && device.firmwareVersion) ? device.firmwareVersion
                : 'n/a'
              }
            </HeadingText>
            { device && device.updateAvailable &&
              <BodyText style={styles._deviceInfoBodyText}>
                (Update Available)
              </BodyText>
            }
          </View>
          <View style={styles.buttonContainer}>
            { device && device.firmwareVersion ?
              <Button primary text="UNPAIR" onPress={this.unpairDevice} />
              :
                <Button primary text="ADD NEW" onPress={this.addDevice} />
            }
            { /* Only show this button if there's a firmware update available */
              device && device.updateAvailable && (
                <Button
                  style={styles._updateButton}
                  text="UPDATE"
                  onPress={this.updateFirmware}
                />
              )
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
