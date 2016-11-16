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
import routes from '../routes';

const { DeviceManagementService } = NativeModules;

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
        firmwareVersion: null,
        batteryLife: null,
        updateAvailable: false,
      },
      inProgress: false,
    };

    this.unpairDevicePrompt = this.unpairDevicePrompt.bind(this);
  }

  componentWillMount() {
    // Get saved device
    DeviceManagementService.getSavedDevice(device => {
      // If there's a saved device, save details in component state
      // if (device) {
      //   this.setState({ device });
      // }

      // Placeholder
      this.setState({
        device: {
          firmwareVersion: 0.1,
          batteryLife: 100,
          updateAvailable: true,
        },
      });
    });
  }

  unpairDevicePrompt() {
    Alert.alert(
      'Are you sure?',
      'This will disconnect and\n unpair your Backbone',
      [
        { text: 'Cancel' },
        { text: 'Unpair', onPress: DeviceManagementService.forgetDevice },
      ]
    );
  }

  routeToDeviceScan() {
    this.props.navigator.push(routes.deviceScan);
  }

  render() {
    const { device } = this.state;
    const firmwareVersion = `${device.firmwareVersion}${device.updateAvailable ? '(Update Available)' : ''}`;

    console.log('device', device);

    return (
      <Image source={gradientBackground20} style={styles.backgroundImage}>
        { this.state.inProgress ?
          <Spinner />
          :
            <View style={styles.container}>
              <View style={{ flex: 0.6, alignItems: 'center', justifyContent: 'flex-end' }}>
                <Image source={sensorSmall} style={{ marginBottom: 25 }} />
                <BodyText style={{ marginBottom: 5 }}>
                  Status: { this.props.isConnected ? 'Connected' : 'Disconnected' }
                </BodyText>
                <BodyText style={{ marginBottom: 5 }}>
                  { /* // Only show this button if firmware is outdated
                    // TO DO: Value for seeing if there's a firmware update
                  */ }
                  Firmware: { device ? firmwareVersion : '---' }
                </BodyText>
                <View style={{ flexDirection: 'row' }}>
                  <BodyText style={{ marginBottom: 25 }}>Battery Life: 100%</BodyText>
                  <Image source={batteryIcon} style={{ margin: 4 }} />
                </View>
              </View>
              <View style={{ flex: 0.4, alignItems: 'center', justifyContent: 'center' }}>
                { device ?
                  <View style={{ flex: 1 }}>
                    <Button primary text="UNPAIR" onPress={this.unpairDevicePrompt} />
                    { /* // Only show this button if firmware is outdated
                         // TO DO: Value for seeing if there's a firmware update
                       */ }
                    <Button style={{ marginTop: 10 }} text="UPDATE" />
                  </View>
                  :
                  <View style={{ flex: 1 }}>
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
}

export default connect(mapStateToProps)(Device);
