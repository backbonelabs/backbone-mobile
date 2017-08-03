import React, { Component } from 'react';
import {
  View,
  Image,
  Alert,
  NativeModules,
} from 'react-native';
import autobind from 'class-autobind';
import { connect } from 'react-redux';
import routes from '../../routes';
import constants from '../../utils/constants';
import SensitiveInfo from '../../utils/SensitiveInfo';
import styles from '../../styles/device/deviceConnect';
import deviceActions from '../../actions/device';
import Spinner from '../../components/Spinner';
import HeadingText from '../../components/HeadingText';
import appActions from '../../actions/app';
import theme from '../../styles/theme';
import deviceErrorIcon from '../../images/settings/device-error-icon.png';

const { BluetoothService } = NativeModules;
const { bluetoothStates, storageKeys } = constants;
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

  constructor(props) {
    super(props);
    autobind(this);
  }

  componentWillMount() {
    const { device, currentRoute } = this.props;

    const deviceIdentifier = device.identifier || currentRoute.deviceIdentifier;

    BluetoothService.getState((error, { state }) => {
      if (!error) {
        if (state === bluetoothStates.ON) {
          // If deviceIdentifier is truthy, attempt to connect to specified device
          if (deviceIdentifier) {
            this.props.dispatch(deviceActions.connect(deviceIdentifier));
          } else {
            // Attempt to use saved device identifier, if any
            SensitiveInfo.getItem(storageKeys.DEVICE)
              .then(savedDevice => {
                if (savedDevice) {
                  this.props.dispatch(deviceActions.connect(savedDevice.identifier));
                } else {
                  this.props.navigator.replace(routes.deviceScan);
                }
              });
          }
        } else {
          this.showBluetoothError();
        }
      } else {
        this.showBluetoothError();
      }
    });
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

      BluetoothService.getState((error, { state }) => {
        if (!error) {
          if (state === bluetoothStates.ON) {
            // Prompt user to reattempt connect upon failed attempt
            this.props.dispatch(appActions.showPartialModal({
              topView: (
                <Image source={deviceErrorIcon} />
              ),
              title: {
                caption: 'Connection Failed',
                color: theme.warningColor,
              },
              detail: {
                caption: nextProps.errorMessage,
              },
              buttons: [
                {
                  caption: 'CANCEL',
                  onPress: () => {
                    this.props.dispatch(appActions.hidePartialModal());
                    this.goBackToScene();
                  },
                },
                {
                  caption: 'RETRY',
                  onPress: () => {
                    this.props.dispatch(appActions.hidePartialModal());

                    if (deviceIdentifier) {
                      this.props.dispatch(deviceActions.connect(deviceIdentifier));
                    } else {
                      // Attempt to use saved device identifier, if any
                      SensitiveInfo.getItem(storageKeys.DEVICE)
                        .then(savedDevice => {
                          if (savedDevice) {
                            this.props.dispatch(deviceActions.connect(savedDevice.identifier));
                          } else {
                            this.props.navigator.replace(routes.deviceScan);
                          }
                        });
                    }
                  },
                },
              ],
            }));
          } else {
            this.showBluetoothError();
          }
        } else {
          this.showBluetoothError();
        }
      });
    }
  }

  goBackToScene() {
    const routebackScenes = {
      onboarding: 'onboarding',
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
        if (routebackScenes[routeName] === 'onboarding') {
          this.props.dispatch(appActions.nextStep());
        }
        return this.props.navigator.popToRoute(routeStack[i]);
      }
    }

    // If it doesn't match a property in routebackScenes send to PostureDashboard
    return this.props.navigator.replace(routes.postureDashboard);
  }

  showBluetoothError() {
    Alert.alert('Error', 'Bluetooth is off. Turn on Bluetooth before continuing.');
    this.goBackToScene();
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
