import React, { Component, PropTypes } from 'react';
import {
  Image,
  View,
  Alert,
  NativeModules,
} from 'react-native';
import { connect } from 'react-redux';
import deviceActions from '../actions/device';
import gradientBackground20 from '../images/gradientBackground20.png';
import sensorSmall from '../images/settings/sensorSmall.png';
import styles from '../styles/deviceSettings';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import BodyText from '../components/BodyText';
import HeadingText from '../components/HeadingText';
import constants from '../utils/constants';
import SensitiveInfo from '../utils/SensitiveInfo';
import routes from '../routes';

const { DeviceManagementService } = NativeModules;

// const DeviceInfoItem = props => (
//   <View style={styles.deviceInfo}>
//     <HeadingText size={3}>{props.headingText}</HeadingText>
//     <BodyText style={styles._deviceInfoBodyText}>{props.bodyText}</BodyText>
//     {props.children}
//   </View>
// );

// DeviceInfoItem.propTypes = {
//   children: PropTypes.node,
//   headingText: PropTypes.string,
//   bodyText: PropTypes.string,
// };

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
    this.state = {
      device: {
        isPaired: false,
        firmwareVersion: null,
        updateAvailable: false,
      },
      inProgress: true,
    };

    this.unpairDevice = this.unpairDevice.bind(this);
    this.addDevice = this.addDevice.bind(this);
    this.updateFirmware = this.updateFirmware.bind(this);
  }

  componentWillMount() {
    if (this.props.isConnected) {
      // Get latest device information if it's currently connected
      this.props.dispatch(deviceActions.getInfo());
    } else {
      // If device isn't currently connected, fetch locally stored data, if any
      SensitiveInfo.getItem(constants.storageKeys.DEVICE)
        .then(device => {
          const stateData = { inProgress: false };
          if (device) {
            stateData.device = device;
          }
          this.setState(stateData);
        });
    }
  }

  componentWillReceiveProps(nextProps) {
    const { inProgress, device } = nextProps;
    if (this.props.inProgress && !inProgress) {
      // Save latest device information in state and local store
      this.setState({
        device,
        inProgress,
      });
    }
  }

  unpairDevice() {
    // Prompt user to confirm that they want to unpair device
    Alert.alert(
      'Are you sure?',
      'This will remove your Backbone',
      [
        { text: 'Cancel' },
        { text: 'Unpair',
          onPress: () => {
            // Reset state to defaults
            this.setState({ inProgress: true }, () => (
              DeviceManagementService.forgetDevice(error => {
                if (error) {
                  Alert.alert(
                    'Error',
                    'There was a problem unpairing your Backbone',
                    [{
                      text: 'Try Again',
                      onPress: () => this.setState({ inProgress: false }),
                    }],
                  );
                } else {
                  Alert.alert(
                    'Success',
                    'You have unpaired your Backbone',
                    [{
                      text: 'OK',
                      onPress: () => (
                        // Set device state back to defaults
                        this.setState({
                          device: {
                            isPaired: false,
                            firmwareVersion: null,
                            updateAvailable: false,
                          },
                          inProgress: false,
                        })
                      ),
                    }]
                  );
                }
              })
            ));
          },
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
          {
            text: 'Cancel',
          },
          {
            text: 'Connect',
            onPress: () => this.props.navigator.push(routes.deviceAdd),
          },
        ]
      );
    } else {
      this.setState({ inProgress: true }, () => {
        // TODO: Call native method here to update user's firmware
      });
    }
  }

  render() {
    const { device, inProgress } = this.state;

    return (
      <Image source={gradientBackground20} style={styles.backgroundImage}>
        { /* Use spinner or some sort of progress visual for actions and firmware updates */
          inProgress ?
            <Spinner />
            :
              <View style={styles.container}>
                <View style={styles.deviceInfoContainer}>
                  <Image source={sensorSmall} style={styles.sensorImage} />
                  <HeadingText size={3}>
                    Firmware Version: { device.firmwareVersion || 'n/a' }
                  </HeadingText>
                  { device.updateAvailable &&
                    <BodyText style={styles._deviceInfoBodyText}>
                      (Update Available)
                    </BodyText>
                  }
                </View>
                <View style={styles.buttonContainer}>
                  { device.isPaired ?
                    <Button primary text="UNPAIR" onPress={this.unpairDevice} />
                    :
                      <Button primary text="ADD NEW" onPress={this.addDevice} />
                  }
                  { /* Only show this button if there's a firmware update available */
                    device.updateAvailable && (
                      <Button
                        style={styles._updateButton}
                        text="UPDATE"
                        onPress={this.updateFirmware}
                      />
                    )
                  }
                </View>
              </View>
        }
      </Image>
    );
  }
}

const mapStateToProps = state => {
  const { device } = state;
  return device;
};

export default connect(mapStateToProps)(Device);
