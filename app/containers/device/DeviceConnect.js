import React, { Component } from 'react';
import {
  View,
  Alert,
  NativeModules,
} from 'react-native';
import { connect } from 'react-redux';
import routes from '../../routes';
import styles from '../../styles/device/deviceConnect';
import deviceActions from '../../actions/device';
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
      popToRoute: PropTypes.func,
      getCurrentRoutes: PropTypes.func,
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
    this.goBackToScene = this.goBackToScene.bind(this);
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
        { text: 'Continue', onPress: this.goBackToScene },
      ]);
    } else if (!this.props.errorMessage && nextProps.errorMessage) {
      // Prompt user to reattempt connect upon failed attempt
      Alert.alert('Error', nextProps.errorMessage, [
        { text: 'Cancel', onPress: () => this.props.navigator.replace(routes.postureDashboard) },
        { text: 'Retry', onPress: () => this.props.dispatch(deviceActions.connect()) },
      ]);
    }
  }

  // Check whether there's a saved device
  getSavedDevice() {
    DeviceManagementService.getSavedDevice((device) => {
      if (device) {
        // Saved device is found, attempt to connect
        this.props.dispatch(deviceActions.connect());
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

  // TO DO: Implement below method once figured out discrepancy
  // between navigator's routeStack and getCurrentRoutes
  goBackToScene() {
    const routeStack = this.props.navigator.getCurrentRoutes().reverse();

    for (let i = 0; i < routeStack.length; i++) {
      if (routeStack[i].name !== 'DeviceConnect' && routeStack[i].name !== 'DeviceScan') {
        return this.props.navigator.popToRoute(routeStack[i]);
      }
    }
  }

  render() {
    return this.props.inProgress ? (
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
    )
    :
      <View />;
  }
}

const mapStateToProps = state => {
  const { device } = state;
  return device;
};

export default connect(mapStateToProps)(DeviceConnect);
