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
import styles from '../styles/deviceSettings';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import BodyText from '../components/BodyText';
import HeadingText from '../components/HeadingText';
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
    navigator: PropTypes.shape({
      push: PropTypes.func,
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

    this.unpairDevice = this.unpairDevice.bind(this);
    this.addDevice = this.addDevice.bind(this);
  }

  componentWillMount() {
    // Get saved device information
    DeviceManagementService.getSavedDevice(device => (
      // If there's a saved device, save its details in state
      device && this.setState({ device })
    ));
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
            this.setState({
              device: {
                isPaired: false,
                firmwareVersion: null,
                batteryLife: null,
                updateAvailable: false,
              },
              inProgress: true,
            }, () => (
              DeviceManagementService.forgetDevice(error => {
                if (error) {
                  Alert.alert(
                    'Error',
                    'There was a problem unpairing your Backbone',
                    [{ text: 'Try Again' }],
                  );
                }
                this.setState({ inProgress: false });
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
                    device.updateAvailable && <Button style={{ marginTop: 10 }} text="UPDATE" />
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
