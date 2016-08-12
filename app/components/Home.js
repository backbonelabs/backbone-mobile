import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  Alert,
  NativeModules,
  ActivityIndicator,
  TouchableHighlight,
} from 'react-native';
import logo from '../images/logo.png';
import styles from '../styles/home';
import routes from '../routes';

const DeviceManagementService = NativeModules.DeviceManagementService;

export default class Home extends Component {
  static propTypes = {
    navigator: React.PropTypes.object,
  };

  constructor() {
    super();
    this.state = {
      connecting: false,
    };

    this.initiateConnect = this.initiateConnect.bind(this);
    this.handleConnectError = this.handleConnectError.bind(this);
    this.unpairDevice = this.unpairDevice.bind(this);
  }

  initiateConnect() {
    this.setState({
      connecting: true,
    }, () => {
      DeviceManagementService.checkForSavedDevice((error, response) => {
        if (error) {
          this.handleConnectError(error);
        } else if (!response) {
          this.props.navigator.push(routes.devices);
        } else {
          this.props.navigator.push(routes.posture);
        }
      });
    });
  }

  handleConnectError(error) {
    this.setState({
      connecting: false,
    }, () => {
      Alert.alert(
        'Error!',
        error.message,
        [
          { text: 'Try Again' },
          { text: 'Unpair Backbone', onPress: this.unpairDevice },
        ]);
    });
  }

  unpairDevice() {
    DeviceManagementService.forgetDevice();
  }

  render() {
    return (
      <View style={styles.container}>
        <Image style={styles.logo} source={logo} />
        {this.state.connecting ?
          (<View style={styles.disabled}>
            <ActivityIndicator
              animating
              color="white"
              size="large"
            />
            <Text style={styles.connectingText}>Connecting...</Text>
          </View>) :
          (<TouchableHighlight style={styles.button} onPress={this.initiateConnect}>
            <Text style={styles.buttonText}>Go</Text>
          </TouchableHighlight>)
        }
      </View>
    );
  }
}
