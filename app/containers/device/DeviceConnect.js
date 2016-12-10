import React, { Component } from 'react';
import {
  View,
  Alert,
  NativeModules,
} from 'react-native';
import autobind from 'autobind-decorator';
import { connect } from 'react-redux';
import routes from '../../routes';
import styles from '../../styles/device/deviceConnect';
import deviceActions from '../../actions/device';
import Spinner from '../../components/Spinner';
import HeadingText from '../../components/HeadingText';
import constants from '../../utils/constants';

const { DeviceManagementService } = NativeModules;

const { PropTypes } = React;

class DeviceConnect extends Component {
  static propTypes = {
    navigator: PropTypes.shape({
      replace: PropTypes.func,
      popToRoute: PropTypes.func,
      resetTo: PropTypes.func,
      getCurrentRoutes: PropTypes.func,
    }),
    isConnected: PropTypes.bool,
    dispatch: PropTypes.func,
    inProgress: PropTypes.bool,
    errorMessage: PropTypes.string,
  };

  componentWillMount() {
    // Check current connection status with Backbone device
    DeviceManagementService.getDeviceStatus((error, status) => {
      if (error) {
        // TODO: Handle error
      } else if (status === constants.deviceStatuses.CONNECTED) {
        // Update store, since user only able to initiate connect if isConnected is false
        this.props.dispatch(deviceActions.connect({ isConnected: true }));
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
        { text: 'Cancel', onPress: this.goBackToScene },
        { text: 'Retry', onPress: () => this.props.dispatch(deviceActions.connect()) },
      ]);
    }
  }

  // Check whether there's a saved device
  @autobind
  getSavedDevice() {
    DeviceManagementService.getSavedDevice((error, device) => {
      if (error) {
        // TODO: Handle error
      } else if (device) {
        // Saved device is found, attempt to connect
        this.props.dispatch(deviceActions.connect());
      } else {
        // There's no device, route to scene for scanning
        this.props.navigator.replace(routes.deviceScan);
      }
    });
  }

  @autobind
  goBackToScene() {
    const routebackScenes = {
      device: 'device',
      postureDashboard: 'postureDashboard',
    };

    // Loop through routeStack starting with the most recent route
    const routeStack = this.props.navigator.getCurrentRoutes().reverse();

    for (let i = 0; i < routeStack.length; i++) {
      const routeName = routeStack[i].name;
      // Route to the last route before DeviceScan / DeviceConnect
      // If it matches device or postureDashboard in that order
      if (routebackScenes[routeName]) {
        return this.props.navigator.popToRoute(routeStack[i]);
      }
    }

    // If it doesn't match a property in routebackScenes send to PostureDashboard
    return this.props.navigator.replace(routes.postureDashboard);
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
