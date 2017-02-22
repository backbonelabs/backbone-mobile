import React, { Component } from 'react';
import {
  View,
  Alert,
} from 'react-native';
import autobind from 'autobind-decorator';
import { connect } from 'react-redux';
import routes from '../../routes';
import styles from '../../styles/device/deviceConnect';
import deviceActions from '../../actions/device';
import Spinner from '../../components/Spinner';
import HeadingText from '../../components/HeadingText';

const { PropTypes } = React;

class DeviceConnect extends Component {
  static propTypes = {
    device: PropTypes.shape({
      identifier: PropTypes.string,
    }),
    currentRoute: PropTypes.shape({
      deviceIdentifier: PropTypes.string,
    }),
    navigator: PropTypes.shape({
      push: PropTypes.func,
      replace: PropTypes.func,
      popToRoute: PropTypes.func,
      resetTo: PropTypes.func,
      getCurrentRoutes: PropTypes.func,
    }),
    isConnected: PropTypes.bool,
    dispatch: PropTypes.func,
    isConnecting: PropTypes.bool,
    errorMessage: PropTypes.string,
  };

  componentWillMount() {
    const { device, currentRoute } = this.props;
    const deviceIdentifier = device.identifier || currentRoute.deviceIdentifier;

    // If deviceIdentifier is truthy, attempt to connect to specified device
    if (deviceIdentifier) {
      this.props.dispatch(deviceActions.connect(deviceIdentifier));
    } else {
      this.props.navigator.push(routes.deviceScan);
    }
  }

  componentWillReceiveProps(nextProps) {
    // If isConnected is true, then alert the user that the
    // device has successfully connected to their smartphone
    if (!this.props.isConnected && nextProps.isConnected) {
      this.goBackToScene();
    } else if (!this.props.errorMessage && nextProps.errorMessage) {
      const deviceIdentifier = (
        nextProps.device.identifier || nextProps.currentRoute.deviceIdentifier
      );

      // Prompt user to reattempt connect upon failed attempt
      Alert.alert('Error', nextProps.errorMessage, [
        { text: 'Cancel', onPress: this.goBackToScene },
        {
          text: 'Retry',
          onPress: () => this.props.dispatch(deviceActions.connect(deviceIdentifier)),
        },
      ]);
    }
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
    return this.props.isConnecting ? (
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
