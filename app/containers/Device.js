import React, { Component, PropTypes } from 'react';
import {
  Image,
  View,
  Alert,
  NativeModules,
} from 'react-native';
import autobind from 'class-autobind';
import { connect } from 'react-redux';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import deviceActions from '../actions/device';
import deviceOrangeIcon from '../images/settings/device-orange-icon.png';
import styles from '../styles/deviceSettings';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import BodyText from '../components/BodyText';
import SecondaryText from '../components/SecondaryText';
import routes from '../routes';
import constants from '../utils/constants';

const { BluetoothService } = NativeModules;

const { bluetoothStates } = constants;

class Device extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    navigator: PropTypes.shape({
      push: PropTypes.func,
    }),
    isConnected: PropTypes.bool,
    isConnecting: PropTypes.bool,
    inProgress: PropTypes.bool,
    device: PropTypes.shape({
      batteryLevel: PropTypes.number,
      firmwareVersion: PropTypes.string,
    }),
  };

  constructor(props) {
    super(props);
    autobind(this);
  }

  addDevice() {
    BluetoothService.getState((error, { state }) => {
      if (!error) {
        if (state === bluetoothStates.ON) {
          this.props.navigator.push(routes.deviceAdd);
        } else {
          this.showBluetoothError();
        }
      } else {
        this.showBluetoothError();
      }
    });
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

  showBluetoothError() {
    Alert.alert('Error', 'Bluetooth is off. Turn on Bluetooth before continuing.');
  }

  updateFirmware() {
    const { batteryLevel } = this.props.device;
    if (!this.props.isConnected) {
      Alert.alert(
        'Error',
        'Please connect to your Backbone before updating.',
        [
          { text: 'Cancel' },
          {
            text: 'Connect',
            onPress: () => this.props.navigator.push(routes.deviceConnect),
          },
        ]
      );
    } else if (batteryLevel >= 0 && batteryLevel <= 15) {
      Alert.alert(
        'Battery Low',
        'Charge your Backbone to at least 15% power before updating.',
      );
    } else {
      Alert.alert(
        'Attention',
        'You must complete the firmware update once it begins!',
        [
          { text: 'Cancel' },
          { text: 'Update', onPress: () => this.props.navigator.push(routes.firmwareUpdate) },
        ]
      );
    }
  }

  render() {
    const { device, inProgress, isConnecting } = this.props;
    const batteryIcon = 'battery-three-quarters';

    return inProgress || isConnecting ?
      <Spinner />
      :
        <View style={styles.container}>
          <View style={styles.deviceInfoContainer}>
            <BodyText style={styles._deviceConnectionText}>
              Connected to MY BACKBONE
            </BodyText>
            <Image source={deviceOrangeIcon} style={styles.sensorImage} />
            <View style={styles.batteryInfo}>
              <SecondaryText style={styles._batteryInfoText}>
                { device.batteryLevel || '--' }%{'  '}
              </SecondaryText>
              <FontAwesomeIcon name={batteryIcon} style={styles.batteryIconRed} />
            </View>
            <SecondaryText style={styles._deviceInfoText}>
              Device: { device.firmwareVersion || 'n/a' }
            </SecondaryText>
            <SecondaryText style={styles._deviceInfoText}>
              Version: { device.firmwareVersion || 'n/a' }
            </SecondaryText>
            { device.updateAvailable &&
              <BodyText style={styles._deviceInfoBodyText}>
                (Update Available)
              </BodyText>
            }
          </View>
          <View style={styles.buttonContainer}>
            { device.firmwareVersion ?
              <Button
                primary
                style={styles._button}
                text="DISCONNECT"
                onPress={this.unpairDevice}
              />
              :
                <Button
                  primary
                  text="ADD NEW"
                  onPress={this.addDevice}
                />
            }
            { /* Enable this button if there's a firmware update available */
              <Button
                primary
                style={styles._button}
                text="UPDATE"
                onPress={this.updateFirmware}
                disabled={!device.updateAvailable}
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
