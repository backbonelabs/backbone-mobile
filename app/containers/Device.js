import React, { Component, PropTypes } from 'react';
import {
  Image,
  View,
  Alert,
  NativeModules,
} from 'react-native';
import { connect } from 'react-redux';
import gradientBackground20 from '../images/gradientBackground20.png';
import sensorSmall from '../images/settings/sensorSmall.png';
import batteryIcon from '../images/settings/batteryIcon.png';
import styles from '../styles/device';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import BodyText from '../components/BodyText';
import HeadingText from '../components/HeadingText';
import routes from '../routes';

const { DeviceManagementService } = NativeModules;

const DeviceInfoItem = props => (
  <View style={styles.deviceInfo}>
    <HeadingText size={3}>{props.headingText}: </HeadingText>
    <BodyText style={styles._deviceInfoBodyText}>{props.bodyText || 'n/a'}</BodyText>
    {props.children}
  </View>
);

DeviceInfoItem.propTypes = {
  children: PropTypes.node,
  headingText: PropTypes.string,
  bodyText: PropTypes.string,
};

class Device extends Component {
  static propTypes = {
    navigator: PropTypes.shape({
      push: PropTypes.func,
      pop: PropTypes.func,
    }),
    isConnected: PropTypes.bool,
  };

  constructor() {
    super();
    this.state = {
      device: {
        isPaired: false,
        firmwareVersion: null,
        batteryLife: null,
        updateAvailable: false,
      },
      inProgress: false,
    };

    this.unpairDevicePrompt = this.unpairDevicePrompt.bind(this);
    this.routeToDeviceScan = this.routeToDeviceScan.bind(this);
  }

  componentWillMount() {
    // Get saved device
    if (this.props.isConnected) {
      DeviceManagementService.getSavedDevice(device => {
        // If there's a saved device, save details in component state
        if (device) {
          this.setState({ device });
        }
      });
    }
  }

  unpairDevicePrompt() {
    Alert.alert(
      'Are you sure?',
      'This will remove your Backbone',
      [
        { text: 'Cancel' },
        { text: 'Unpair', onPress: DeviceManagementService.forgetDevice },
      ]
    );
  }

  routeToDeviceScan() {
    this.props.navigator.push(routes.deviceAdd);
  }

  render() {
    const { device, inProgress } = this.state;

    return (
      <Image source={gradientBackground20} style={styles.backgroundImage}>
        { inProgress ?
          <Spinner />
          :
            <View style={styles.container}>
              <View style={styles.deviceInfoContainer}>
                <Image source={sensorSmall} style={{ marginBottom: 25 }} />
                <DeviceInfoItem
                  headingText="Status"
                  bodyText={this.props.isConnected ? 'Connected' : 'Disconnected'}
                />
                <DeviceInfoItem
                  headingText="Firmware"
                  bodyText={device.firmwareVersion ?
                    `${device.firmwareVersion} ${
                        device.updateAvailable ? '(Update Available)' : '(Up to date)'}`
                    :
                      ''
                  }
                />
                <DeviceInfoItem
                  headingText="Battery Life"
                  bodyText={device.batteryLife ? `${device.batteryLife}%` : ''}
                >
                  {device.batteryLife && <Image source={batteryIcon} style={{ marginTop: 1 }} />}
                </DeviceInfoItem>
              </View>
              <View style={styles.buttonContainer}>
                { device.isPaired ?
                  <View style={styles.buttonWrapper}>
                    <Button primary text="UNPAIR" onPress={this.unpairDevicePrompt} />
                    { /* // Only show this button if firmware is outdated
                         // TO DO: Value for seeing if there's a firmware update
                       */ }
                    { device.updateAvailable && <Button style={{ marginTop: 10 }} text="UPDATE" />}
                  </View>
                  :
                    <View style={styles.buttonWrapper}>
                      <Button primary text="ADD NEW" onPress={this.routeToDeviceScan} />
                    </View>
                }
              </View>
            </View>
        }
      </Image>
    );
  }
}

const mapStateToProps = state => {
  const { app } = state;
  return app;
};

export default connect(mapStateToProps)(Device);
