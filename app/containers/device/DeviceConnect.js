import React, { Component } from 'react';
import {
  View,
  Alert,
  NativeModules,
} from 'react-native';
import { connect } from 'react-redux';
import routes from '../../routes';
import appActions from '../../actions/app.js';
import styles from '../../styles/device/deviceConnect';
import Spinner from '../../components/Spinner';
import HeadingText from '../../components/HeadingText';
import Button from '../../components/Button';
import constants from '../../utils/constants';

const { DeviceManagementService } = NativeModules;

const { PropTypes } = React;

class DeviceConnect extends Component {
  static propTypes = {
    navigator: PropTypes.shape({
      replace: PropTypes.func,
    }),
    isConnected: PropTypes.bool,
    dispatch: PropTypes.func,
    inProgress: PropTypes.bool,
    errorMessage: PropTypes.string,
  };

  constructor() {
    // Not doing much in constructor, but need component lifecycle methods
    super();
    this.state = {};
    this.cancelConnect = this.cancelConnect.bind(this);
    this.getSavedDevice = this.getSavedDevice.bind(this);
  }

  componentWillMount() {
    // Check current connection status with Backbone device
    DeviceManagementService.getDeviceStatus((status) => {
      if (status === constants.deviceStatuses.CONNECTED) {
        this.props.navigator.replace(routes.postureDashboard);
      } else {
        this.getSavedDevice();
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    // If isConnected is true, then alert the user that the
    // device has successfully connected to their smartphone
    if (!this.props.isConnected && nextProps.isConnected) {
      Alert.alert('Success', 'Connected', [
        { text: 'Continue', onPress: () => this.props.navigator.replace(routes.postureDashboard) }
      ]);
    } else if (!this.props.errorMessage && nextProps.errorMessage) {
      // Prompt user to reattempt connect upon failed attempt
      Alert.alert('Error', nextProps.errorMessage, [
        { text: 'Cancel', onPress: () => this.props.navigator.replace(routes.postureDashboard) },
        { text: 'Retry', onPress: this.getSavedDevice },
      ]);
    }
  }

  // Check whether there's a saved device
  getSavedDevice() {
    DeviceManagementService.getSavedDevice((device) => {
      if (device) {
        // Saved device is found, attempt to connect
        this.props.dispatch(appActions.connect());
      } else {
        // There's no device, route to scene for scanning
        this.props.navigator.replace(routes.deviceScan);
      }
    });
  }

  cancelConnect() {
    // TO DO: Call native module method for canceling connect
    this.props.navigator.replace(routes.postureDashboard);
  }

  render() {
    return this.props.inProgress && (
      <View style={styles.container}>
        <View style={styles.bodyContainer}>
          <View style={styles.spinnerContainer}>
            <Spinner style={styles._spinner} />
          </View>
          <View style={styles.textContainer}>
            <HeadingText size={2}>Connecting...</HeadingText>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <Button
            primary
            text="Cancel"
            onPress={this.cancelConnect}
          />
        </View>
      </View>
    );
  }
}

const mapStateToProps = state => {
  const { app } = state;
  return app;
};

export default connect(mapStateToProps)(DeviceConnect);
